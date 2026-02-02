import type { MindMapTree } from '../types'

/**
 * Common props for components that have visibility control
 */
export interface VisibilityProps {
  /** Whether the component is visible */
  visible: boolean
  /** Callback to close/hide the component */
  onClose: () => void
}

/**
 * Props for components that work with a mind map tree
 */
export interface WithTreeProps {
  /** The mind map tree data */
  tree: MindMapTree | null
}

/**
 * Base props for panel components
 */
export interface PanelProps extends VisibilityProps {
  /** Optional title for the panel */
  title?: string
  /** Optional CSS class name */
  className?: string
  /** Optional aria-label for accessibility */
  ariaLabel?: string
}

/**
 * Status message type for user feedback
 */
export interface StatusMessage {
  type: 'success' | 'error' | 'warning' | 'info'
  text: string
}

/**
 * Position options for panels and modals
 */
export type PanelPosition =
  | 'right'
  | 'left'
  | 'center'
  | 'top'
  | 'bottom'
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'

/**
 * Size options for panels and modals
 */
export type PanelSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/**
 * Common styling options
 */
export interface StyleOptions {
  /** Width of the component */
  width?: string
  /** Height of the component */
  height?: string
  /** Maximum width */
  maxWidth?: string
  /** Maximum height */
  maxHeight?: string
  /** Z-index for layering */
  zIndex?: number
}
