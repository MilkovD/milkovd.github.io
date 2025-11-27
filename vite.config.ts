import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

function computeBase() {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
  const isUserOrOrg = repo.endsWith('.github.io');
  if (!repo || isUserOrOrg) return '/';
  return `/${repo}/`;
}

export default defineConfig({
  plugins: [react()],
  base: computeBase(),
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        wishlist: resolve(__dirname, 'wishlist.html')
      }
    }
  }
});
