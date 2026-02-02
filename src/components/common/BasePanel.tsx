import React, { useEffect, useRef, type ReactNode } from 'react'
import type { PanelProps, PanelPosition, PanelSize } from '../../types/common'

interface BasePanelProps extends PanelProps {
  /** Content to render inside the panel */
  children: ReactNode
  /** Position of the panel on screen */
  position?: PanelPosition
  /** Size preset for the panel */
  size?: PanelSize
  /** Custom styles to override defaults */
  customStyles?: React.CSSProperties
  /** Whether to show the close button (default: true) */
  showCloseButton?: boolean
  /** Whether to trap focus inside the panel (default: true) */
  trapFocus?: boolean
  /** Whether to close on escape key (default: true) */
  closeOnEscape?: boolean
  /** Whether to close on backdrop click (default: false) */
  closeOnBackdropClick?: boolean
  /** Optional backdrop element */
  backdrop?: ReactNode
}

/**
 * Base panel component that provides common functionality for all panels
 * Handles positioning, styling, accessibility, and common interactions
 */
export default function BasePanel({
  visible,
  onClose,
  title,
  className = '',
  ariaLabel,
  children,
  position = 'right',
  size = 'md',
  customStyles = {},
  showCloseButton = true,
  trapFocus = true,
  closeOnEscape = true,
  closeOnBackdropClick = false,
  backdrop,
}: BasePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Handle escape key to close panel
  useEffect(() => {
    if (!visible || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [visible, closeOnEscape, onClose])

  // Handle backdrop click
  useEffect(() => {
    if (!visible || !closeOnBackdropClick || !panelRef.current) return

    const handleBackdropClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleBackdropClick)
    return () => document.removeEventListener('mousedown', handleBackdropClick)
  }, [visible, closeOnBackdropClick, onClose])

  // Focus management
  useEffect(() => {
    if (!visible || !trapFocus || !panelRef.current) return

    const panelElement = panelRef.current
    const focusableElements = panelElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      } else if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    }

    panelElement.addEventListener('keydown', handleTabKey)
    return () => panelElement.removeEventListener('keydown', handleTabKey)
  }, [visible, trapFocus])

  // Auto-focus when panel opens
  useEffect(() => {
    if (visible && trapFocus && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length > 0) {
        ;(focusableElements[0] as HTMLElement).focus()
      } else {
        panelRef.current.focus()
      }
    }
  }, [visible, trapFocus])

  if (!visible) return null

  // Calculate position styles
  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1000,
      background: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
    }

    const sizeStyles = getSizeStyles()

    switch (position) {
      case 'right':
        return {
          ...baseStyles,
          ...sizeStyles,
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
        }
      case 'left':
        return {
          ...baseStyles,
          ...sizeStyles,
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
        }
      case 'center':
        return {
          ...baseStyles,
          ...sizeStyles,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }
      case 'top':
        return {
          ...baseStyles,
          ...sizeStyles,
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
        }
      case 'bottom':
        return {
          ...baseStyles,
          ...sizeStyles,
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
        }
      case 'top-right':
        return {
          ...baseStyles,
          ...sizeStyles,
          top: '20px',
          right: '20px',
        }
      case 'top-left':
        return {
          ...baseStyles,
          ...sizeStyles,
          top: '20px',
          left: '20px',
        }
      case 'bottom-right':
        return {
          ...baseStyles,
          ...sizeStyles,
          bottom: '20px',
          right: '20px',
        }
      case 'bottom-left':
        return {
          ...baseStyles,
          ...sizeStyles,
          bottom: '20px',
          left: '20px',
        }
      default:
        return baseStyles
    }
  }

  // Calculate size styles
  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { width: '300px', maxWidth: '90vw', maxHeight: '60vh' }
      case 'md':
        return { width: '400px', maxWidth: '90vw', maxHeight: '70vh' }
      case 'lg':
        return { width: '500px', maxWidth: '90vw', maxHeight: '80vh' }
      case 'xl':
        return { width: '600px', maxWidth: '90vw', maxHeight: '85vh' }
      case 'full':
        return { width: '90vw', height: '90vh', maxWidth: '1200px' }
      default:
        return { width: '400px', maxWidth: '90vw', maxHeight: '70vh' }
    }
  }

  const positionStyles = getPositionStyles()
  // Custom styles should override default styles
  const combinedStyles = { ...positionStyles, ...customStyles }

  return (
    <>
      {backdrop}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title || 'Panel'}
        className={`base-panel ${className}`}
        style={combinedStyles}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px 12px 0 0',
            }}
          >
            {title && <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close panel"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '20px',
                  lineHeight: '1',
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
