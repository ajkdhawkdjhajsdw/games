import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { previewOrigin } from './scripts/preview-origin.ts';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', port: 3000, strictPort: true,
    proxy: { '/api': {
      target: 'http://127.0.0.1:3001',
      configure(proxy) {
        proxy.on('proxyReq', (outgoing, request) => {
          const origin = previewOrigin(request.headers.origin, request.headers.host, process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS);
          if (origin) outgoing.setHeader('Origin', origin);
        });
      },
    } },
    fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.hoplite/**', '**/server/**', '**/tests/**', '**/reports/**', '**/data/**', '**/scripts/**', '**/docs/**'] },
  },
  build: { sourcemap: false },
});
