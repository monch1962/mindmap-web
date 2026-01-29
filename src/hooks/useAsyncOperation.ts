/**
 * useAsyncOperation Hook
 *
 * Wraps async operations with loading state, error handling, and error tracking.
 * Provides a clean interface for managing async operations in components.
 *
 * @example
 * ```tsx
 * const { execute, isLoading, error, data, reset } = useAsyncOperation<string, Error>();
 *
 * const handleSave = async () => {
 *   try {
 *     const result = await execute(() => api.saveData(), 'SaveData');
 *     // Handle success
 *   } catch (err) {
 *     // Handle error (already tracked)
 *   }
 * };
 * ```
 */

import { useState, useCallback, useRef } from 'react'
import { trackError, trackInfo } from '../utils/errorTracking'

export interface UseAsyncOperationState<T, E = Error> {
  data: T | null
  error: E | null
  isLoading: boolean
}

export type UseAsyncOperationsReturn<T, E = Error> = UseAsyncOperationState<T, E> & {
  execute: <R = T>(operation: () => Promise<R>, context: string) => Promise<R>
  reset: () => void
}

export function useAsyncOperation<T = void, E = Error>(): UseAsyncOperationsReturn<T, E> {
  const [state, setState] = useState<UseAsyncOperationState<T, E>>({
    data: null,
    error: null,
    isLoading: false,
  })

  const isLoadingRef = useRef(false)

  const execute = useCallback(
    async <R = T>(operation: () => Promise<R>, context: string): Promise<R> => {
      // Prevent concurrent operations
      if (isLoadingRef.current) {
        const error = new Error('Operation already in progress')
        trackError(error, `${context} - useAsyncOperation`)
        throw error
      }

      isLoadingRef.current = true
      setState({ data: null, error: null, isLoading: true })

      try {
        trackInfo(`Starting operation: ${context}`, context)
        const result = await operation()
        trackInfo(`Operation completed: ${context}`, context)

        setState({ data: result as unknown as T, error: null, isLoading: false })
        return result
      } catch (error) {
        const errorObj = error as E
        trackError(errorObj instanceof Error ? errorObj : new Error(String(error)), context)

        setState({ data: null, error: errorObj, isLoading: false })
        throw errorObj
      } finally {
        isLoadingRef.current = false
      }
    },
    []
  )

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false })
  }, [])

  return {
    execute,
    reset,
    ...state,
  }
}
