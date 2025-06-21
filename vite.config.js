import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pagesでサブディレクトリ配信を考慮（リポジトリ名に応じてbaseを修正）
export default defineConfig({
  plugins: [react()],
  base: '/MyCodexSample/', // ★リポジトリ名に合わせて変更！
});