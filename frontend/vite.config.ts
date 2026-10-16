import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.ENV': JSON.stringify((globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env?.ENV ?? '')
  },
  publicDir: 'public',
  server: { proxy: { '/api': 'http://127.0.0.1:8788' } },
  build: { outDir: 'dist', emptyOutDir: true }
});
