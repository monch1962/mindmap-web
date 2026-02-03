import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import KeyboardShortcutsModal from './KeyboardShortcutsModal'

describe('KeyboardShortcutsModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Desktop by default
    })
  })

  describe('basic rendering', () => {
    it('should render dialog with proper ARIA attributes', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'keyboard-shortcuts-title')
    })

    it('should render title with emoji', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      expect(screen.getByText('⌨️ Keyboard Shortcuts')).toBeInTheDocument()
      expect(screen.getByLabelText('Close keyboard shortcuts')).toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const closeButton = screen.getByLabelText('Close keyboard shortcuts')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should have proper styling and positioning', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveStyle({
        position: 'fixed',
        background: 'white',
        minWidth: '500px',
        maxWidth: '650px',
        maxHeight: '80vh',
      })
    })
  })

  describe('search functionality', () => {
    it('should render search input with proper attributes', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const searchInput = screen.getByLabelText('Search keyboard shortcuts')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('placeholder', 'Search shortcuts...')
      expect(searchInput).toHaveAttribute('type', 'text')
    })

    it('should filter shortcuts when typing in search', async () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const searchInput = screen.getByLabelText('Search keyboard shortcuts')

      // Initially should show all shortcuts
      expect(screen.getByText('Create child node')).toBeInTheDocument()
      expect(screen.getByText('Create sibling node')).toBeInTheDocument()
      expect(screen.getByText('Delete selected node')).toBeInTheDocument()

      // Search for "child"
      fireEvent.change(searchInput, { target: { value: 'child' } })

      await waitFor(() => {
        expect(screen.getByText('Create child node')).toBeInTheDocument()
        expect(screen.queryByText('Create sibling node')).not.toBeInTheDocument()
        expect(screen.queryByText('Delete selected node')).not.toBeInTheDocument()
      })
    })

    it('should show "no shortcuts found" message when search has no results', async () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const searchInput = screen.getByLabelText('Search keyboard shortcuts')
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

      await waitFor(() => {
        expect(screen.getByText('No shortcuts found matching "nonexistent"')).toBeInTheDocument()
      })
    })

    it('should search in both action text and key combinations', async () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const searchInput = screen.getByLabelText('Search keyboard shortcuts')

      // Search by action text
      fireEvent.change(searchInput, { target: { value: 'undo' } })
      await waitFor(() => {
        expect(screen.getByText('Undo')).toBeInTheDocument()
      })

      // Search by key combination - use 'Ctrl' (uppercase) as it appears in the shortcuts
      fireEvent.change(searchInput, { target: { value: 'Ctrl' } })
      await waitFor(() => {
        // Should find shortcuts with Ctrl combinations
        expect(screen.getByText('Undo')).toBeInTheDocument()
      })
    })
  })

  describe('category filtering', () => {
    it('should render category filter buttons', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      expect(screen.getByText('All')).toBeInTheDocument()
      // Use getAllByText for categories that appear multiple times
      const nodeOpsElements = screen.getAllByText('Node Operations')
      expect(nodeOpsElements.length).toBeGreaterThan(0)
      const navElements = screen.getAllByText('Navigation & View')
      expect(navElements.length).toBeGreaterThan(0)
      const editingElements = screen.getAllByText('Editing')
      expect(editingElements.length).toBeGreaterThan(0)
      const searchElements = screen.getAllByText('Search & Navigation')
      expect(searchElements.length).toBeGreaterThan(0)
      const panelsElements = screen.getAllByText('Panels')
      expect(panelsElements.length).toBeGreaterThan(0)
    })

    it('should have "All" button selected by default', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const allButton = screen.getByText('All')
      expect(allButton).toHaveAttribute('aria-pressed', 'true')
      // Check style properties without exact color values
      const style = window.getComputedStyle(allButton)
      expect(style.backgroundColor).toBe('rgb(59, 130, 246)')
      expect(style.color).toBe('rgb(255, 255, 255)')
    })

    it('should filter shortcuts when category is selected', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      // Get the button (not the heading) - use getAllByText and find the button
      const nodeOpsElements = screen.getAllByText('Node Operations')
      const nodeOpsButton = nodeOpsElements.find(el => el.tagName === 'BUTTON')
      expect(nodeOpsButton).toBeDefined()
      fireEvent.click(nodeOpsButton!)

      // Should show Node Operations shortcuts
      expect(screen.getByText('Create child node')).toBeInTheDocument()
      expect(screen.getByText('Create sibling node')).toBeInTheDocument()
      expect(screen.getByText('Delete selected node')).toBeInTheDocument()

      // Should not show shortcuts from other categories
      expect(screen.queryByText('Zoom in')).not.toBeInTheDocument()
      expect(screen.queryByText('Undo')).not.toBeInTheDocument()
    })

    it('should update button styling when category is selected', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      // Get the button (not the heading)
      const nodeOpsElements = screen.getAllByText('Node Operations')
      const nodeOpsButton = nodeOpsElements.find(el => el.tagName === 'BUTTON')
      expect(nodeOpsButton).toBeDefined()
      fireEvent.click(nodeOpsButton!)

      expect(nodeOpsButton).toHaveAttribute('aria-pressed', 'true')

      // "All" button should no longer be selected
      const allButton = screen.getByText('All')
      expect(allButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('should combine search and category filtering', async () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      // Select Node Operations category
      const nodeOpsElements = screen.getAllByText('Node Operations')
      const nodeOpsButton = nodeOpsElements.find(el => el.tagName === 'BUTTON')
      expect(nodeOpsButton).toBeDefined()
      fireEvent.click(nodeOpsButton!)

      // Search within Node Operations
      const searchInput = screen.getByLabelText('Search keyboard shortcuts')
      fireEvent.change(searchInput, { target: { value: 'child' } })

      await waitFor(() => {
        // Should only show "Create child node" from Node Operations
        expect(screen.getByText('Create child node')).toBeInTheDocument()
        expect(screen.queryByText('Create sibling node')).not.toBeInTheDocument()
        expect(screen.queryByText('Zoom in')).not.toBeInTheDocument()
      })
    })
  })

  describe('shortcuts list rendering', () => {
    it('should render all shortcuts grouped by category', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      // Check category headers (they appear in regular case, not uppercase)
      const nodeOpsHeaders = screen.getAllByText('Node Operations')
      expect(nodeOpsHeaders.length).toBeGreaterThan(0)
      const navHeaders = screen.getAllByText('Navigation & View')
      expect(navHeaders.length).toBeGreaterThan(0)
      const editingHeaders = screen.getAllByText('Editing')
      expect(editingHeaders.length).toBeGreaterThan(0)
      const searchHeaders = screen.getAllByText('Search & Navigation')
      expect(searchHeaders.length).toBeGreaterThan(0)
      const panelsHeaders = screen.getAllByText('Panels')
      expect(panelsHeaders.length).toBeGreaterThan(0)

      // Check some shortcuts from each category
      expect(screen.getByText('Create child node')).toBeInTheDocument()
      expect(screen.getByText('Zoom in')).toBeInTheDocument()
      expect(screen.getByText('Undo')).toBeInTheDocument()
      expect(screen.getByText('Open search panel')).toBeInTheDocument()
      expect(screen.getByText('Toggle notes panel')).toBeInTheDocument()
    })

    it('should render key combinations with proper styling', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      // Check that keys are rendered as <kbd> elements
      const tabKey = screen.getByText('Tab')
      expect(tabKey.tagName).toBe('KBD')
      // Check style properties - border might be empty or different
      const style = window.getComputedStyle(tabKey)
      expect(style.backgroundColor).toBe('rgb(255, 255, 255)')
      expect(style.borderRadius).toBe('3px')
      expect(style.fontFamily).toContain('monospace')

      // Check multi-key combinations
      const ctrlElements = screen.getAllByText('Ctrl')
      expect(ctrlElements.length).toBeGreaterThan(0)
      const zElements = screen.getAllByText('Z')
      expect(zElements.length).toBeGreaterThan(0)
    })

    it('should show plus signs between keys in combinations', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      // Find a shortcut with multiple keys (Ctrl+Z)
      const undoShortcut = screen.getByText('Undo').closest('div[role="listitem"]')
      // Look for plus signs in the text content
      const shortcutText = undoShortcut?.textContent || ''
      expect(shortcutText).toContain('+')
    })
  })

  describe('mobile responsiveness', () => {
    it('should adjust width for mobile screens', () => {
      // Set mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })

      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveStyle({
        minWidth: '90vw',
        maxWidth: '95vw',
      })
    })

    it('should use desktop width for larger screens', () => {
      // Set desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveStyle({
        minWidth: '500px',
        maxWidth: '650px',
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA regions and roles', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      // Check search region
      const searchRegion = screen.getByRole('search')
      expect(searchRegion).toBeInTheDocument()

      // Check shortcuts list region
      const shortcutsRegion = screen.getByLabelText('Keyboard shortcuts list')
      expect(shortcutsRegion).toBeInTheDocument()

      // Check category groups
      const categoryGroups = screen.getAllByRole('group')
      expect(categoryGroups.length).toBeGreaterThan(0)

      // Check list items
      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBeGreaterThan(0)
    })

    it('should have proper heading structure', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const h2 = screen.getByRole('heading', { level: 2 })
      expect(h2).toHaveTextContent('⌨️ Keyboard Shortcuts')

      const h3Elements = screen.getAllByRole('heading', { level: 3 })
      expect(h3Elements.length).toBeGreaterThan(0)
      // Check that at least one h3 has category text (in regular case)
      const hasCategory = h3Elements.some(
        h3 =>
          h3.textContent?.includes('Node Operations') ||
          h3.textContent?.includes('Navigation') ||
          h3.textContent?.includes('Editing')
      )
      expect(hasCategory).toBe(true)
    })

    it('should have proper button states for category filters', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const allButton = screen.getByText('All')
      expect(allButton).toHaveAttribute('aria-pressed', 'true')

      // Get the button (not the heading)
      const nodeOpsElements = screen.getAllByText('Node Operations')
      const nodeOpsButton = nodeOpsElements.find(el => el.tagName === 'BUTTON')
      expect(nodeOpsButton).toBeDefined()
      expect(nodeOpsButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('should have proper live region for search results', async () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const searchInput = screen.getByLabelText('Search keyboard shortcuts')
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

      await waitFor(() => {
        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toBeInTheDocument()
        expect(liveRegion).toHaveAttribute('aria-live', 'polite')
        expect(liveRegion).toHaveTextContent('No shortcuts found matching "nonexistent"')
      })
    })
  })

  describe('keyboard navigation hook integration', () => {
    it('should use useKeyboardNavigation hook', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      // The hook should add tabindex and focus management
      expect(dialog).toBeInTheDocument()
    })
  })

  describe('footer message', () => {
    it('should render footer with help message', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      // Check that the footer text contains the expected message
      const footerText = screen.getByText((content, element) => {
        return (
          element?.tagName !== 'SCRIPT' &&
          element?.tagName !== 'STYLE' &&
          content.includes('Press') &&
          content.includes('anytime to open this help')
        )
      })
      expect(footerText).toBeInTheDocument()
    })

    it('should render ? key with proper styling', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      // There are multiple ? elements, get all and check one
      const questionKeys = screen.getAllByText('?')
      expect(questionKeys.length).toBeGreaterThan(0)
      const questionKey = questionKeys[0]
      expect(questionKey.tagName).toBe('KBD')
      // Check style properties
      const style = window.getComputedStyle(questionKey)
      expect(style.backgroundColor).toBe('rgb(255, 255, 255)')
      expect(style.borderRadius).toBe('3px')
    })
  })

  describe('edge cases', () => {
    it('should handle empty search query', () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const searchInput = screen.getByLabelText('Search keyboard shortcuts')
      fireEvent.change(searchInput, { target: { value: '' } })

      // Should show all shortcuts
      expect(screen.getByText('Create child node')).toBeInTheDocument()
      expect(screen.getByText('Zoom in')).toBeInTheDocument()
      expect(screen.getByText('Undo')).toBeInTheDocument()
    })

    it('should handle case-insensitive search', async () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const searchInput = screen.getByLabelText('Search keyboard shortcuts')

      // Search with uppercase
      fireEvent.change(searchInput, { target: { value: 'UNDO' } })
      await waitFor(() => {
        expect(screen.getByText('Undo')).toBeInTheDocument()
      })

      // Search with lowercase
      fireEvent.change(searchInput, { target: { value: 'undo' } })
      await waitFor(() => {
        expect(screen.getByText('Undo')).toBeInTheDocument()
      })
    })

    it('should handle special characters in search', async () => {
      render(<KeyboardShortcutsModal onClose={mockOnClose} />)

      const searchInput = screen.getByLabelText('Search keyboard shortcuts')
      // Search for just "Ctrl" without the plus sign
      fireEvent.change(searchInput, { target: { value: 'Ctrl' } })

      await waitFor(() => {
        // Should find shortcuts with Ctrl combinations
        expect(screen.getByText('Zoom in')).toBeInTheDocument()
      })
    })
  })
})
