import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    /** Khớp với CLIENT_DIST_PATH trong backend/src/config/myPath.config.js */
    outDir: '../backend/client',
    emptyOutDir: true,
  },
})
