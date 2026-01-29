import { useEffect, useRef } from 'react'

interface UseKeyboardNavigationOptions {
  /** Whether the modal/panel is visible */
  isOpen?: boolean
  /** Callback when Escape key is pressed */
  onClose?: () => void
  /** Whether to trap focus within the container (default: true) */
  trapFocus?: boolean
  /** Whether to focus the first element on open (default: true) */
  autoFocus?: boolean
  /** Whether to restore focus on close (default: true) */
  restoreFocus?: boolean
}

/**
 * Custom hook to handle keyboard navigation for modals and panels.
 * Provides focus trap, Tab cycling, Escape key handling, and focus management.
 *
 * @param options - Configuration options
 * @returns A ref to attach to the modal/panel container
 *
 * @example
 * ```tsx
 * function MyModal({ isOpen, onClose }) {
 *   const modalRef = useKeyboardNavigation({ isOpen, onClose });
 *
 *   return (
 *     <div ref={modalRef} role="dialog" aria-modal="true">
 *       <input type="text" />
 *       <button>Submit</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useKeyboardNavigation<T extends HTMLElement>({
  isOpen = false,
  onClose,
  trapFocus = true,
  autoFocus = true,
  restoreFocus = true,
}: UseKeyboardNavigationOptions = {}) {
  const containerRef = useRef<T>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (isOpen && restoreFocus) {
      previousActiveElementRef.current = document.activeElement as HTMLElement
    }
  }, [isOpen, restoreFocus])

  // Focus the first focusable element when modal opens
  useEffect(() => {
    if (!isOpen || !autoFocus || !containerRef.current) return

    // Use setTimeout to ensure the modal is fully rendered
    const timeoutId = setTimeout(() => {
      const focusableElements = getFocusableElements(containerRef.current!)
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }, 10)

    return () => clearTimeout(timeoutId)
  }, [isOpen, autoFocus])

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen || !restoreFocus) return

    return () => {
      const previousElement = previousActiveElementRef.current
      if (previousElement && document.contains(previousElement)) {
        previousElement.focus()
      }
    }
  }, [isOpen, restoreFocus])

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key - close the modal
      if (event.key === 'Escape' && onClose) {
        event.preventDefault()
        onClose()
        return
      }

      // Tab key - trap focus within the modal
      if (event.key === 'Tab' && trapFocus) {
        const focusableElements = getFocusableElements(containerRef.current!)

        if (focusableElements.length === 0) {
          event.preventDefault()
          return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        // If Shift+Tab on first element, cycle to last
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
          return
        }

        // If Tab on last element, cycle to first
        if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, trapFocus])

  return containerRef
}

/**
 * Get all focusable elements within a container.
 * Focusable elements are: buttons, links, inputs, textareas, selects, and elements with tabindex >= 0
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ')

  const elements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors))

  // Filter out elements that are not visible or are hidden
  return elements.filter(element => {
    const style = window.getComputedStyle(element)
    return (
      style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null
    )
  })
}
