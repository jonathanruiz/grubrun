// Adds custom jest-dom matchers (toBeInTheDocument, toHaveAttribute, ...) to
// Vitest's expect.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount any components rendered during a test so they don't leak into the
// next one.
afterEach(() => {
  cleanup()
})
