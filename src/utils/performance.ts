/**
 * Performance monitoring and Web Vitals tracking
 *
 * Tracks Core Web Vitals (CLS, FID, LCP, FCP, TTFB) and provides
 * utilities for measuring render performance.
 *
 * Integrates with web-vitals library for automatic metric collection.
 *
 * @example
 * ```tsx
 * import { trackWebVitals, measureRender } from './utils/performance';
 *
 * // In main.tsx
 * import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';
 *
 * onCLS(trackWebVitals);
 * onFID(trackWebVitals);
 * onLCP(trackWebVitals);
 * onFCP(trackWebVitals);
 * onTTFB(trackWebVitals);
 *
 * // Measure component render
 * function MyComponent() {
 *   const data = measureRender('MyComponent-data', () => fetch(...));
 * }
 * ```
 */

export type WebVitalName = 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB'

export interface WebVitalsMetric {
  name: WebVitalName
  value: number
  id: string
  timestamp: number
}

export interface PerformanceEntry {
  name: string
  duration: number
  startTime: number
  timestamp: number
}

export interface PerformanceStats {
  cls: number | null
  fid: number | null
  lcp: number | null
  fcp: number | null
  ttfb: number | null
  count: number
}

// In-memory storage for metrics
const webVitalsMetrics: WebVitalsMetric[] = []
const performanceEntries: PerformanceEntry[] = []

/**
 * Track a Web Vitals metric
 *
 * Called by web-vitals library when a metric is measured
 *
 * @param metric - The metric from web-vitals library
 */
export function trackWebVitals(metric: { name: WebVitalName; value: number; id: string }): void {
  const webVital: WebVitalsMetric = {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    timestamp: Date.now(),
  }

  webVitalsMetrics.push(webVital)

  // Log in development
  if (import.meta.env.DEV) {
    const rating = getMetricRating(metric.name, metric.value)
    console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)} (${rating})`)
  }
}

/**
 * Get all tracked Web Vitals metrics
 *
 * @returns Array of tracked metrics
 */
export function getWebVitalsMetrics(): WebVitalsMetric[] {
  return [...webVitalsMetrics]
}

/**
 * Get performance statistics
 *
 * Returns the latest value for each metric type
 *
 * @returns Object with metric values
 */
export function getPerformanceStats(): PerformanceStats {
  const stats: PerformanceStats = {
    cls: null,
    fid: null,
    lcp: null,
    fcp: null,
    ttfb: null,
    count: webVitalsMetrics.length,
  }

  // Get latest value for each metric type
  for (const metric of webVitalsMetrics) {
    switch (metric.name) {
      case 'CLS':
        stats.cls = metric.value
        break
      case 'FID':
        stats.fid = metric.value
        break
      case 'LCP':
        stats.lcp = metric.value
        break
      case 'FCP':
        stats.fcp = metric.value
        break
      case 'TTFB':
        stats.ttfb = metric.value
        break
    }
  }

  return stats
}

/**
 * Measure render time for a function
 *
 * Wraps a function and measures its execution time
 *
 * @param name - Label for the measurement
 * @param fn - Function to measure
 * @returns Result of the function
 *
 * @example
 * ```tsx
 * const data = measureRender('fetchData', () => fetchData());
 * ```
 */
export function measureRender<T>(name: string, fn: () => T): T {
  const startTime = performance.now()
  const result = fn()
  const duration = performance.now() - startTime

  const entry: PerformanceEntry = {
    name,
    duration,
    startTime,
    timestamp: Date.now(),
  }

  performanceEntries.push(entry)

  // Log in development if slow (> 16ms = 1 frame)
  if (import.meta.env.DEV && duration > 16) {
    console.warn(`[Performance] Slow render detected: ${name} took ${duration.toFixed(2)}ms`)
  }

  return result
}

/**
 * Get performance rating for a metric
 *
 * Returns "good", "needs improvement", or "poor" based on thresholds
 *
 * @param name - Metric name
 * @param value - Metric value
 * @returns Performance rating
 */
function getMetricRating(name: WebVitalName, value: number): string {
  switch (name) {
    case 'CLS':
      if (value <= 0.1) return 'good'
      if (value <= 0.25) return 'needs improvement'
      return 'poor'

    case 'FID':
      if (value <= 100) return 'good'
      if (value <= 300) return 'needs improvement'
      return 'poor'

    case 'LCP':
      if (value <= 2500) return 'good'
      if (value <= 4000) return 'needs improvement'
      return 'poor'

    case 'FCP':
      if (value <= 1800) return 'good'
      if (value <= 3000) return 'needs improvement'
      return 'poor'

    case 'TTFB':
      if (value <= 800) return 'good'
      if (value <= 1800) return 'needs improvement'
      return 'poor'

    default:
      return 'unknown'
  }
}

/**
 * Get all performance entries
 *
 * @returns Array of performance entries
 */
export function getPerformanceEntries(): PerformanceEntry[] {
  return [...performanceEntries]
}

/**
 * Clear performance data
 */
export function clearPerformanceData(): void {
  webVitalsMetrics.length = 0
  performanceEntries.length = 0
}

/**
 * Export performance metrics as JSON
 *
 * @returns JSON string of performance data
 */
export function exportPerformanceMetrics(): string {
  return JSON.stringify(
    {
      webVitals: getWebVitalsMetrics(),
      performanceEntries: getPerformanceEntries(),
      stats: getPerformanceStats(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  )
}

/**
 * Check if performance metrics indicate good user experience
 *
 * @returns true if all metrics are in "good" range
 */
export function isPerformanceGood(): boolean | null {
  const stats = getPerformanceStats()

  // Need all metrics to determine
  if (stats.cls === null || stats.fid === null || stats.lcp === null) {
    return null
  }

  return stats.cls <= 0.1 && stats.fid <= 100 && stats.lcp <= 2500
}

/**
 * Get performance recommendations
 *
 * Analyzes metrics and provides actionable recommendations
 *
 * @returns Array of recommendation strings
 */
export function getPerformanceRecommendations(): string[] {
  const recommendations: string[] = []
  const stats = getPerformanceStats()

  if (stats.cls !== null && stats.cls > 0.1) {
    recommendations.push(
      'CLS is high. Avoid shifting content by reserving space for images and ads.'
    )
  }

  if (stats.fid !== null && stats.fid > 100) {
    recommendations.push('FID is high. Reduce JavaScript execution time and break up long tasks.')
  }

  if (stats.lcp !== null && stats.lcp > 2500) {
    recommendations.push('LCP is slow. Optimize images, use CDN, and reduce server response time.')
  }

  if (stats.fcp !== null && stats.fcp > 1800) {
    recommendations.push('FCP is slow. Reduce render-blocking resources and minimize CSS.')
  }

  if (stats.ttfb !== null && stats.ttfb > 800) {
    recommendations.push('TTFB is slow. Optimize server response time and use CDN caching.')
  }

  if (recommendations.length === 0 && stats.count > 0) {
    recommendations.push('Performance is good! No major issues detected.')
  }

  return recommendations
}
