import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts']
    },
    //setupFiles: ['test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});