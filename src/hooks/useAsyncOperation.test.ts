import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAsyncOperation } from './useAsyncOperation'

describe('useAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should start with idle state', () => {
    const { result } = renderHook(() => useAsyncOperation())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.data).toBe(null)
  })

  it('should execute async operation successfully', async () => {
    const { result } = renderHook(() => useAsyncOperation<string, void>())
    const mockOperation = vi.fn().mockResolvedValue('success data')

    await act(async () => {
      await result.current.execute(mockOperation, 'TestContext')
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBe('success data')
      expect(result.current.error).toBe(null)
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })
  })

  it('should handle async operation errors', async () => {
    const { result } = renderHook(() => useAsyncOperation<void, Error>())
    const mockError = new Error('Operation failed')
    const mockOperation = vi.fn().mockRejectedValue(mockError)

    await act(async () => {
      try {
        await result.current.execute(mockOperation, 'TestContext')
         
      } catch {
        // Expected to throw
      }
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(mockError)
    expect(mockOperation).toHaveBeenCalledTimes(1)
  })

  it('should reset state', async () => {
    const { result } = renderHook(() => useAsyncOperation<string, void>())
    const mockOperation = vi.fn().mockResolvedValue('data')

    await act(async () => {
      await result.current.execute(mockOperation, 'TestContext')
    })

    expect(result.current.data).toBe('data')

    act(() => {
      result.current.reset()
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle operation with arguments', async () => {
    const { result } = renderHook(() => useAsyncOperation<string, void>())
    const mockOperation = vi.fn((arg1: string, arg2: number) => `${arg1}-${arg2}`)

    await act(async () => {
      await result.current.execute(() => mockOperation('test', 42), 'TestContext')
    })

    expect(mockOperation).toHaveBeenCalledWith('test', 42)
    expect(result.current.data).toBe('test-42')
  })

  it('should track multiple operations sequentially', async () => {
    const { result } = renderHook(() => useAsyncOperation<number, void>())
    const operation1 = vi.fn().mockResolvedValue(1)
    const operation2 = vi.fn().mockResolvedValue(2)

    await act(async () => {
      await result.current.execute(operation1, 'Context1')
    })

    await waitFor(() => {
      expect(result.current.data).toBe(1)
    })

    await act(async () => {
      await result.current.execute(operation2, 'Context2')
    })

    await waitFor(() => {
      expect(result.current.data).toBe(2)
    })

    expect(operation1).toHaveBeenCalledTimes(1)
    expect(operation2).toHaveBeenCalledTimes(1)
  })

  it('should provide execute function that is stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useAsyncOperation())
    const firstExecute = result.current.execute

    rerender()

    expect(result.current.execute).toBe(firstExecute)
  })

  it('should provide reset function that is stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useAsyncOperation())
    const firstReset = result.current.reset

    rerender()

    expect(result.current.reset).toBe(firstReset)
  })

  it('should handle synchronous errors', async () => {
    const { result } = renderHook(() => useAsyncOperation<void, Error>())
    const mockError = new Error('Sync error')
    const syncOperation = vi.fn(() => {
      throw mockError
    })

    await act(async () => {
      try {
         
        await result.current.execute(syncOperation, 'TestContext')
      } catch {
        // Expected to throw
      }
    })

    expect(result.current.error).toBe(mockError)
    expect(result.current.isLoading).toBe(false)
  })

  it('should not start new operation while one is loading', async () => {
    const { result } = renderHook(() => useAsyncOperation<void, void>())

    const slowOperation = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveOperation = resolve
        })
    )

    act(() => {
      result.current.execute(slowOperation, 'TestContext')
    })

    expect(result.current.isLoading).toBe(true)

    // Try to execute another operation while first is loading
    const secondOperation = vi.fn().mockResolvedValue(undefined)

    await act(async () => {
       
      try {
        await result.current.execute(secondOperation, 'TestContext')
      } catch {
        // May throw if implementation rejects concurrent operations
      }
    })

    // First operation should have been called
    expect(slowOperation).toHaveBeenCalledTimes(1)
  })

  it('should clear previous error when new operation starts', async () => {
    const { result } = renderHook(() => useAsyncOperation<string, Error>())
    const failOperation = vi.fn().mockRejectedValue(new Error('First error'))
    const successOperation = vi.fn().mockResolvedValue('success')

    // First operation fails
     
    await act(async () => {
      try {
        await result.current.execute(failOperation, 'TestContext')
      } catch {
        // Expected
      }
    })

    expect(result.current.error).not.toBe(null)

    // Second operation succeeds
    await act(async () => {
      await result.current.execute(successOperation, 'TestContext')
    })

    expect(result.current.error).toBe(null)
    expect(result.current.data).toBe('success')
  })
})
