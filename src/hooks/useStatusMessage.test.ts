import { renderHook, act } from '@testing-library/react'
import { useStatusMessage } from './useStatusMessage'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('useStatusMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial state with null message', () => {
    const { result } = renderHook(() => useStatusMessage())

    expect(result.current.statusMessage).toBeNull()
    expect(typeof result.current.showStatus).toBe('function')
    expect(typeof result.current.clearStatus).toBe('function')
  })

  it('shows status message with showStatus', () => {
    const { result } = renderHook(() => useStatusMessage())

    act(() => {
      result.current.showStatus('success', 'Test message')
    })

    expect(result.current.statusMessage).toEqual({
      type: 'success',
      text: 'Test message',
    })
  })

  it('clears status message after default duration', () => {
    const { result } = renderHook(() => useStatusMessage())

    act(() => {
      result.current.showStatus('error', 'Test error')
    })

    expect(result.current.statusMessage).not.toBeNull()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.statusMessage).toBeNull()
  })

  it('clears status message with clearStatus', () => {
    const { result } = renderHook(() => useStatusMessage())

    act(() => {
      result.current.showStatus('success', 'Test message')
    })

    expect(result.current.statusMessage).not.toBeNull()

    act(() => {
      result.current.clearStatus()
    })

    expect(result.current.statusMessage).toBeNull()
  })

  it('uses custom duration when provided', () => {
    const { result } = renderHook(() => useStatusMessage({ duration: 5000 }))

    act(() => {
      result.current.showStatus('success', 'Test message')
    })

    expect(result.current.statusMessage).not.toBeNull()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // Should still be visible after 3 seconds (custom duration is 5 seconds)
    expect(result.current.statusMessage).not.toBeNull()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Should be cleared after 5 seconds
    expect(result.current.statusMessage).toBeNull()
  })

  it('clears previous timeout when showing new message with clearOnNew true', () => {
    const { result } = renderHook(() => useStatusMessage({ clearOnNew: true }))

    act(() => {
      result.current.showStatus('success', 'First message')
    })

    const firstTimeout = vi.getTimerCount()

    act(() => {
      result.current.showStatus('error', 'Second message')
    })

    // Should have cleared previous timeout and set new one
    expect(vi.getTimerCount()).toBe(firstTimeout) // Same number of timers

    expect(result.current.statusMessage).toEqual({
      type: 'error',
      text: 'Second message',
    })
  })

  it('does not clear previous timeout when clearOnNew is false', () => {
    const { result } = renderHook(() => useStatusMessage({ clearOnNew: false }))

    act(() => {
      result.current.showStatus('success', 'First message')
    })

    // First timeout should still be running
    expect(vi.getTimerCount()).toBe(1)

    act(() => {
      result.current.showStatus('error', 'Second message')
    })

    // Now should have 2 timers running
    expect(vi.getTimerCount()).toBe(2)
  })

  it('updates status message text with updateStatusText', () => {
    const { result } = renderHook(() => useStatusMessage())

    act(() => {
      result.current.showStatus('success', 'Original message')
    })

    expect(result.current.statusMessage?.text).toBe('Original message')

    act(() => {
      result.current.updateStatusText('Updated message')
    })

    expect(result.current.statusMessage).toEqual({
      type: 'success',
      text: 'Updated message',
    })
  })

  it('updates status message type with updateStatusType', () => {
    const { result } = renderHook(() => useStatusMessage())

    act(() => {
      result.current.showStatus('success', 'Test message')
    })

    expect(result.current.statusMessage?.type).toBe('success')

    act(() => {
      result.current.updateStatusType('error')
    })

    expect(result.current.statusMessage).toEqual({
      type: 'error',
      text: 'Test message',
    })
  })

  it('updateStatusText does nothing when no message is shown', () => {
    const { result } = renderHook(() => useStatusMessage())

    act(() => {
      result.current.updateStatusText('New text')
    })

    expect(result.current.statusMessage).toBeNull()
  })

  it('updateStatusType does nothing when no message is shown', () => {
    const { result } = renderHook(() => useStatusMessage())

    act(() => {
      result.current.updateStatusType('warning')
    })

    expect(result.current.statusMessage).toBeNull()
  })

  it('cleans up timeout on unmount', () => {
    const { result, unmount } = renderHook(() => useStatusMessage())

    act(() => {
      // Trigger a timeout
      result.current.showStatus('success', 'Test')
    })

    const timerCountBefore = vi.getTimerCount()
    expect(timerCountBefore).toBeGreaterThan(0)

    unmount()

    // Timer should be cleaned up
    expect(vi.getTimerCount()).toBe(0)
  })

  it('supports all message types', () => {
    const { result } = renderHook(() => useStatusMessage())

    const types: Array<'success' | 'error' | 'warning' | 'info'> = [
      'success',
      'error',
      'warning',
      'info',
    ]

    types.forEach(type => {
      act(() => {
        result.current.showStatus(type, `${type} message`)
      })

      expect(result.current.statusMessage).toEqual({
        type,
        text: `${type} message`,
      })

      act(() => {
        result.current.clearStatus()
      })
    })
  })
})
