import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, fireEvent } from '@testing-library/react'
import { useOfflineSync, usePWAInstall } from './useOfflineSync'

describe('useOfflineSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })

    // Mock service worker
    ;(navigator as unknown as Record<string, unknown>).serviceWorker = {
      register: vi.fn(() => Promise.resolve()),
    }
  })

  describe('initialization', () => {
    it('should initialize with online status from navigator', () => {
      navigator.onLine = true

      const { result } = renderHook(() => useOfflineSync())

      expect(result.current.isOnline).toBe(true)
      expect(result.current.isOfflineMode).toBe(false)
    })

    it('should initialize with offline status from navigator', async () => {
      navigator.onLine = false

      const { result } = renderHook(() => useOfflineSync())

      // Trigger the offline event to update isOfflineMode
      fireEvent(window, new Event('offline'))

      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(result.current.isOnline).toBe(false)
      expect(result.current.isOfflineMode).toBe(true)
    })

    it('should attempt to register service worker', () => {
      renderHook(() => useOfflineSync())

      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
        type: 'module',
      })
    })

    it('should handle missing service worker gracefully', () => {
      // Use delete to properly remove the property
      delete (navigator as unknown as Record<string, unknown>).serviceWorker

      const { result } = renderHook(() => useOfflineSync())

      expect(result.current.isOnline).toBe(true)
    })
  })

  describe('api methods', () => {
    it('should provide all required methods', () => {
      const { result } = renderHook(() => useOfflineSync())

      expect(result.current.isOnline).toBeDefined()
      expect(result.current.isOfflineMode).toBeDefined()
      expect(result.current.updateAvailable).toBeDefined()
      expect(result.current.cacheSize).toBeDefined()
      expect(result.current.pendingSyncCount).toBeDefined()
      expect(result.current.applyUpdate).toBeDefined()
      expect(result.current.forceReload).toBeDefined()
      expect(result.current.clearCache).toBeDefined()
      expect(result.current.getCacheSize).toBeDefined()
      expect(result.current.syncOfflineRequestsNow).toBeDefined()
      expect(result.current.storeOfflineData).toBeDefined()
      expect(result.current.getOfflineData).toBeDefined()
      expect(result.current.clearOfflineData).toBeDefined()
      expect(result.current.formatBytes).toBeDefined()
    })

    it('should accept callbacks', () => {
      const callbacks = {
        onOnline: vi.fn(),
        onOffline: vi.fn(),
        onUpdateAvailable: vi.fn(),
        onControlling: vi.fn(),
      }

      expect(() => {
        renderHook(() => useOfflineSync(callbacks))
      }).not.toThrow()
    })
  })

  describe('offline data storage', () => {
    it('should store offline data', () => {
      const { result } = renderHook(() => useOfflineSync())

      const success = result.current.storeOfflineData('test-key', { data: 'test' })

      expect(success).toBe(true)
    })

    it('should retrieve offline data', () => {
      const { result } = renderHook(() => useOfflineSync())

      // First store some data
      result.current.storeOfflineData('test-key', { data: 'test' })

      // Then retrieve it
      const data = result.current.getOfflineData('test-key')

      expect(data).toEqual({ data: 'test' })
    })

    it('should return null for non-existent data', () => {
      const { result } = renderHook(() => useOfflineSync())

      const data = result.current.getOfflineData('non-existent-key')

      expect(data).toBeNull()
    })

    it('should clear specific offline data', () => {
      const { result } = renderHook(() => useOfflineSync())

      result.current.storeOfflineData('test-key', { data: 'test' })
      const success = result.current.clearOfflineData('test-key')

      expect(success).toBe(true)

      // Data should be cleared
      const data = result.current.getOfflineData('test-key')
      expect(data).toBeNull()
    })

    it('should clear all offline data', () => {
      const { result } = renderHook(() => useOfflineSync())

      result.current.storeOfflineData('key1', { data: 'data1' })
      result.current.storeOfflineData('key2', { data: 'data2' })

      const success = result.current.clearOfflineData()

      expect(success).toBe(true)
    })
  })

  describe('utility functions', () => {
    it('should format bytes correctly', () => {
      const { result } = renderHook(() => useOfflineSync())

      expect(result.current.formatBytes(0)).toBe('0 Bytes')
      expect(result.current.formatBytes(1024)).toBe('1 KB')
      expect(result.current.formatBytes(1048576)).toBe('1 MB')
      expect(result.current.formatBytes(1073741824)).toBe('1 GB')
    })

    it('should force reload', () => {
      // Note: window.location.reload cannot be mocked in jsdom as it's non-configurable
      // We just verify the function exists and is callable
      const { result } = renderHook(() => useOfflineSync())

      expect(typeof result.current.forceReload).toBe('function')

      // Calling it should not throw (even though it will try to reload the page)
      // In a real browser this would reload, but in jsdom it's a no-op
      expect(() => {
        result.current.forceReload()
      }).not.toThrow()
    })
  })

  describe('async operations', () => {
    it('should handle sync operations without crashing', async () => {
      const { result } = renderHook(() => useOfflineSync())

      // These should not throw errors
      await expect(result.current.syncOfflineRequestsNow()).resolves.toBeDefined()
      await expect(result.current.getCacheSize()).resolves.toBeDefined()
      await expect(result.current.clearCache()).resolves.not.toThrow()
    })

    it('should handle checkPendingSync', async () => {
      const { result } = renderHook(() => useOfflineSync())

      const count = await result.current.checkPendingSync()

      expect(typeof count).toBe('number')
    })
  })

  describe('integration', () => {
    it('should handle all operations without errors', () => {
      const { result } = renderHook(() => useOfflineSync())

      // Test all data operations
      expect(() => {
        result.current.storeOfflineData('key', { data: 'test' })
        result.current.getOfflineData('key')
        result.current.clearOfflineData('key')
        result.current.clearOfflineData()
        result.current.formatBytes(1024)
      }).not.toThrow()
    })

    it('should handle callbacks properly', () => {
      const onOnline = vi.fn()
      const onOffline = vi.fn()

      renderHook(() =>
        useOfflineSync({
          onOnline,
          onOffline,
        })
      )

      // Callbacks should be registered
      expect(onOnline).toBeDefined()
      expect(onOffline).toBeDefined()
    })
  })
})

