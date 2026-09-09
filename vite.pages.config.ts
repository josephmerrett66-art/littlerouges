import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/littlerouges/',
  root: 'pages',
  publicDir: resolve(import.meta.dirname, 'public'),
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  plugins: [react()],
  build: {
    outDir: '../dist/pages',
    emptyOutDir: true,
  },
});
