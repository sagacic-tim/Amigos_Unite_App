// vite.config.ts
import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import path             from 'node:path';
import fs               from 'node:fs';
import os               from 'node:os';
import { fileURLToPath, URL } from 'node:url';

// Only used in dev (command === 'serve')
function resolveDevHttps() {
  const home     = os.homedir();
  const keyPath  = path.join(home, 'ruby_projects', 'localhost+2-key.pem');
  const certPath = path.join(home, 'ruby_projects', 'localhost+2.pem');

  try {
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key:  fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    } else {
      console.warn(
        `[vite.config] HTTPS key/cert not found at:
  key:  ${keyPath}
  cert: ${certPath}
→ Dev server will run over HTTP.`
      );
      return undefined;
    }
  } catch (err) {
    console.warn(
      `[vite.config] Failed to read HTTPS key/cert: ${(err as Error).message}. Falling back to HTTP.`
    );
    return undefined;
  }
}

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const httpsConfig = isDev ? resolveDevHttps() : undefined;

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@':      path.resolve(__dirname, './src'),
        '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      },
    },

    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {},
      },
    },

    server: {
      host: 'localhost',   // keep your current behavior
      port: 5173,
      https: httpsConfig,  // may be undefined → HTTP dev server
      proxy: {
        '/api': {
          target:       'https://localhost:3001',
          changeOrigin: true,
          secure:       false, // allow self-signed
        },
      },
    },

    build: {
      sourcemap: true,
    },
  };
});
