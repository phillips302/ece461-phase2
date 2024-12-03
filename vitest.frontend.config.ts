import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.js', // Setup testing library or global configurations
    coverage: {
      reporter: ['text', 'json', 'html'], // Specify output formats
      provider: 'istanbul', // Use Istanbul for coverage
    },
  },
});