import { defineConfig } from 'vite';

export default defineConfig({
  // Use the repository name for GitHub Pages deployment
  base: '/football-weekly-ahp/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
