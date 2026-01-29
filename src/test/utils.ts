// Test utilities for the Mind Map application
import { render, type RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'
import React from 'react'

/**
 * Custom render function that wraps components with all necessary providers
 * for testing the Mind Map application.
 */
export const customRender = (ui: React.ReactElement, options?: RenderOptions) => render(ui, options)

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }

/**
 * Wait for a condition to be true with timeout
 */
export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error(`Condition not met within ${timeout}ms`)
}

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    getStore: () => ({ ...store }),
  }
}

/**
 * Create a mock fetch response
 */
export const createMockFetchResponse = (data: any, ok = true, status = 200) => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Error',
  json: async () => data,
  text: async () => JSON.stringify(data),
  headers: new Headers(),
  redirected: false,
  type: 'basic' as ResponseType,
  url: '',
  clone: () => ({}) as Response,
  body: null,
  bodyUsed: false,
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  blob: () => Promise.resolve(new Blob()),
  formData: () => Promise.resolve(new FormData()),
})

/**
 * Setup user event with default options
 */
export const setupUserEvent = async () => {
  const userEvent = await import('@testing-library/user-event')
  return userEvent.default.setup({
    advanceTimers: vi.advanceTimersByTime,
    delay: null,
  })
}

/**
 * Type-safe mock factory
 */
export const createTypeSafeMock = <T extends (...args: any[]) => any>(): T => {
  return vi.fn() as unknown as T
}

/**
 * Reset all mocks between tests
 */
export const resetAllMocks = () => {
  vi.clearAllMocks()
  vi.resetAllMocks()
  vi.restoreAllMocks()
}

/**
 * Sleep utility for tests
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
