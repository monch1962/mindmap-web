import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SkipToContent from './SkipToContent'

// Test helper function (only used in tests)
function testSkipToContentAccessibility() {
  const skipLinks = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
  const results = {
    hasSkipLinks: skipLinks.length > 0,
    skipLinksCount: skipLinks.length,
    firstLinkVisibleOnFocus: false,
    allLinksProgrammaticallyFocusable: true,
    targetsExist: true,
  }

  if (skipLinks.length > 0) {
    // Test first link visibility on focus
    const firstLink = skipLinks[0]
    firstLink.focus()
    results.firstLinkVisibleOnFocus =
      window.getComputedStyle(firstLink).opacity !== '0' &&
      window.getComputedStyle(firstLink).visibility !== 'hidden'

    // Test all links are focusable
    skipLinks.forEach(link => {
      const tabIndex = link.getAttribute('tabindex')
      if (tabIndex === '-1' || link.style.display === 'none') {
        results.allLinksProgrammaticallyFocusable = false
      }
    })

    // Test targets exist
    skipLinks.forEach(link => {
      const href = link.getAttribute('href')
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1)
        const target = document.getElementById(targetId)
        if (!target) {
          results.targetsExist = false
        }
      }
    })
  }

  return results
}

describe('SkipToContent', () => {
  beforeEach(() => {
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders skip links with default targets', () => {
    render(<SkipToContent />)

    // Check that default skip links are rendered
    expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    expect(screen.getByText('Skip to search')).toBeInTheDocument()
    expect(screen.getByText('Skip to mind map canvas')).toBeInTheDocument()

    // Check that links have correct href attributes
    const mainContentLink = screen.getByText('Skip to main content')
    expect(mainContentLink).toHaveAttribute('href', '#main-content')

    const searchLink = screen.getByText('Skip to search')
    expect(searchLink).toHaveAttribute('href', '#search-panel')

    const canvasLink = screen.getByText('Skip to mind map canvas')
    expect(canvasLink).toHaveAttribute('href', '#mindmap-canvas')
  })

  it('renders custom targets when provided', () => {
    const customTargets = [
      { id: 'custom-main', label: 'Skip to custom main' },
      { id: 'custom-sidebar', label: 'Skip to sidebar' },
    ]

    render(<SkipToContent targets={customTargets} />)

    expect(screen.getByText('Skip to custom main')).toBeInTheDocument()
    expect(screen.getByText('Skip to sidebar')).toBeInTheDocument()
    expect(screen.queryByText('Skip to main content')).not.toBeInTheDocument()
  })

  it('renders descriptions when provided', () => {
    const targetsWithDescriptions = [
      {
        id: 'main-content',
        label: 'Skip to main content',
        description: 'Jump to primary content area',
      },
    ]

    render(<SkipToContent targets={targetsWithDescriptions} />)

    expect(screen.getByText('Jump to primary content area')).toBeInTheDocument()
  })

  it('shows skip links on focus', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByText('Skip to main content')

    // Initially hidden (opacity: 0)
    expect(skipLink).toHaveStyle({ opacity: '0' })

    // Focus the link
    fireEvent.focus(skipLink)

    // Should become visible
    expect(skipLink).toHaveStyle({ opacity: '1' })
  })

  it('hides skip links on blur after delay', () => {
    vi.useFakeTimers()

    render(<SkipToContent />)

    const skipLink = screen.getByText('Skip to main content')

    // Focus to show
    fireEvent.focus(skipLink)
    expect(skipLink).toHaveStyle({ opacity: '1' })

    // Blur to hide
    fireEvent.blur(skipLink)

    // Advance timers by the hide delay (300ms)
    vi.advanceTimersByTime(300)

    expect(skipLink).toHaveStyle({ opacity: '0' })

    vi.useRealTimers()
  })

  it('handles skip navigation when target exists', () => {
    // Create a mock target element
    const mockElement = document.createElement('div')
    mockElement.id = 'main-content'
    mockElement.textContent = 'Main Content'
    const focusSpy = vi.spyOn(mockElement, 'focus')
    document.body.appendChild(mockElement)

    render(<SkipToContent />)

    const skipLink = screen.getByText('Skip to main content')

    // Click the skip link
    fireEvent.click(skipLink)

    // Should focus the target element
    expect(focusSpy).toHaveBeenCalled()

    // Should scroll to the element
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })

    // Clean up
    focusSpy.mockRestore()
    document.body.removeChild(mockElement)
  })

  it('handles skip navigation when target does not exist', () => {
    // Mock querySelector for fallback
    const mockFocusable = document.createElement('button')
    mockFocusable.textContent = 'Focusable Button'
    const mockMainElement = document.createElement('main')
    mockMainElement.appendChild(mockFocusable)

    const querySelectorMock = vi.spyOn(document, 'querySelector')
    querySelectorMock.mockReturnValueOnce(mockMainElement)

    render(<SkipToContent />)

    const skipLink = screen.getByText('Skip to main content')

    // Click the skip link (target doesn't exist)
    fireEvent.click(skipLink)

    // Should try to find fallback focusable element
    expect(querySelectorMock).toHaveBeenCalledWith('main, [role="main"]')

    // Clean up
    querySelectorMock.mockRestore()
  })

  it('adds visual focus indicator when skipping', () => {
    // Create a mock target element
    const mockElement = document.createElement('div')
    mockElement.id = 'main-content'
    document.body.appendChild(mockElement)

    render(<SkipToContent />)

    const skipLink = screen.getByText('Skip to main content')

    // Click the skip link
    fireEvent.click(skipLink)

    // Should add focus indicator styles
    expect(mockElement.style.outline).toBe('2px solid #3b82f6')
    expect(mockElement.style.outlineOffset).toBe('2px')

    // Clean up
    document.body.removeChild(mockElement)
  })

  it('creates screen reader announcement when skipping', () => {
    // Create a mock target element
    const mockElement = document.createElement('div')
    mockElement.id = 'main-content'
    document.body.appendChild(mockElement)

    render(<SkipToContent />)

    const skipLink = screen.getByText('Skip to main content')

    // Click the skip link
    fireEvent.click(skipLink)

    // Should create announcement element
    const announcements = document.querySelectorAll('[role="status"]')
    expect(announcements.length).toBeGreaterThan(0)

    // Clean up
    document.body.removeChild(mockElement)
    announcements.forEach(announcement => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement)
      }
    })
  })

  it('has proper ARIA attributes', () => {
    render(<SkipToContent />)

    const nav = screen.getByRole('navigation', { name: 'Skip navigation' })
    expect(nav).toBeInTheDocument()

    const links = screen.getAllByRole('link')
    expect(links.length).toBe(3) // Default 3 links

    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('is keyboard accessible', () => {
    render(<SkipToContent />)

    const links = screen.getAllByRole('link')

    links.forEach(link => {
      // Should be focusable
      expect(link).not.toHaveAttribute('tabindex', '-1')
    })
  })

  describe('testSkipToContentAccessibility', () => {
    it('returns correct results when skip links exist', () => {
      // Create test skip links
      const link1 = document.createElement('a')
      link1.href = '#main-content'
      link1.textContent = 'Skip to main content'
      document.body.appendChild(link1)

      const link2 = document.createElement('a')
      link2.href = '#search'
      link2.textContent = 'Skip to search'
      document.body.appendChild(link2)

      // Create target elements
      const target1 = document.createElement('div')
      target1.id = 'main-content'
      document.body.appendChild(target1)

      const target2 = document.createElement('div')
      target2.id = 'search'
      document.body.appendChild(target2)

      const results = testSkipToContentAccessibility()

      expect(results.hasSkipLinks).toBe(true)
      expect(results.skipLinksCount).toBe(2)
      expect(results.targetsExist).toBe(true)

      // Clean up
      document.body.removeChild(link1)
      document.body.removeChild(link2)
      document.body.removeChild(target1)
      document.body.removeChild(target2)
    })

    it('returns correct results when skip links do not exist', () => {
      // Remove any existing skip links
      document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.parentNode?.removeChild(link)
      })

      const results = testSkipToContentAccessibility()

      expect(results.hasSkipLinks).toBe(false)
      expect(results.skipLinksCount).toBe(0)
    })

    it('detects missing targets', () => {
      // Create skip link without target
      const link = document.createElement('a')
      link.href = '#missing-target'
      link.textContent = 'Skip to missing target'
      document.body.appendChild(link)

      const results = testSkipToContentAccessibility()

      expect(results.targetsExist).toBe(false)

      // Clean up
      document.body.removeChild(link)
    })

    it('detects non-focusable skip links', () => {
      // Create skip link with tabindex="-1"
      const link = document.createElement('a')
      link.href = '#main-content'
      link.textContent = 'Skip to main content'
      link.tabIndex = -1
      document.body.appendChild(link)

      // Create target
      const target = document.createElement('div')
      target.id = 'main-content'
      document.body.appendChild(target)

      const results = testSkipToContentAccessibility()

      expect(results.allLinksProgrammaticallyFocusable).toBe(false)

      // Clean up
      document.body.removeChild(link)
      document.body.removeChild(target)
    })
  })

  it('has proper visual styling', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByText('Skip to main content')

    // Check initial styles (using more flexible checks)
    expect(skipLink).toHaveStyle({
      position: 'absolute',
      top: '0',
    })

    // Check background color (can be hex or rgb)
    const bgColor = window.getComputedStyle(skipLink).backgroundColor
    expect(['rgb(31, 41, 55)', '#1f2937']).toContain(bgColor)

    // Check text color (can be named or rgb)
    const textColor = window.getComputedStyle(skipLink).color
    expect(['rgb(255, 255, 255)', 'white']).toContain(textColor)

    // Check border radius
    expect(skipLink).toHaveStyle({ borderRadius: '0 0 8px 8px' })

    // Check font weight
    const fontWeight = window.getComputedStyle(skipLink).fontWeight
    expect(['600', 'bold']).toContain(fontWeight)

    // Check hover styles are applied via onMouseEnter
    fireEvent.mouseEnter(skipLink)
    const hoverBgColor = window.getComputedStyle(skipLink).backgroundColor
    expect(['rgb(55, 65, 81)', '#374151']).toContain(hoverBgColor)

    // Check focus styles
    fireEvent.focus(skipLink)
    const focusBgColor = window.getComputedStyle(skipLink).backgroundColor
    expect(['rgb(59, 130, 246)', '#3b82f6']).toContain(focusBgColor)
  })

  it('follows WCAG 2.1 bypass blocks requirement', () => {
    render(<SkipToContent />)

    // Should have navigation landmark with proper label
    const nav = screen.getByRole('navigation', { name: 'Skip navigation' })
    expect(nav).toBeInTheDocument()

    // Should be at the beginning of the page
    expect(nav).toHaveStyle({ position: 'absolute', top: '0', left: '0', right: '0' })

    // Links should be visible on focus
    const skipLink = screen.getByText('Skip to main content')
    fireEvent.focus(skipLink)
    expect(skipLink).toHaveStyle({ opacity: '1' })
  })
})
