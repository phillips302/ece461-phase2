import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'istanbul', // Use istanbul for coverage
      reporter: ['text', 'json', 'html'], // Reporters: text, json, and HTML
      exclude: [
        '**/*.test.{js,ts,jsx,tsx}', // Exclude test files
        '**/*.spec.{js,ts,jsx,tsx}', // Exclude spec files
        '**/*.d.ts', // Exclude TypeScript declaration files
        '**/*.tsx', // Exclude all .tsx files
        '**/node_modules/**', // Exclude dependencies
        '**/dist/**', // Exclude built files
        '**/build/**'], // Exclude build output
      all: true, // Collect coverage from all files
    },
  },
});