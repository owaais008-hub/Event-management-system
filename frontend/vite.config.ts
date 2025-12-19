import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: false, // Will try the next available port if 5173 is in use
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // For production build, we don't need proxy as frontend and backend are on same domain
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})