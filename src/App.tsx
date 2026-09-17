import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Potree, ClipMode } from 'potree-core';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    potree: Potree;
    pointClouds: any[];
  } | null>(null);

  const [command, setCommand] = useState('');
  const [status, setStatus] = useState('点云加载中...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.set(0, 10, 30);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const controls = new OrbitControls(camera, canvasRef.current);
    controls.target.set(0, 5, 0);
    controls.update();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const potree = new Potree();
    const pointClouds: any[] = [];

    potree
      .loadPointCloud('data/lion_takanawa/cloud.js', (url: string) => `data/lion_takanawa/${url}`)
      .then((pco: any) => {
        scene.add(pco);
        pointClouds.push(pco);
        setStatus('点云加载完成，输入指令试试');
        setLoading(false);
      })
      .catch((err: Error) => {
        setStatus('点云加载失败：' + err.message);
        setLoading(false);
      });

    sceneRef.current = { scene, camera, renderer, controls, potree, pointClouds };

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (sceneRef.current) {
        const { potree, pointClouds, camera, renderer, controls } = sceneRef.current;
        if (potree && pointClouds.length > 0) {
          potree.updatePointClouds(pointClouds, camera, renderer);
        }
        controls.update();
        renderer.render(scene, camera);
      }
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const sendCommand = async () => {
    if (!command.trim()) return;
    setStatus('AI 解析中...');

    try {
      const res = await fetch('http://localhost:8000/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: command }),
      });
      const data = await res.json();

      if (data.filter && data.filter.minHeight !== undefined) {
        applyHeightFilter(data.filter.minHeight);
        setStatus(`已应用：高度 > ${data.filter.minHeight}m`);
      } else if (data.filter && data.filter.clipBox) {
        applyClipBox(data.filter.clipBox);
        setStatus(`已应用：裁剪区域`);
      } else {
        setStatus('AI 返回了无法识别的指令');
      }
    } catch (err) {
      setStatus('请求失败：' + (err as Error).message);
    }
  };

  const applyHeightFilter = (minHeight: number) => {
    if (!sceneRef.current) return;
    const { pointClouds } = sceneRef.current;
    const size = new THREE.Vector3(200, 200, 200);
    const position = new THREE.Vector3(0, minHeight, 0);
    const clipBox = new THREE.Box3().setFromCenterAndSize(position, size);

    pointClouds.forEach((pco) => {
      if (pco.material) {
        pco.material.clipMode = ClipMode.CLIP_INSIDE;
        pco.material.setClipBoxes([clipBox]);
      }
    });
  };

  const applyClipBox = (boxConfig: { size: number[]; position: number[] }) => {
    if (!sceneRef.current) return;
    const { pointClouds } = sceneRef.current;
    const size = new THREE.Vector3(...boxConfig.size);
    const position = new THREE.Vector3(...boxConfig.position);
    const clipBox = new THREE.Box3().setFromCenterAndSize(position, size);

    pointClouds.forEach((pco) => {
      if (pco.material) {
        pco.material.clipMode = ClipMode.HIGHLIGHT_INSIDE;
        pco.material.setClipBoxes([clipBox]);
      }
    });
  };

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} />
      {loading && <div className="loading">点云加载中...</div>}
      <div className="status">{status}</div>
      <div className="ai-panel">
        <input
          className="ai-input"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && sendCommand()}
          placeholder="输入指令，如：只显示高度超过 10 米的点"
        />
        <button className="ai-btn" onClick={sendCommand}>
          执行
        </button>
      </div>
    </div>
  );
}

export default App;