import '@testing-library/jest-dom'
import { vi, afterAll } from 'vitest'
import 'vitest-axe/extend-expect'

// Extend expect with axe-core matchers
import * as matchers from 'vitest-axe/matchers'
import { expect } from 'vitest'
expect.extend(matchers)

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Mock console methods to reduce test noise
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleInfo = console.info

// Only mock in test environment
if (process.env.NODE_ENV === 'test') {
  console.error = vi.fn()
  console.warn = vi.fn()
  console.info = vi.fn()
}

// Restore after all tests
afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  console.info = originalConsoleInfo
})
