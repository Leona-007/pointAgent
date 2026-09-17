import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  // 部署到 GitHub Pages 时取消下面这行注释，并改成你的仓库名
  // base: '/point-cloud/',
});