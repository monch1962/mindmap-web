/**
 * Accessibility utility functions
 *
 * Provides ARIA attribute generators and accessibility helpers
 * for consistent ARIA labels, roles, and properties across components.
 */

/**
 * Generate ARIA label for a button with fallback text
 */
export function getButtonLabel(label: string, fallback?: string): string {
  return label || fallback || 'Button'
}

/**
 * Generate ARIA label for a panel
 */
export function getPanelLabel(title: string, type: string): string {
  return `${title} ${type}`
}

/**
 * Generate ARIA description for a form field
 */
export function getFieldDescription(label: string, helpText?: string): string {
  if (helpText) {
    return `${label}. ${helpText}`
  }
  return label
}

/**
 * Generate ARIA label for a toggle button
 */
export function getToggleLabel(label: string, isToggled: boolean): string {
  return `${label} ${isToggled ? 'expanded' : 'collapsed'}`
}

/**
 * Generate ARIA label for a menu item
 */
export function getMenuItemLabel(label: string, shortcut?: string): string {
  if (shortcut) {
    return `${label} (${shortcut})`
  }
  return label
}

/**
 * Generate ARIA label for a search input
 */
export function getSearchLabel(count?: number): string {
  if (count !== undefined) {
    return `Search mind map (${count} nodes)`
  }
  return 'Search mind map'
}

/**
 * Generate ARIA label for a list item
 */
export function getListItemLabel(label: string, index: number, total: number): string {
  return `${label}, item ${index + 1} of ${total}`
}

/**
 * Generate ARIA live region message
 */
export function getLiveMessage(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): {
  message: string
  'aria-live': string
} {
  return {
    message,
    'aria-live': politeness,
  }
}

/**
 * Generate ARIA attributes for a modal
 */
export function getModalAttributes(title: string, describedBy?: string) {
  const attrs: Record<string, string> = {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': title,
  }

  if (describedBy) {
    attrs['aria-describedby'] = describedBy
  }

  return attrs
}

/**
 * Generate ARIA attributes for a collapsible panel
 */
export function getCollapsibleAttributes(id: string, isExpanded: boolean) {
  return {
    'aria-expanded': isExpanded.toString(),
    'aria-controls': id,
  }
}

/**
 * Generate ARIA attributes for a tab
 */
export function getTabAttributes(panelId: string, selected: boolean) {
  return {
    role: 'tab',
    'aria-selected': selected.toString(),
    'aria-controls': panelId,
  }
}

/**
 * Generate ARIA attributes for a tab panel
 */
export function getTabPanelAttributes(tabId: string) {
  return {
    role: 'tabpanel',
    'aria-labelledby': tabId,
  }
}

/**
 * Generate ARIA attributes for a listbox
 */
export function getListboxAttributes(label: string) {
  return {
    role: 'listbox',
    'aria-label': label,
  }
}

/**
 * Generate ARIA attributes for a listbox option
 */
export function getOptionAttributes(value: string, selected: boolean) {
  return {
    role: 'option',
    'aria-selected': selected.toString(),
    'data-value': value,
  }
}

/**
 * Generate ARIA attributes for a tooltip
 */
export function getTooltipAttributes(id: string) {
  return {
    role: 'tooltip',
    id: id,
  }
}

/**
 * Generate ARIA attributes for a progress bar
 */
export function getProgressAttributes(value: number, max: number = 100, label?: string) {
  const attrs: Record<string, string> = {
    role: 'progressbar',
    'aria-valuenow': value.toString(),
    'aria-valuemin': '0',
    'aria-valuemax': max.toString(),
  }

  if (label) {
    attrs['aria-label'] = label
  }

  return attrs
}

/**
 * Generate ARIA attributes for a slider
 */
export function getSliderAttributes(value: number, min: number, max: number, label?: string) {
  const attrs: Record<string, string> = {
    role: 'slider',
    'aria-valuenow': value.toString(),
    'aria-valuemin': min.toString(),
    'aria-valuemax': max.toString(),
  }

  if (label) {
    attrs['aria-label'] = label
  }

  return attrs
}

/**
 * Generate ARIA attributes for a combobox
 */
export function getComboboxAttributes(label: string, expanded: boolean) {
  return {
    role: 'combobox',
    'aria-label': label,
    'aria-expanded': expanded.toString(),
    'aria-haspopup': 'listbox',
  }
}

/**
 * Check if an element should be focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  return (
    element.tagName === 'BUTTON' ||
    element.tagName === 'INPUT' ||
    element.tagName === 'SELECT' ||
    element.tagName === 'TEXTAREA' ||
    element.getAttribute('tabIndex') !== null ||
    element.getAttribute('contenteditable') === 'true'
  )
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
  )
  return Array.from(focusableElements).filter(isFocusable)
}

/**
 * Trap focus within a container (for modals)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container)
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }
  }

  container.addEventListener('keydown', handleTabKey)

  // Focus first element
  firstElement?.focus()

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', politeness)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.style.position = 'absolute'
  announcement.style.left = '-10000px'
  announcement.style.width = '1px'
  announcement.style.height = '1px'
  announcement.style.overflow = 'hidden'

  document.body.appendChild(announcement)
  announcement.textContent = message

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Generate unique ID for ARIA attributes
 */
export function generateAriaId(prefix: string): string {
  return `aria-${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get ARIA label from node content
 */
export function getNodeLabel(content: string, nodeCount?: number, depth?: number): string {
  let label = content

  if (nodeCount !== undefined) {
    label += ` (${nodeCount} nodes)`
  }

  if (depth !== undefined) {
    label += ` at depth ${depth}`
  }

  return label
}

/**
 * Generate ARIA attributes for a mind map node
 */
export function getNodeAttributes(
  id: string,
  label: string,
  isParent: boolean,
  collapsed?: boolean
) {
  const attrs: Record<string, string> = {
    role: 'treeitem',
    'aria-label': label,
    'aria-level': '1',
  }

  if (isParent) {
    attrs['aria-expanded'] = (collapsed !== true).toString()
  }

  return attrs
}

/**
 * Check if screen reader is active (heuristic)
 */
export function isScreenReaderActive(): boolean {
  // Check if reduced motion is preferred (often used with screen readers)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true
  }

  // Check for common screen reader signatures
  const userAgent = navigator.userAgent.toLowerCase()
  const screenReaders = ['jaws', 'nvda', 'voiceover', 'orca', 'zoomtext']

  return screenReaders.some(sr => userAgent.includes(sr))
}

/**
 * Get accessibility preferences
 */
export function getAccessibilityPrefs() {
  return {
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
    prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    screenReaderActive: isScreenReaderActive(),
  }
}
