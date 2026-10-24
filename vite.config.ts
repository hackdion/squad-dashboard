import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 项目站：https://hackdion.github.io/squad-dashboard/
export default defineConfig({
  base: '/squad-dashboard/',
  plugins: [react()],
  build: { target: 'es2020', chunkSizeWarningLimit: 900 },
});
