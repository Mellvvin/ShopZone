import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Vite 6+ requires an array for allowedHosts, not the string 'all'
        // Hostnames Vite will accept. Each tunnel provider uses its own
    // domain, so every one you might use must be listed here.
    allowedHosts: [
      'localhost',
      '.ngrok-free.app',
      '.ngrok-free.dev',
      '.ngrok.io',
      'clergyman-outweigh-fantastic.ngrok-free.dev',
      '.trycloudflare.com', // Cloudflare quick tunnels
      '.loca.lt',           // localtunnel
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});