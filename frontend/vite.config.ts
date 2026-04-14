import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
//import mkcert from 'vite-plugin-mkcert'
import stripComments from 'vite-plugin-strip-comments'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tailwindcss(),
    stripComments({ type: 'none' }),
    //    mkcert(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
  },
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    commonjsOptions: {
      include: [/onnxruntime-web/, /node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // React core (no external deps, safe to manually chunk)
          'react-vendor': ['react', 'react-dom', 'react-router'],
          // Standalone libraries with no React dependency (safe to manually chunk)
          'supabase-vendor': ['@supabase/supabase-js'],
          'tensorflow-vendor': ['@tensorflow/tfjs'],
          'xlsx-vendor': ['xlsx'],
        },
      },
    },
  },
})
