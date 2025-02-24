import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import stripComments from 'vite-plugin-strip-comments'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), stripComments({ type: 'none' })],
  build: {
    manifest: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: [
      '2db7-151-28-249-128.ngrok-free.app', // Aggiungi l'host qui
    ],
  },
})
