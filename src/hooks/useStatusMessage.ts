import { useState, useCallback, useRef, useEffect } from 'react'
import type { StatusMessage } from '../types/common'

interface UseStatusMessageOptions {
  /** Duration in milliseconds to show the message (default: 3000) */
  duration?: number
  /** Whether to clear existing timeout when showing new message (default: true) */
  clearOnNew?: boolean
}

interface UseStatusMessageReturn {
  /** The current status message, or null if no message is shown */
  statusMessage: StatusMessage | null
  /** Function to show a status message */
  showStatus: (type: StatusMessage['type'], text: string) => void
  /** Function to clear the current status message */
  clearStatus: () => void
  /** Function to update the current status message text */
  updateStatusText: (text: string) => void
  /** Function to update the current status message type */
  updateStatusType: (type: StatusMessage['type']) => void
}

/**
 * Custom hook for managing status messages with auto-dismiss functionality
 * Replaces duplicated showStatus functions across multiple components
 */
export function useStatusMessage(options: UseStatusMessageOptions = {}): UseStatusMessageReturn {
  const { duration = 3000, clearOnNew = true } = options

  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimeoutIfExists = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const showStatus = useCallback(
    (type: StatusMessage['type'], text: string) => {
      if (clearOnNew) {
        clearTimeoutIfExists()
      }

      setStatusMessage({ type, text })

      timeoutRef.current = setTimeout(() => {
        setStatusMessage(null)
        timeoutRef.current = null
      }, duration)
    },
    [duration, clearOnNew, clearTimeoutIfExists]
  )

  const clearStatus = useCallback(() => {
    clearTimeoutIfExists()
    setStatusMessage(null)
  }, [clearTimeoutIfExists])

  const updateStatusText = useCallback((text: string) => {
    setStatusMessage(prev => (prev ? { ...prev, text } : null))
  }, [])

  const updateStatusType = useCallback((type: StatusMessage['type']) => {
    setStatusMessage(prev => (prev ? { ...prev, type } : null))
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeoutIfExists()
    }
  }, [clearTimeoutIfExists])

  return {
    statusMessage,
    showStatus,
    clearStatus,
    updateStatusText,
    updateStatusType,
  }
}
