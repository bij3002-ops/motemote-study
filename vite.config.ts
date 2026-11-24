import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps asset URLs relative, so the same build works on
// GitHub Pages (/motemote-study/) and on a root domain alike.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    target: 'es2019',
  },
});
