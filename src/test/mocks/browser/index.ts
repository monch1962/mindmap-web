// Browser API mocks
import { vi } from 'vitest'

/**
 * Mock localStorage
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
 * Mock sessionStorage
 */
export const mockSessionStorage = () => {
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
  }
}

/**
 * Mock matchMedia
 */
export const mockMatchMedia = (matches = false) => {
  return vi.fn().mockImplementation(query => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

/**
 * Mock fetch
 */
export const mockFetch = (response: any, ok = true, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => response,
    text: async () => JSON.stringify(response),
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
}

/**
 * Mock WebSocket
 */
export const mockWebSocket = () => {
  const mock = {
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    readyState: WebSocket.OPEN,
    url: 'ws://localhost:8080',
    extensions: '',
    protocol: '',
    binaryType: 'blob' as BinaryType,
    bufferedAmount: 0,
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
  }

  return mock
}

/**
 * Mock IndexedDB
 */
export const mockIndexedDB = () => {
  const store: Record<string, any> = {}

  return {
    open: vi.fn(),
    get: vi.fn((key: string) => store[key]),
    put: vi.fn((key: string, value: any) => {
      store[key] = value
    }),
    delete: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    getAll: vi.fn(() => Object.values(store)),
  }
}

/**
 * Setup browser mocks
 */
export const setupBrowserMocks = () => {
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia(),
  })

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    writable: true,
    value: mockLocalStorage(),
  })

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    writable: true,
    value: mockSessionStorage(),
  })

  // Mock fetch
  Object.defineProperty(window, 'fetch', {
    writable: true,
    value: mockFetch({}),
  })

  // Mock scrollIntoView
  Element.prototype.scrollIntoView = vi.fn()

  // Mock getBoundingClientRect
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }))
}
