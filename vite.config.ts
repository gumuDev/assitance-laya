import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite acceso desde la red
    allowedHosts: ['.ngrok-free.app', '.ngrok.io'], // Permite dominios de ngrok
  },
})
