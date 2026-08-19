import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relative ('./') so the built app works from any static host / subpath.
export default defineConfig({
  plugins: [react()],
  base: './',
});
