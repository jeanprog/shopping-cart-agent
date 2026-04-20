import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    /** Permite que o fluxo do Google use postMessage em popups (evita aviso de COOP). */
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    /** Falha cedo se 5173 estiver ocupada (evita “outra porta” sem origem no Google). */
    strictPort: true,
    /**
     * OAuth Google: a origem é o que aparece na barra (ex.: http://localhost:5173).
     * No Console → Credenciais → seu Client ID Web → Origens JS autorizadas, cadastre:
     *   http://localhost:5173
     *   http://127.0.0.1:5173
     * Não use o preview embutido do editor para login Google; abra no Chrome/Edge em localhost:5173.
     */
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
