import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  trackError,
  trackWarning,
  trackInfo,
  getErrorHistory,
  clearErrorHistory,
  getErrorStats,
  exportErrorLog,
} from './errorTracking'
import type { ErrorSeverity } from './errorTracking'

describe('errorTracking', () => {
  beforeEach(() => {
    clearErrorHistory()
    vi.clearAllMocks()
  })

  afterEach(() => {
    clearErrorHistory()
  })

  describe('trackError', () => {
    it('should track an error with message', () => {
      const error = new Error('Test error')
      trackError(error, 'TestContext')

      const history = getErrorHistory()
      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        message: 'Test error',
        context: 'TestContext',
        severity: 'error',
      })
    })

    it('should track an error without context', () => {
      const error = new Error('Test error')
      trackError(error)

      const history = getErrorHistory()
      expect(history).toHaveLength(1)
      expect(history[0].message).toBe('Test error')
    })

    it('should include stack trace if available', () => {
      const error = new Error('Test error')
      trackError(error)

      const history = getErrorHistory()
      expect(history[0].stack).toBeDefined()
    })

    it('should track multiple errors', () => {
      trackError(new Error('Error 1'))
      trackError(new Error('Error 2'))
      trackError(new Error('Error 3'))

      const history = getErrorHistory()
      expect(history).toHaveLength(3)
    })

    it('should limit history to 100 errors', () => {
      // Add 150 errors
      for (let i = 0; i < 150; i++) {
        trackError(new Error(`Error ${i}`))
      }

      const history = getErrorHistory()
      expect(history).toHaveLength(100)
      expect(history[0].message).toBe('Error 50') // First 50 should be dropped
    })
  })

  describe('trackWarning', () => {
    it('should track a warning', () => {
      trackWarning('Warning message', 'TestContext')

      const history = getErrorHistory()
      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        message: 'Warning message',
        context: 'TestContext',
        severity: 'warning',
      })
    })
  })

  describe('trackInfo', () => {
    it('should track info message', () => {
      trackInfo('Info message', 'TestContext')

      const history = getErrorHistory()
      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        message: 'Info message',
        context: 'TestContext',
        severity: 'info',
      })
    })
  })

  describe('getErrorStats', () => {
    it('should return stats for empty history', () => {
      const stats = getErrorStats()
      expect(stats).toEqual({
        total: 0,
        errors: 0,
        warnings: 0,
        info: 0,
      })
    })

    it('should count errors by severity', () => {
      trackError(new Error('Error 1'))
      trackWarning('Warning 1')
      trackWarning('Warning 2')
      trackInfo('Info 1')
      trackInfo('Info 2')
      trackInfo('Info 3')

      const stats = getErrorStats()
      expect(stats).toEqual({
        total: 6,
        errors: 1,
        warnings: 2,
        info: 3,
      })
    })
  })

  describe('clearErrorHistory', () => {
    it('should clear all tracked errors', () => {
      trackError(new Error('Error 1'))
      trackError(new Error('Error 2'))

      expect(getErrorHistory()).toHaveLength(2)

      clearErrorHistory()

      expect(getErrorHistory()).toHaveLength(0)
    })
  })

  describe('exportErrorLog', () => {
    it('should export empty log', () => {
      const log = exportErrorLog()
      expect(log).toBe('[]')
    })

    it('should export errors as JSON string', () => {
      trackError(new Error('Error 1'), 'Context1')
      trackWarning('Warning 1', 'Context2')

      const log = exportErrorLog()
      const parsed = JSON.parse(log)

      expect(parsed).toHaveLength(2)
      expect(parsed[0]).toMatchObject({
        message: 'Error 1',
        context: 'Context1',
        severity: 'error',
      })
    })

    it('should include timestamp in exported log', () => {
      trackError(new Error('Error 1'))

      const log = exportErrorLog()
      const parsed = JSON.parse(log)

      expect(parsed[0].timestamp).toBeDefined()
      expect(typeof parsed[0].timestamp).toBe('number')
    })
  })

  describe('ErrorSeverity type', () => {
    it('should accept valid severity values', () => {
      const severities: ErrorSeverity[] = ['error', 'warning', 'info']
      expect(severities).toHaveLength(3)
    })
  })

  describe('integration', () => {
    it('should handle mixed severity tracking', () => {
      trackError(new Error('Critical error'), 'AuthService')
      trackWarning('Deprecated API used', 'APIClient')
      trackInfo('User logged in', 'AuthContext')
      trackError(new Error('Network timeout'), 'APIClient')

      const history = getErrorHistory()
      expect(history).toHaveLength(4)

      const stats = getErrorStats()
      expect(stats.errors).toBe(2)
      expect(stats.warnings).toBe(1)
      expect(stats.info).toBe(1)
    })

    it('should preserve chronological order', () => {
      trackError(new Error('Error 1'))
      trackError(new Error('Error 2'))
      trackError(new Error('Error 3'))

      const history = getErrorHistory()
      expect(history[0].timestamp).toBeLessThanOrEqual(history[1].timestamp)
      expect(history[1].timestamp).toBeLessThanOrEqual(history[2].timestamp)
    })
  })
})
