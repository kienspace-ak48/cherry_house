import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Chỉ proxy admin auth (login/logout), không proxy /oauth/* của React SPA
      '^/auth/(login|logout|register|admin)': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    /** Khớp với CLIENT_DIST_PATH trong backend/src/config/myPath.config.js */
    outDir: '../backend/client',
    emptyOutDir: true,
  },
})
