/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Component tests need a DOM; jsdom provides one under Node.
    environment: 'jsdom',
    // Expose describe/it/expect globally so tests don't import them.
    globals: true,
    // Registers @testing-library/jest-dom matchers and cleans up the DOM
    // between tests.
    setupFiles: './tests/setup.ts',
  },
})
