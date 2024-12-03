import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // Simulates a browser-like environment
    include: ['__tests__/ui_tests/**/*.{js,jsx,ts,tsx}'], // Only include ui_tests files
    exclude: ['__tests__/tools_test/**/*.{js,jsx,ts,tsx}'], // Exclude tools_test files
    coverage: {
      provider: 'istanbul', // Use istanbul for coverage
      reporter: ['text', 'json', 'html'], // Reporters: text, json, and HTML
      include: ['ratethecrate/src/**/*.{js,jsx,tsx}'], // Coverage includes your source files
      exclude: ['**/*.test.{ts,tsx}'], // Exclude test files and tools_test
      all: true, // Collect coverage from all files, even those not explicitly tested
    },
  },
});