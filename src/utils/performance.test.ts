import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  measureRender,
  trackWebVitals,
  getWebVitalsMetrics,
  getPerformanceStats,
  clearPerformanceData,
} from './performance'

describe('performance', () => {
  beforeEach(() => {
    // Clear performance data
    clearPerformanceData()
    vi.clearAllMocks()
  })

  describe('measureRender', () => {
    it('should measure render time', () => {
      const callback = vi.fn(() => 42)
      const result = measureRender('TestComponent', callback)

      expect(result).toBe(42)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should execute callback and return its value', () => {
      const callback = vi.fn(() => 'test result')
      const result = measureRender('TestComponent', callback)

      expect(result).toBe('test result')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should handle errors in callback', () => {
      const error = new Error('Test error')
      const callback = vi.fn(() => {
        throw error
      })

      expect(() => measureRender('TestComponent', callback)).toThrow(error)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('trackWebVitals', () => {
    it('should track CLS metric', () => {
      const metric = { name: 'CLS' as const, value: 0.1, id: 'cls-1' }
      trackWebVitals(metric)

      const vitals = getWebVitalsMetrics()
      expect(vitals).toContainEqual(
        expect.objectContaining({
          name: 'CLS',
          value: 0.1,
        })
      )
    })

    it('should track FID metric', () => {
      const metric = { name: 'FID' as const, value: 100, id: 'fid-1' }
      trackWebVitals(metric)

      const vitals = getWebVitalsMetrics()
      expect(vitals).toContainEqual(
        expect.objectContaining({
          name: 'FID',
          value: 100,
        })
      )
    })

    it('should track LCP metric', () => {
      const metric = { name: 'LCP' as const, value: 2000, id: 'lcp-1' }
      trackWebVitals(metric)

      const vitals = getWebVitalsMetrics()
      expect(vitals).toContainEqual(
        expect.objectContaining({
          name: 'LCP',
          value: 2000,
        })
      )
    })

    it('should track FCP metric', () => {
      const metric = { name: 'FCP' as const, value: 1500, id: 'fcp-1' }
      trackWebVitals(metric)

      const vitals = getWebVitalsMetrics()
      expect(vitals).toContainEqual(
        expect.objectContaining({
          name: 'FCP',
          value: 1500,
        })
      )
    })

    it('should track TTFB metric', () => {
      const metric = { name: 'TTFB' as const, value: 500, id: 'ttfb-1' }
      trackWebVitals(metric)

      const vitals = getWebVitalsMetrics()
      expect(vitals).toContainEqual(
        expect.objectContaining({
          name: 'TTFB',
          value: 500,
        })
      )
    })

    it('should track multiple metrics', () => {
      trackWebVitals({ name: 'CLS', value: 0.1, id: 'cls-1' })
      trackWebVitals({ name: 'LCP', value: 2000, id: 'lcp-1' })
      trackWebVitals({ name: 'FID', value: 100, id: 'fid-1' })

      const vitals = getWebVitalsMetrics()
      expect(vitals).toHaveLength(3)
    })

    it('should include timestamp in metric', () => {
      const beforeTime = Date.now()
      trackWebVitals({ name: 'CLS', value: 0.1, id: 'cls-1' })
      const afterTime = Date.now()

      const vitals = getWebVitalsMetrics()
      const metric = vitals.find(v => v.name === 'CLS')

      expect(metric).toBeDefined()
      expect(metric!.timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(metric!.timestamp).toBeLessThanOrEqual(afterTime)
    })
  })

  describe('getPerformanceStats', () => {
    it('should return stats for empty metrics', () => {
      const stats = getPerformanceStats()

      expect(stats).toEqual({
        cls: null,
        fid: null,
        lcp: null,
        fcp: null,
        ttfb: null,
        count: 0,
      })
    })

    it('should return stats with metric values', () => {
      trackWebVitals({ name: 'CLS', value: 0.1, id: 'cls-1' })
      trackWebVitals({ name: 'LCP', value: 2000, id: 'lcp-1' })
      trackWebVitals({ name: 'FID', value: 100, id: 'fid-1' })

      const stats = getPerformanceStats()

      expect(stats.cls).toBe(0.1)
      expect(stats.lcp).toBe(2000)
      expect(stats.fid).toBe(100)
      expect(stats.fcp).toBeNull()
      expect(stats.ttfb).toBeNull()
      expect(stats.count).toBe(3)
    })

    it('should use latest value for duplicate metrics', () => {
      trackWebVitals({ name: 'CLS', value: 0.1, id: 'cls-1' })
      trackWebVitals({ name: 'CLS', value: 0.2, id: 'cls-2' })

      const stats = getPerformanceStats()
      expect(stats.cls).toBe(0.2)
    })
  })

  describe('integration', () => {
    it('should track all web vitals and provide stats', () => {
      const metrics = [
        { name: 'CLS' as const, value: 0.05, id: 'cls-1' },
        { name: 'FID' as const, value: 50, id: 'fid-1' },
        { name: 'LCP' as const, value: 1800, id: 'lcp-1' },
        { name: 'FCP' as const, value: 1200, id: 'fcp-1' },
        { name: 'TTFB' as const, value: 400, id: 'ttfb-1' },
      ]

      metrics.forEach(metric => trackWebVitals(metric))

      const vitals = getWebVitalsMetrics()
      expect(vitals).toHaveLength(5)

      const stats = getPerformanceStats()
      expect(stats).toEqual({
        cls: 0.05,
        fid: 50,
        lcp: 1800,
        fcp: 1200,
        ttfb: 400,
        count: 5,
      })
    })

    it('should measure render performance', () => {
      let iterations = 0
      const work = () => {
        iterations++
        for (let i = 0; i < 1000; i++) {
          Math.sqrt(i)
        }
        return iterations
      }

      const duration = measureRender('HeavyWork', work)
      expect(duration).toBeGreaterThan(0)
      expect(work()).toBe(2) // Called twice (once in measureRender, once here)
    })
  })
})
