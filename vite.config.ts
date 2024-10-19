// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

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
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../amigos_unite_api/config/ssl/localhost.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '../amigos_unite_api/config/ssl/localhost.crt')),
    },
    host: 'localhost',
    port: 5173, // Vite's development server port
    proxy: {
      '/api': {
        target: 'https://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
  },
});