import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
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
    mkcert(),
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
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router'],
          // Heavy data/query libraries
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-virtual'],
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-switch',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-progress',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
          ],
          // i18n
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
          // Charts (only loaded on overview)
          'charts-vendor': ['recharts'],
          // Heavy utility libraries
          'tensorflow-vendor': ['@tensorflow/tfjs'],
          'xlsx-vendor': ['xlsx'],
        },
      },
    },
  },
})
