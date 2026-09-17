# PointAgent

一个基于 React + Three.js + Potree 的 3D 点云可视化与 AI 指令交互应用，支持在浏览器中加载大规模点云数据，并通过自然语言命令快速应用高度过滤或裁剪盒控制显示区域。

## 项目简介

本项目将点云可视化、交互控制和 AI 语义解析结合在一个前端应用中。用户可直接在页面中查看 3D 点云场景，利用输入框发送自然语言指令，例如：“只显示高度超过 10 米的点”或“裁剪出局部区域”，前端会将这些指令转发到本地 AI 解析接口，并应用到 Potree 点云材质的裁剪逻辑中。

该项目适用于：

- 3D 点云展示与浏览
- 建筑/地形/扫描数据可视化
- AI 驱动的交互式筛选
- DEM / LiDAR / 扫描点云分析场景原型

## 功能特性

- 3D 点云加载与渲染
  - 使用 Three.js 和 Potree 实现点云场景展示
  - 支持 OrbitControls 旋转、缩放、平移视角
- 自然语言过滤
  - 前端输入命令，调用本地解析服务
  - 支持高度过滤和裁剪区域控制
- 动态裁剪逻辑
  - 通过 `ClipMode` 应用点云裁剪盒
  - 可控制仅显示满足条件的内部点云
- 响应式界面
  - 简洁的可视化交互面板
  - 状态提示与加载状态展示

## 技术栈

- React 19
- TypeScript
- Vite
- Three.js
- Potree Core
- Oxlint

## 项目结构

```text
point-cloud/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ public/
│  ├─ favicon.svg
│  └─ icons.svg
├─ src/
│  ├─ App.tsx
│  ├─ App.css
│  ├─ index.css
│  ├─ main.tsx
│  └─ assets/
├─ dist/
├─ node_modules/
├─ .gitignore
├─ .oxlintrc.json
└─ README.md
```

## 运行环境要求

- Node.js 18+
- npm 9+
- 现代浏览器（Chrome / Edge / Firefox 最新版）
- 可用的点云数据文件

## 安装与启动

1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm run dev
```

3. 访问浏览器中的本地地址：

```text
http://localhost:5173
```

## 使用方式

### 1. 点云加载

应用启动后会尝试加载点云数据，默认路径为：

```text
data/lion_takanawa/cloud.js
```

如果数据文件不存在或路径不正确，页面会显示“点云加载失败”状态。

### 2. AI 指令交互

在页面底部输入框中输入自然语言指令，例如：

```text
只显示高度超过 10 米的点
显示高于 15 米的区域
裁剪出一个局部区域
```

前端会向本地服务发送请求：

```text
http://localhost:8000/parse
```

服务返回的过滤规则会被转换为点云裁剪盒，并立即更新场景显示。

### 3. 交互操作

- 左键拖动：旋转视角
- 右键拖动：平移
- 滚轮：缩放
- 视角可实时调整，以分析点云几何结构

## 关键实现说明

### 点云渲染

核心逻辑位于 `src/App.tsx`，应用在 `useEffect` 中创建：

- `THREE.Scene`
- `PerspectiveCamera`
- `WebGLRenderer`
- `OrbitControls`
- `Potree` 实例

随后通过 `potree.loadPointCloud()` 加载点云并进入动画循环更新渲染。

### AI 指令应用

当用户输入命令后，前端会发送：

```json
{
  "query": "只显示高度超过 10 米的点"
}
```

接口返回 `filter` 数据后，应用会调用：

- `applyHeightFilter()`：基于高度创建裁剪盒
- `applyClipBox()`: 基于区域尺寸和位置应用局部裁剪

### 裁剪模式

项目使用 Potree 的 `ClipMode`：

- `CLIP_INSIDE`：裁剪掉外部点，只显示内部点
- `HIGHLIGHT_INSIDE`：突出显示内部区域

## 常见问题

### 1. 点云没有显示

请检查以下内容：

- 是否已正确放置 `data/lion_takanawa/cloud.js`
- 是否在浏览器控制台中看到加载错误
- 是否网络请求正常返回

### 2. AI 命令没有生效

请确认：

- 后端解析服务已在 `http://localhost:8000` 运行
- 服务返回 JSON 格式符合前端期望结构
- 命令文本清晰且可被解析器识别

### 3. 构建失败

执行：

```bash
npm run build
```

如果出现类型错误或依赖问题，请检查：

- Node.js 版本是否符合要求
- `node_modules` 是否已安装完整
- TypeScript 相关依赖是否正常解析

## 开发说明

本项目默认使用 Vite 开发模式，适合快速迭代与点云场景调试。

如果需要部署到生产环境，可在 `vite.config.ts` 中启用自定义 `base` 配置，并将静态资源路径正确设置为发布目录。

## 适合场景

- LiDAR 数据研究
- 3D 扫描可视化
- BIM / 工程点云展示
- AI 实验场景原型

## 结语

PointAgent 将可视化分析与 AI 指令控制结合起来，帮助用户更自然地浏览和筛选 3D 点云数据。它适合作为点云场景原型、交互界面实验和三维数据探索工具的基础模板。
