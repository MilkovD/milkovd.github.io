import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Авто-base для GitHub Pages project pages.
// Локально base = '/'.
// В GH Actions есть GITHUB_REPOSITORY = "<owner>/<repo>".
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];

export default defineConfig({
  plugins: [react()],
  base: repo ? `/${repo}/` : '/',
});
