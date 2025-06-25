import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      'angular/**',
      'node_modules/**',
      'dist/**'
    ]
  }
});
