/**
 * Offline sync and PWA management hook
 * Handles service worker registration, offline detection, and background sync
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { trackError } from '../utils/errorTracking'

export interface OfflineSyncOptions {
  onOnline?: () => void
  onOffline?: () => void
  onUpdateAvailable?: () => void
  onControlling?: () => void
}

export interface OfflineRequest {
  url: string
  method: string
  headers: Record<string, string>
  body: string
  timestamp: number
}

export function useOfflineSync(options: OfflineSyncOptions = {}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [cacheSize, setCacheSize] = useState(0)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /**
   * Register service worker
   */
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { type: 'module' })
        .then(registration => {
          console.log('[PWA] Service worker registered:', registration)
          setSwRegistration(registration)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New content available')
                  setUpdateAvailable(true)
                  options.onUpdateAvailable?.()
                }
              })
            }
          })

          // Service worker is already controlling the page
          if (navigator.serviceWorker.controller) {
            console.log('[PWA] Service worker is controlling')
            options.onControlling?.()
          }

          // Waiting for service worker to become active
          if (registration.waiting) {
            console.log('[PWA] Service worker waiting')
            setUpdateAvailable(true)
          }
        })
        .catch(error => {
          console.error('[PWA] Service worker registration failed:', error)
        })
    }
  }, [options])

  /**
   * Check for pending sync
   */
  const checkPendingSync = useCallback(async () => {
    if (!swRegistration) return 0

    try {
      const messageChannel = new MessageChannel()
      const countPromise = new Promise<number>(resolve => {
        messageChannel.port1.onmessage = event => {
          resolve(event.data.requests?.length || 0)
        }
      })

      swRegistration.active?.postMessage({ type: 'GET_OFFLINE_REQUESTS' }, [messageChannel.port2])

      const count = await countPromise
      setPendingSyncCount(count)
      return count
    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), 'checkPendingSync')
      console.error('[PWA] Failed to check pending sync:', error)
      return 0
    }
  }, [swRegistration])

  /**
   * Sync offline requests now
   */
  const syncOfflineRequestsNow = useCallback(async () => {
    if (!swRegistration || !isOnline) return false

    try {
      // sync API might not be available in all browsers
      if ('sync' in swRegistration) {
        await (
          swRegistration as ServiceWorkerRegistration & { sync: { register(tag: string): void } }
        ).sync.register('sync-offline-requests')
      }
      const count = await checkPendingSync()
      console.log('[PWA] Synced offline requests')
      return count === 0
    } catch (error) {
      trackError(
        error instanceof Error ? error : new Error(String(error)),
        'syncOfflineRequestsNow'
      )
      console.error('[PWA] Failed to sync:', error)
      return false
    }
  }, [swRegistration, isOnline, checkPendingSync])

  /**
   * Monitor online/offline status
   */
  useEffect(() => {
    const handleOnline = () => {
      console.log('[PWA] Online')
      setIsOnline(true)
      setIsOfflineMode(false)
      syncOfflineRequestsNow()
      options.onOnline?.()
    }

    const handleOffline = () => {
      console.log('[PWA] Offline')
      setIsOnline(false)
      setIsOfflineMode(true)
      options.onOffline?.()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [options, syncOfflineRequestsNow])

  /**
   * Periodic sync check
   */
  useEffect(() => {
    if (isOnline && swRegistration) {
      syncIntervalRef.current = setInterval(() => {
        checkPendingSync()
      }, 30000) // Check every 30 seconds

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current)
        }
      }
    }
  }, [isOnline, swRegistration, checkPendingSync])

  /**
   * Get cache size
   */
  const getCacheSize = useCallback(async () => {
    if (!swRegistration) return 0

    try {
      const messageChannel = new MessageChannel()
      const sizePromise = new Promise<number>(resolve => {
        messageChannel.port1.onmessage = event => {
          resolve(event.data.size || 0)
        }
      })

      swRegistration.active?.postMessage({ type: 'GET_CACHE_SIZE' }, [messageChannel.port2])

      const size = await sizePromise
      setCacheSize(size)
      return size
    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), 'getCacheSize')
      console.error('[PWA] Failed to get cache size:', error)
      return 0
    }
  }, [swRegistration])

  /**
   * Clear all caches
   */
  const clearCache = useCallback(async () => {
    if (!swRegistration) return

    try {
      const messageChannel = new MessageChannel()
      const clearPromise = new Promise<void>(resolve => {
        messageChannel.port1.onmessage = () => resolve()
      })

      swRegistration.active?.postMessage({ type: 'CLEAR_CACHE' }, [messageChannel.port2])

      await clearPromise
      setCacheSize(0)
      console.log('[PWA] Cache cleared')
    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), 'clearCache')
      console.error('[PWA] Failed to clear cache:', error)
    }
  }, [swRegistration])

  /**
   * Apply service worker update
   */
  const applyUpdate = useCallback(() => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setUpdateAvailable(false)
      console.log('[PWA] Update applied')
    }
  }, [swRegistration])

  /**
   * Force reload
   */
  const forceReload = useCallback(() => {
    window.location.reload()
  }, [])

  /**
   * Store data for offline use
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeOfflineData = useCallback((key: string, data: any) => {
    try {
      const offlineData = {
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(`offline_${key}`, JSON.stringify(offlineData))
      return true
    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), 'storeOfflineData')
      console.error('[PWA] Failed to store offline data:', error)
      return false
    }
  }, [])

  /**
   * Retrieve offline data
   */
  const getOfflineData = useCallback((key: string) => {
    try {
      const stored = localStorage.getItem(`offline_${key}`)
      if (!stored) return null

      const { data, timestamp } = JSON.parse(stored)

      // Check if data is stale (older than 24 hours)
      const age = Date.now() - timestamp
      if (age > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`offline_${key}`)
        return null
      }

      return data
    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), 'getOfflineData')
      console.error('[PWA] Failed to retrieve offline data:', error)
      return null
    }
  }, [])

  /**
   * Clear offline data
   */
  const clearOfflineData = useCallback((key?: string) => {
    try {
      if (key) {
        localStorage.removeItem(`offline_${key}`)
      } else {
        // Clear all offline data
        Object.keys(localStorage)
          .filter(k => k.startsWith('offline_'))
          .forEach(k => localStorage.removeItem(k))
      }
      return true
    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), 'clearOfflineData')
      console.error('[PWA] Failed to clear offline data:', error)
      return false
    }
  }, [])

  /**
   * Format bytes to human-readable
   */
  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }, [])

  return {
    isOnline,
    isOfflineMode,
    updateAvailable,
    cacheSize,
    pendingSyncCount,
    applyUpdate,
    forceReload,
    clearCache,
    getCacheSize,
    syncOfflineRequestsNow,
    storeOfflineData,
    getOfflineData,
    clearOfflineData,
    formatBytes,
  }
}

/**
 * Hook for PWA install prompt
 */
// BeforeInstallPromptEvent is not in standard TypeScript types
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
      console.log('[PWA] Install prompt available')
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed on mount
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('[PWA] App installed')
      setIsInstalled(true)
      setIsInstallable(false)
    }

    setDeferredPrompt(null)
    return outcome === 'accepted'
  }, [deferredPrompt])

  return {
    isInstallable,
    isInstalled,
    promptInstall,
  }
}
