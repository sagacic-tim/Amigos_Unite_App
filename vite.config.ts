// vite.config.ts
import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'
import path             from 'node:path';
import fs               from 'node:fs';
import os               from 'node:os';

const home     = os.homedir()
const keyPath  = path.join(home, 'ruby_projects', 'localhost+2-key.pem')
const certPath = path.join(home, 'ruby_projects', 'localhost+2.pem')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {}
    }
  },
  server: {
    host: 'localhost',
    port: 5173,
    https: {
      key:  fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
    proxy: {
      '/api': {
        target:       'https://localhost:3001',
        changeOrigin: true,
        secure:       false, // allow self-signed
      },
    },
  },
  build: {
    sourcemap: true,       // CSS/JS sourcemaps in prod
  }
})
