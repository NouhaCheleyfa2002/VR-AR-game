import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    allowedHosts: [
      '549040f67917.ngrok-free.app', // Your specific ngrok domain
      '.ngrok-free.app' // Allow all ngrok free domains
    ] // Allow all hosts (for ngrok)
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