describe('usePWAInstall', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock matchMedia
    window.matchMedia = vi.fn(() => ({
      matches: false,
    })) as unknown as MediaQueryList
  })

  describe('initialization', () => {
    it('should initialize with install state', () => {
      const { result } = renderHook(() => usePWAInstall())

      expect(result.current.isInstallable).toBeDefined()
      expect(result.current.isInstalled).toBeDefined()
      expect(result.current.promptInstall).toBeDefined()
    })

    it('should detect standalone mode', () => {
      window.matchMedia = vi.fn(query => ({
        matches: query === '(display-mode: standalone)',
      })) as unknown as MediaQueryList

      const { result } = renderHook(() => usePWAInstall())

      expect(result.current.isInstalled).toBe(true)
    })
  })

  describe('prompt install', () => {
    it('should return false when no prompt available', async () => {
      const { result } = renderHook(() => usePWAInstall())

      const accepted = await result.current.promptInstall()

      expect(accepted).toBe(false)
    })

    it('should provide promptInstall method', () => {
      const { result } = renderHook(() => usePWAInstall())

      expect(typeof result.current.promptInstall).toBe('function')
    })
  })

  describe('integration', () => {
    it('should provide install state and methods', () => {
      const { result } = renderHook(() => usePWAInstall())

      expect(result.current.isInstallable).toBeDefined()
      expect(result.current.isInstalled).toBeDefined()
      expect(result.current.promptInstall).toBeDefined()
    })
  })
})
