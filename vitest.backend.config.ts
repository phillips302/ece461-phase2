import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'istanbul', // Use istanbul for coverage
      reporter: ['text', 'json', 'html'], // Reporters: text, json, and HTML
      exclude: ['ratethecrate/src/**/*.{js,jsx,tsx}'],
      all: true, // Collect coverage from all files
    },
  },
});