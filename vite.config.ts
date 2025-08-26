import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the AquaSync frontend.
// This file tells Vite to use the React plugin so that JSX
// and TypeScript files are transpiled correctly. Additional
// configuration (such as proxy settings) can be added here
// as the project grows.

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false
  }
});