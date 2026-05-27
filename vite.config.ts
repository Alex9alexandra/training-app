import { defineConfig, configDefaults } from 'vitest/config';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    exclude: [...configDefaults.exclude, 'tests/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        ...configDefaults.coverage.exclude || [],
        'tests/**',
        'src/setupTests.ts',
        '**/*.test.tsx'
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});