import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function computeBase() {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
  const isUserOrOrg = repo.endsWith('.github.io');
  if (!repo || isUserOrOrg) return '/';
  return `/${repo}/`;
}

export default defineConfig({
  plugins: [react()],
  base: computeBase()
});
