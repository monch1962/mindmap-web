/**
 * Test type definitions
 *
 * This file contains TypeScript type definitions for test utilities,
 * factories, mocks, and test data structures.
 */

import type { ReactElement } from 'react'
import type { RenderOptions, RenderResult } from '@testing-library/react'
import type { MindMapTree, MindMapNode, FileAttachment, Comment, User } from '../types'

/**
 * Test configuration types
 */
export interface TestConfig {
  /**
   * Whether to run accessibility tests
   */
  accessibility: boolean

  /**
   * Whether to run performance tests
   */
  performance: boolean

  /**
   * Whether to mock external APIs
   */
  mockExternal: boolean

  /**
   * Test timeout in milliseconds
   */
  timeout: number

  /**
   * Test retry count
   */
  retry: number
}

/**
 * Factory options
 */
export interface FactoryOptions<T> {
  /**
   * Override default values
   */
  overrides?: Partial<T>

  /**
   * Number of items to create
   */
  count?: number

  /**
   * Whether to generate unique IDs
   */
  uniqueIds?: boolean
}

/**
 * Test user types
 */
export interface TestUser extends User {
  /**
   * Test-specific properties
   */
  testId: string
  sessionId: string
  isMock: boolean
}

/**
 * Test mind map types
 */
export interface TestMindMapTree extends MindMapTree {
  /**
   * Test-specific properties
   */
  testId: string
  createdAt: Date
  updatedAt: Date
  version: number
}

/**
 * Test node types
 */
export interface TestMindMapNode extends MindMapNode {
  /**
   * Test-specific properties
   */
  testId: string
  depth: number
  isExpanded: boolean
  isSelected: boolean
}

/**
 * Test file attachment types
 */
export interface TestFileAttachment extends FileAttachment {
  /**
   * Test-specific properties
   */
  testId: string
  mockUrl: string
  mockSize: number
}

/**
 * Test comment types
 */
export interface TestComment extends Comment {
  /**
   * Test-specific properties
   */
  testId: string
  isResolved: boolean
  isEdited: boolean
}

/**
 * Test event types
 */
export interface TestEvent {
  type: string
  target: HTMLElement
  preventDefault: () => void
  stopPropagation: () => void
  [key: string]: any
}

/**
 * Keyboard event test types
 */
export interface TestKeyboardEvent extends TestEvent {
  key: string
  code: string
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  metaKey: boolean
}

/**
 * Mouse event test types
 */
export interface TestMouseEvent extends TestEvent {
  clientX: number
  clientY: number
  button: number
  buttons: number
}

/**
 * Drag and drop test types
 */
export interface TestDragEvent extends TestMouseEvent {
  dataTransfer: {
    setData: (type: string, data: string) => void
    getData: (type: string) => string
    clearData: () => void
    setDragImage: (image: Element, x: number, y: number) => void
    effectAllowed: string
    dropEffect: string
    types: string[]
    files: File[]
  }
}

/**
 * Test render options
 */
export interface TestRenderOptions extends RenderOptions {
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
   * Initial state for the test
   */
  initialState?: any

  /**
   * Route for the test
   */
  route?: string

  /**
   * Query parameters for the test
   */
  queryParams?: Record<string, string>
}

/**
 * Test render result
 */
export interface TestRenderResult extends Omit<RenderResult, 'rerender'> {
  /**
   * Test-specific properties
   */
  testId: string

  /**
   * Override rerender to accept ReactElement only
   */
  rerender: (ui: ReactElement) => void

  /**
   * Accessibility test results
   */
  accessibility?: {
    hasTitle: boolean
    hasLangAttribute: boolean
    hasMainLandmark: boolean
    imagesWithAlt: number
    totalImages: number
    buttonsWithText: number
    totalButtons: number
    linksWithText: number
    totalLinks: number
    formInputsWithLabels: number
    totalFormInputs: number
  }

  /**
   * Performance metrics
   */
  performance?: {
    renderTime: number
    mountTime: number
    updateTime?: number
    memoryUsage?: number
  }
}

/**
 * Test assertion types
 */
export interface TestAssertions {
  /**
   * Assert that element is visible
   */
  toBeVisible: (element: HTMLElement) => void

  /**
   * Assert that element is hidden
   */
  toBeHidden: (element: HTMLElement) => void

  /**
   * Assert that element has focus
   */
  toHaveFocus: (element: HTMLElement) => void

  /**
   * Assert that element is disabled
   */
  toBeDisabled: (element: HTMLElement) => void

  /**
   * Assert that element has accessible name
   */
  toHaveAccessibleName: (element: HTMLElement) => void

  /**
   * Assert that element has proper contrast
   */
  toHaveProperContrast: (element: HTMLElement) => void
}

/**
 * Test utility types
 */
export interface TestUtils {
  /**
   * Wait for animation frame
   */
  waitForAnimationFrame: () => Promise<void>

  /**
   * Wait for next tick
   */
  waitForNextTick: () => Promise<void>

