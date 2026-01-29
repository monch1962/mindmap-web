/**
 * Enhanced test setup with comprehensive configuration
 *
 * This setup extends the basic test configuration with:
 * - Custom render function with providers
 * - Mock setup for external dependencies
 * - Accessibility testing configuration
 * - Performance monitoring
 * - Custom matchers and utilities
 */

import { vi, expect } from 'vitest'
import type { RenderOptions, RenderResult } from '@testing-library/react'
import type { ReactElement } from 'react'

// Import our test utilities
import { customRender } from '../utils'
import { setupBrowserMocks } from '../mocks/browser'
import * as accessibility from './accessibility'

// Import mock libraries
import * as reactflowMocks from '../mocks/libraries/reactflow'

/**
 * Enhanced render options
 */
export interface EnhancedRenderOptions extends RenderOptions {
  /**
   * Whether to wrap with ReactFlowProvider
   */
  withReactFlow?: boolean

  /**
   * Whether to setup browser mocks
   */
  withBrowserMocks?: boolean

  /**
   * Whether to enable accessibility testing
   */
  withAccessibility?: boolean

  /**
   * Additional providers to wrap with
   */
  providers?: Array<(children: ReactElement) => ReactElement>
}

/**
 * Enhanced render result
 */
export interface EnhancedRenderResult extends RenderResult {
  /**
   * Accessibility test results
   */
  accessibility?: ReturnType<typeof accessibility.testAccessibility>

  /**
   * Performance metrics
   */
  performance?: {
    renderTime: number
    mountTime: number
    updateTime?: number
  }
}

/**
 * Enhanced render function
 */
export const enhancedRender = (
  ui: ReactElement,
  options: EnhancedRenderOptions = {}
): EnhancedRenderResult => {
  const {
    withReactFlow = false,
    withBrowserMocks = true,
    withAccessibility = true,
    providers = [],
    ...renderOptions
  } = options

  // Setup browser mocks if requested
  if (withBrowserMocks) {
    setupBrowserMocks()
  }

  // Setup accessibility testing
  if (withAccessibility) {
    accessibility.setupAccessibilityTesting()
  }

  // Build provider chain
  let wrappedUi = ui

  // Add ReactFlowProvider if requested
  if (withReactFlow) {
    const ReactFlowProvider = reactflowMocks.ReactFlowProvider
    wrappedUi = ReactFlowProvider({ children: wrappedUi }) as ReactElement
  }

  // Add custom providers
  providers.forEach(provider => {
    wrappedUi = provider(wrappedUi)
  })

  // Measure render performance
  const renderStart = performance.now()
  const result = customRender(wrappedUi, renderOptions)
  const renderEnd = performance.now()

  // Run accessibility tests if requested
  let accessibilityResults
  if (withAccessibility) {
    accessibilityResults = accessibility.testAccessibility(result.container)
  }

  return {
    ...result,
    accessibility: accessibilityResults,
    performance: {
      renderTime: renderEnd - renderStart,
      mountTime: 0, // Would need to measure component mount time
    },
  }
}

/**
 * Re-export everything from testing-library
 */
export * from '@testing-library/react'

/**
 * Re-export user-event
 */
export { default as userEvent } from '@testing-library/user-event'

/**
 * Custom test utilities
 */
export const testUtils = {
  /**
   * Wait for animation frame
   */
  waitForAnimationFrame: () => new Promise(resolve => requestAnimationFrame(resolve)),

  /**
   * Wait for next tick
   */
  waitForNextTick: () => new Promise(resolve => setTimeout(resolve, 0)),

  /**
   * Mock performance.now
   */
  mockPerformanceNow: (time: number) => {
    vi.spyOn(performance, 'now').mockReturnValue(time)
  },

  /**
   * Reset all mocks
   */
  resetAllMocks: () => {
    vi.resetAllMocks()
    vi.clearAllMocks()
  },

  /**
   * Create a mock event
   */
  createMockEvent: <T extends Event>(type: string, options?: Partial<T>): T => {
    const event = new Event(type) as T
    Object.assign(event, options)
    return event
  },
}

/**
 * Custom matchers
 */
export const customMatchers = {
  /**
   * Check if element has accessible name
   */
  toHaveAccessibleName: (element: HTMLElement) => {
    const hasAccessibleName =
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim()

    return {
      pass: !!hasAccessibleName,
      message: () => `Expected element to have accessible name`,
    }
  },

  /**
   * Check if element is focusable
   */
  toBeFocusable: (element: HTMLElement) => {
    const isFocusable =
      element.tabIndex >= 0 ||
      element.tagName === 'BUTTON' ||
      element.tagName === 'A' ||
      element.tagName === 'INPUT' ||
      element.tagName === 'SELECT' ||
      element.tagName === 'TEXTAREA'

    return {
      pass: isFocusable,
      message: () => `Expected element to be focusable`,
    }
  },

  /**
   * Check if element has proper contrast ratio
   * Note: This is a simplified check - real contrast checking requires more complex logic
   */
  toHaveProperContrast: (element: HTMLElement) => {
    const style = window.getComputedStyle(element)
    const color = style.color
    const backgroundColor = style.backgroundColor

    // Simplified check - in real implementation, you would calculate contrast ratio
    const hasContrast = color !== backgroundColor

    return {
      pass: hasContrast,
      message: () => `Expected element to have proper color contrast`,
    }
  },
}

/**
 * Setup enhanced testing environment
 */
export const setupEnhancedTesting = () => {
  // Setup browser mocks
  setupBrowserMocks()

  // Setup accessibility testing
  accessibility.setupAccessibilityTesting()

  // Extend expect with custom matchers
  expect.extend(customMatchers)

  // Mock console methods in tests
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})

  // Mock requestAnimationFrame
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    return setTimeout(() => cb(performance.now()), 0) as unknown as number
  })

  // Mock cancelAnimationFrame
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => {
    clearTimeout(id)
  })

  console.log('Enhanced testing environment setup complete')
}

export default {
  enhancedRender,
  testUtils,
  customMatchers,
  setupEnhancedTesting,
  ...accessibility,
}
