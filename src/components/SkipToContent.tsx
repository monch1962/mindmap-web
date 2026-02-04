import { useRef } from 'react'

interface SkipToContentProps {
  /**
   * Array of target IDs to skip to
   * First target is the main content area
   * Additional targets are other important landmarks
   */
  targets?: Array<{
    id: string
    label: string
    description?: string
  }>
}

/**
 * SkipToContent component provides keyboard-accessible skip links
 * for users to bypass navigation and jump directly to main content.
 *
 * WCAG 2.1 Success Criterion: 2.4.1 Bypass Blocks
 *
 * Usage:
 * ```tsx
 * <SkipToContent
 *   targets={[
 *     { id: 'main-content', label: 'Skip to main content' },
 *     { id: 'search', label: 'Skip to search' }
 *   ]}
 * />
 * ```
 */
export default function SkipToContent({
  targets = [
    { id: 'main-content', label: 'Skip to main content' },
    { id: 'search-panel', label: 'Skip to search' },
    { id: 'mindmap-canvas', label: 'Skip to mind map canvas' },
  ],
}: SkipToContentProps) {
  const linksRef = useRef<Array<HTMLAnchorElement | null>>([])

  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()

    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      // Add focus ring for visual indication
      targetElement.style.outline = '2px solid #3b82f6'
      targetElement.style.outlineOffset = '2px'

      // Remove focus ring after animation
      setTimeout(() => {
        targetElement.style.outline = ''
        targetElement.style.outlineOffset = ''
      }, 2000)

      // Focus the target element
      targetElement.focus()

      // Scroll to the element with smooth behavior
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })

      // Announce to screen readers
      const announcement = document.createElement('div')
      announcement.setAttribute('role', 'status')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.style.position = 'absolute'
      announcement.style.left = '-9999px'
      announcement.textContent = `Jumped to ${targets.find(t => t.id === targetId)?.label.toLowerCase()}`
      document.body.appendChild(announcement)

      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    } else {
      // Fallback: focus the first focusable element in the main content
      const mainContent = document.querySelector('main, [role="main"]')
      if (mainContent) {
        const focusable = mainContent.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable) {
          focusable.focus()
        }
      }
    }
  }

  return (
    <nav
      aria-label="Skip navigation"
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <ul
        style={{
          listStyle: 'none',
          margin: '0',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {targets.map((target, index) => (
          <li key={target.id} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <a
              ref={el => {
                linksRef.current[index] = el
              }}
              href={`#${target.id}`}
              onClick={e => handleSkip(e, target.id)}
              style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%) translateY(-100%)',
                backgroundColor: '#1f2937',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '0 0 8px 8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                opacity: '0',
                transition: 'all 0.3s ease',
                pointerEvents: 'auto',
                zIndex: 1001,
                outline: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#374151'
                e.currentTarget.style.transform = 'translateX(-50%) translateY(0) scale(1.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#1f2937'
                e.currentTarget.style.transform = 'translateX(-50%) translateY(-100%)'
              }}
              onFocus={e => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateX(-50%) translateY(0)'
                e.currentTarget.style.backgroundColor = '#3b82f6'
              }}
              onBlur={e => {
                e.currentTarget.style.opacity = '0'
                e.currentTarget.style.transform = 'translateX(-50%) translateY(-100%)'
                e.currentTarget.style.backgroundColor = '#1f2937'
              }}
            >
              {target.label}
              {target.description && (
                <span
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 'normal',
                    opacity: '0.8',
                    marginTop: '2px',
                  }}
                >
                  {target.description}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
