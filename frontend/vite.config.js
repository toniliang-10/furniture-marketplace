import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // The Spring Boot backend whitelists this exact origin for CORS,
    // so keep the port fixed instead of auto-incrementing.
    strictPort: true,
  },
});
