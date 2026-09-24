import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // En desarrollo, las llamadas a /api se reenvían al backend (en producción lo hace Nginx).
    proxy: { '/api': 'http://localhost:3000' },
    fs: { allow: ['..'] },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
  },
});
