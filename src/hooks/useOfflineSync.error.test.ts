import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOfflineSync } from './useOfflineSync'

describe('useOfflineSync - Error Handling Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock navigator.onLine
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    // Mock service worker
    const mockServiceWorker = {
      register: vi.fn(() =>
        Promise.resolve({
          installing: null,
          waiting: null,
          active: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })
      ),
      controller: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('storeOfflineData error handling', () => {
    it('should handle non-Error objects thrown by localStorage', () => {
      const { result } = renderHook(() => useOfflineSync())

      // Mock localStorage.setItem to throw a non-Error object
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw 'Storage quota exceeded (string error)' // Non-Error object
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      let success = true
      act(() => {
        success = result.current.storeOfflineData('test-key', { data: 'test' })
      })

      expect(success).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        '[PWA] Failed to store offline data:',
        'Storage quota exceeded (string error)'
      )

      setItemSpy.mockRestore()
      consoleSpy.mockRestore()
    })

    it('should handle null/undefined errors', () => {
      const { result } = renderHook(() => useOfflineSync())

      // Mock localStorage.setItem to throw null
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw null // Null error
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      let success = true
      act(() => {
        success = result.current.storeOfflineData('test-key', { data: 'test' })
      })

      expect(success).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('[PWA] Failed to store offline data:', null)

      setItemSpy.mockRestore()
      consoleSpy.mockRestore()
    })
  })

  describe('getOfflineData error handling', () => {
    it('should handle non-Error objects thrown by localStorage', () => {
      const { result } = renderHook(() => useOfflineSync())

      // Mock localStorage.getItem to throw a non-Error object
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw 'Storage corrupted (string error)' // Non-Error object
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      let data: unknown = 'not-null'
      act(() => {
        data = result.current.getOfflineData('test-key')
      })

      expect(data).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        '[PWA] Failed to retrieve offline data:',
        'Storage corrupted (string error)'
      )

      getItemSpy.mockRestore()
      consoleSpy.mockRestore()
    })

    it('should handle JSON parsing errors with non-Error objects', () => {
      const { result } = renderHook(() => useOfflineSync())

      // Store invalid JSON
      localStorage.setItem('offline_test-key', 'invalid-json{')

      // Mock JSON.parse to throw a non-Error object
      const parseSpy = vi.spyOn(JSON, 'parse').mockImplementation(() => {
        throw 'Invalid JSON (string error)' // Non-Error object
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      let data: unknown = 'not-null'
      act(() => {
        data = result.current.getOfflineData('test-key')
      })

      expect(data).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        '[PWA] Failed to retrieve offline data:',
        'Invalid JSON (string error)'
      )

      parseSpy.mockRestore()
      consoleSpy.mockRestore()
    })

    it('should handle missing data/timestamp in stored JSON', () => {
      const { result } = renderHook(() => useOfflineSync())

      // Store JSON without required fields
      const invalidData = {
        // Missing 'data' and 'timestamp' fields
        something: 'else',
      }
      localStorage.setItem('offline_test-key', JSON.stringify(invalidData))

      let data: unknown = 'not-null'
      act(() => {
        data = result.current.getOfflineData('test-key')
      })

      expect(data).toBeNull()
      // Data should have been removed from localStorage
      expect(localStorage.getItem('offline_test-key')).toBeNull()
    })
  })

  describe('clearOfflineData error handling', () => {
    it('should handle non-Error objects when clearing specific key', () => {
      const { result } = renderHook(() => useOfflineSync())

      // First store some data
      act(() => {
        result.current.storeOfflineData('test-key', { data: 'test' })
      })

      // Mock localStorage.removeItem to throw a non-Error object
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw 'Storage locked (string error)' // Non-Error object
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      let success = true
      act(() => {
        success = result.current.clearOfflineData('test-key')
      })

      expect(success).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        '[PWA] Failed to clear offline data:',
        'Storage locked (string error)'
      )

      removeItemSpy.mockRestore()
      consoleSpy.mockRestore()
    })

    it('should handle non-Error objects when clearing all data', () => {
      const { result } = renderHook(() => useOfflineSync())

      // Store some data
      act(() => {
        result.current.storeOfflineData('key1', { data: 'data1' })
        result.current.storeOfflineData('key2', { data: 'data2' })
      })

      // Mock localStorage.removeItem to throw a non-Error object
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw 'Storage locked (string error)' // Non-Error object
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      let success = true
      act(() => {
        success = result.current.clearOfflineData()
      })

      expect(success).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        '[PWA] Failed to clear offline data:',
        'Storage locked (string error)'
      )

      removeItemSpy.mockRestore()
      consoleSpy.mockRestore()
    })

    // Note: Skipping test for Object.keys error because mocking Object.keys
    // globally is dangerous and affects test framework itself
    it.skip('should handle errors when filtering keys in localStorage', () => {
      // This test is skipped because mocking Object.keys globally
      // interferes with the test framework's operation
      expect(true).toBe(true)
    })
  })

  describe('applyUpdate function', () => {
    it('should do nothing when no service worker registration exists', () => {
      const { result } = renderHook(() => useOfflineSync())

      const consoleSpy = vi.spyOn(console, 'log')

      // Call applyUpdate without service worker registration
      act(() => {
        result.current.applyUpdate()
      })

      expect(consoleSpy).not.toHaveBeenCalledWith('[PWA] Update applied')
    })

    it('should do nothing when service worker has no waiting worker', () => {
      const { result } = renderHook(() => useOfflineSync())

      const consoleSpy = vi.spyOn(console, 'log')

      act(() => {
        result.current.applyUpdate()
      })

      expect(consoleSpy).not.toHaveBeenCalledWith('[PWA] Update applied')
    })
  })

  describe('formatBytes function', () => {
    it('should format 0 bytes correctly', () => {
      const { result } = renderHook(() => useOfflineSync())

      let formatted: string = ''
      act(() => {
        formatted = result.current.formatBytes(0)
      })

      expect(formatted).toBe('0 Bytes')
    })

    it('should format bytes correctly', () => {
      const { result } = renderHook(() => useOfflineSync())

      let formatted: string = ''
      act(() => {
        formatted = result.current.formatBytes(1024) // 1 KB
      })

      expect(formatted).toBe('1 KB')
    })

    it('should format large bytes correctly', () => {
      const { result } = renderHook(() => useOfflineSync())

      let formatted: string = ''
      act(() => {
        formatted = result.current.formatBytes(1024 * 1024 * 5) // 5 MB
      })

      expect(formatted).toBe('5 MB')
    })

    it('should handle negative bytes (edge case)', () => {
      const { result } = renderHook(() => useOfflineSync())

      let formatted: string = ''
      act(() => {
        formatted = result.current.formatBytes(-1024)
      })

      // Negative bytes should be handled as 0 Bytes
      expect(formatted).toBe('0 Bytes')
    })
  })
})
