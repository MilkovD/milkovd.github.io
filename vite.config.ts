import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isUserPage = /\.github\.io$/i.test(repo);

export default defineConfig({
  plugins: [react()],
  // Для user/org pages сайт живёт в корне домена → base = '/'
  // Для project pages — '/<repo>/'
  base: isUserPage ? '/' : `/${repo}/`,
});
