import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  // Use sub-directory only for production build on GitHub Pages
  base: mode === 'production' ? '/football-weekly-ahp/' : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
}));
