import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // 1. Exclude Playwright E2E tests from the Vitest runner
    exclude: [...configDefaults.exclude, 'tests/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // 2. Exclude non-app files from coverage tracking
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