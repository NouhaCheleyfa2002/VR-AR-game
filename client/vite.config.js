import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync('../192.168.100.233+2-key.pem'),
      cert: fs.readFileSync('../192.168.100.233+2.pem')
    },
    proxy: {
      '/api/n8n': {
        target: 'http://192.168.100.233:5678',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, '/webhook')
      }
    }
  },
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/xr'
    ]
  },
  resolve: {
    dedupe: ['three']
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/xr']
        }
      }
    }
  }
})