  /**
   * Wait for condition
   */
  waitFor: (condition: () => boolean, timeout?: number) => Promise<void>

  /**
   * Mock performance.now
   */
  mockPerformanceNow: (time: number) => void

  /**
   * Reset all mocks
   */
  resetAllMocks: () => void

  /**
   * Create mock event
   */
  createMockEvent: <T extends TestEvent>(type: string, options?: Partial<T>) => T

  /**
   * Create mock keyboard event
   */
  createMockKeyboardEvent: (key: string, options?: Partial<TestKeyboardEvent>) => TestKeyboardEvent

  /**
   * Create mock mouse event
   */
  createMockMouseEvent: (type: string, options?: Partial<TestMouseEvent>) => TestMouseEvent

  /**
   * Create mock drag event
   */
  createMockDragEvent: (type: string, options?: Partial<TestDragEvent>) => TestDragEvent
}

/**
 * Test factory types
 */
export interface TestFactories {
  /**
   * Create test user
   */
  createUser: (options?: FactoryOptions<TestUser>) => TestUser | TestUser[]

  /**
   * Create test mind map
   */
  createMindMap: (options?: FactoryOptions<TestMindMapTree>) => TestMindMapTree | TestMindMapTree[]

  /**
   * Create test node
   */
  createNode: (options?: FactoryOptions<TestMindMapNode>) => TestMindMapNode | TestMindMapNode[]

  /**
   * Create test file attachment
   */
  createFileAttachment: (
    options?: FactoryOptions<TestFileAttachment>
  ) => TestFileAttachment | TestFileAttachment[]

  /**
   * Create test comment
   */
  createComment: (options?: FactoryOptions<TestComment>) => TestComment | TestComment[]
}

/**
 * Test mock types
 */
export interface TestMocks {
  /**
   * Browser API mocks
   */
  browser: {
    localStorage: any
    sessionStorage: any
    matchMedia: any
    fetch: any
    WebSocket: any
    IndexedDB: any
  }

  /**
   * Library mocks
   */
  libraries: {
    reactflow: any
  }

  /**
   * Component mocks
   */
  components: Record<string, any>
}

/**
 * Complete test context
 */
export interface TestContext {
  /**
   * Test configuration
   */
  config: TestConfig

  /**
   * Test utilities
   */
  utils: TestUtils

  /**
   * Test assertions
   */
  assertions: TestAssertions

  /**
   * Test factories
   */
  factories: TestFactories

  /**
   * Test mocks
   */
  mocks: TestMocks

  /**
   * Test render function
   */
  render: (ui: ReactElement, options?: TestRenderOptions) => TestRenderResult

  /**
   * Cleanup function
   */
  cleanup: () => void
}

/**
 * Test suite types
 */
export interface TestSuite {
  /**
   * Suite name
   */
  name: string

  /**
   * Suite description
   */
  description: string

  /**
   * Test cases
   */
  tests: TestCase[]

  /**
   * Setup function
   */
  setup?: (context: TestContext) => Promise<void>

  /**
   * Teardown function
   */
  teardown?: (context: TestContext) => Promise<void>

  /**
   * Before each function
   */
  beforeEach?: (context: TestContext) => Promise<void>

  /**
   * After each function
   */
  afterEach?: (context: TestContext) => Promise<void>
}

/**
 * Test case types
 */
export interface TestCase {
  /**
   * Test name
   */
  name: string

  /**
   * Test description
   */
  description: string

  /**
   * Test function
   */
  test: (context: TestContext) => Promise<void> | void

  /**
   * Test timeout
   */
  timeout?: number

  /**
   * Test retry count
   */
  retry?: number

  /**
   * Test tags
   */
  tags?: string[]

  /**
   * Test skip reason
   */
  skip?: string | boolean

  /**
   * Test only flag
   */
  only?: boolean
}

/**
 * Test result types
 */
export interface TestResult {
  /**
   * Test name
   */
  name: string

  /**
   * Test status
   */
  status: 'passed' | 'failed' | 'skipped' | 'pending'

  /**
   * Test duration
   */
  duration: number

  /**
   * Test error
   */
  error?: Error

  /**
   * Test assertions
   */
  assertions: number

  /**
   * Test retry count
   */
  retry: number
}

/**
 * Test report types
 */
export interface TestReport {
  /**
   * Suite name
   */
  suite: string

  /**
   * Test results
   */
  results: TestResult[]

  /**
   * Total tests
   */
  total: number

  /**
   * Passed tests
   */
  passed: number

  /**
   * Failed tests
   */
  failed: number

  /**
   * Skipped tests
   */
  skipped: number

  /**
   * Total duration
   */
  duration: number

  /**
   * Coverage percentage
   */
  coverage: number

  /**
   * Accessibility score
   */
  accessibility: number

  /**
   * Performance score
   */
  performance: number
}

export type {
  // Re-export from React Testing Library
  RenderOptions,
  RenderResult,

  // Re-export from application types
  MindMapTree,
  MindMapNode,
  FileAttachment,
  Comment,
  User,
}
