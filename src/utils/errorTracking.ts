/**
 * Central error tracking utility
 *
 * Tracks errors, warnings, and info messages for debugging and monitoring.
 * Maintains an in-memory history with configurable limits.
 * TODO: Integrate with external error tracking service (e.g., Sentry)
 */

export type ErrorSeverity = 'error' | 'warning' | 'info'

export interface ErrorEntry {
  id: string
  message: string
  severity: ErrorSeverity
  context?: string
  stack?: string
  timestamp: number
  userAgent?: string
  url?: string
}

interface ErrorStats {
  total: number
  errors: number
  warnings: number
  info: number
}

const MAX_HISTORY_SIZE = 100
const STORAGE_KEY = 'mindmap_error_history'

// In-memory error history
let errorHistory: ErrorEntry[] = []

/**
 * Initialize error tracking from localStorage
 */
function initErrorTracking(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        errorHistory = parsed.slice(0, MAX_HISTORY_SIZE)
      }
    }
  } catch (error) {
    console.warn('Failed to load error history from localStorage:', error)
  }
}

/**
 * Save error history to localStorage
 */
function saveErrorHistory(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(errorHistory))
  } catch (error) {
    console.warn('Failed to save error history to localStorage:', error)
  }
}

/**
 * Generate unique error ID
 */
function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Track an error
 *
 * @param error - The error object or message
 * @param context - Optional context where the error occurred
 */
export function trackError(error: Error | string, context?: string): void {
  const message = typeof error === 'string' ? error : error.message
  const stack = typeof error === 'string' ? undefined : error.stack

  const entry: ErrorEntry = {
    id: generateErrorId(),
    message,
    severity: 'error',
    context,
    stack,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  }

  addEntry(entry)

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`[ErrorTracking] ${context ? `[${context}] ` : ''}${message}`, error)
  }

  // TODO: Send to error tracking service
  // sendToErrorService(entry);
}

/**
 * Track a warning
 *
 * @param message - Warning message
 * @param context - Optional context where the warning occurred
 */
export function trackWarning(message: string, context?: string): void {
  const entry: ErrorEntry = {
    id: generateErrorId(),
    message,
    severity: 'warning',
    context,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  }

  addEntry(entry)

  // Log to console in development
  if (import.meta.env.DEV) {
    console.warn(`[ErrorTracking] ${context ? `[${context}] ` : ''}${message}`)
  }
}

/**
 * Track an info message
 *
 * @param message - Info message
 * @param context - Optional context
 */
export function trackInfo(message: string, context?: string): void {
  const entry: ErrorEntry = {
    id: generateErrorId(),
    message,
    severity: 'info',
    context,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  }

  addEntry(entry)

  // Log to console in development
  if (import.meta.env.DEV) {
    console.info(`[ErrorTracking] ${context ? `[${context}] ` : ''}${message}`)
  }
}

/**
 * Add entry to history with size limit
 */
function addEntry(entry: ErrorEntry): void {
  errorHistory.push(entry)

  // Limit history size
  if (errorHistory.length > MAX_HISTORY_SIZE) {
    errorHistory = errorHistory.slice(-MAX_HISTORY_SIZE)
  }

  saveErrorHistory()
}

/**
 * Get error history
 *
 * @returns Array of error entries
 */
export function getErrorHistory(): ErrorEntry[] {
  return [...errorHistory]
}

/**
 * Get error statistics
 *
 * @returns Object with error counts by severity
 */
export function getErrorStats(): ErrorStats {
  const stats: ErrorStats = {
    total: errorHistory.length,
    errors: 0,
    warnings: 0,
    info: 0,
  }

  for (const entry of errorHistory) {
    if (entry.severity === 'error') stats.errors++
    else if (entry.severity === 'warning') stats.warnings++
    else if (entry.severity === 'info') stats.info++
  }

  return stats
}

/**
 * Clear error history
 */
export function clearErrorHistory(): void {
  errorHistory = []
  saveErrorHistory()
}

/**
 * Export error log as JSON string
 *
 * @returns JSON string of error history
 */
export function exportErrorLog(): string {
  return JSON.stringify(errorHistory, null, 2)
}

/**
 * Track async operation errors
 *
 * Wraps async operations with error tracking
 *
 * @param operation - Async function to execute
 * @param context - Context for error tracking
 * @returns Promise with operation result
 */
export async function trackAsyncOperation<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    trackInfo(`Starting operation: ${context}`, context)
    const result = await operation()
    trackInfo(`Operation completed: ${context}`, context)
    return result
  } catch (error) {
    if (error instanceof Error) {
      trackError(error, context)
    } else {
      trackError(String(error), context)
    }
    throw error // Re-throw for caller to handle
  }
}

// Initialize on module load
initErrorTracking()
