// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import os from 'os';

const home = os.homedir(); // '/Users/drruby'
const keyPath  = path.join(home, 'ruby_projects', 'localhost+2-key.pem');
const certPath = path.join(home, 'ruby_projects', 'localhost+2.pem');
console.log({ keyPath, certPath });

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/sass/abstracts/variables";`,
      },
    },
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
        target:      'https://localhost:3001',
        changeOrigin: true,
        secure:      false,  // allow self‑signed
      },
    },
  },
  build: {
    sourcemap: true,
  },
});
