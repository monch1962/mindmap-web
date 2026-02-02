import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SaveHistoryPanel from './SaveHistoryPanel'
import type { SaveSlot } from '../hooks/useAutoSave'

// Mock data for testing
const mockSaveHistory: SaveSlot[] = [
  {
    timestamp: Date.now() - 3600000, // 1 hour ago
    label: 'Today at 10:30 AM',
    nodes: [{ id: 'node-1', data: { label: 'Test Node 1' }, position: { x: 0, y: 0 } }],
    edges: [],
    tree: null,
  },
  {
    timestamp: Date.now() - 7200000, // 2 hours ago
    label: 'Today at 9:30 AM',
    nodes: [
      { id: 'node-1', data: { label: 'Test Node 1' }, position: { x: 0, y: 0 } },
      { id: 'node-2', data: { label: 'Test Node 2' }, position: { x: 100, y: 0 } },
    ],
    edges: [{ id: 'edge-1', source: 'node-1', target: 'node-2' }],
    tree: null,
  },
  {
    timestamp: Date.now() - 86400000, // 1 day ago
    label: 'Yesterday at 10:30 AM',
    nodes: [
      { id: 'node-1', data: { label: 'Test Node 1' }, position: { x: 0, y: 0 } },
      { id: 'node-2', data: { label: 'Test Node 2' }, position: { x: 100, y: 0 } },
      { id: 'node-3', data: { label: 'Test Node 3' }, position: { x: 200, y: 0 } },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2' },
      { id: 'edge-2', source: 'node-2', target: 'node-3' },
    ],
    tree: null,
  },
]

describe('SaveHistoryPanel', () => {
  const mockOnRestore = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render the panel with title when save history is provided', () => {
      render(
        <SaveHistoryPanel
          saveHistory={mockSaveHistory}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Save History')).toBeInTheDocument()
      expect(screen.getByLabelText('Close save history panel')).toBeInTheDocument()
    })

    it('should have proper ARIA attributes', () => {
      render(
        <SaveHistoryPanel
          saveHistory={mockSaveHistory}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'save-history-title')
      expect(dialog).toHaveAttribute('aria-label', 'Save history')
    })

    it('should render save slots list with correct items', () => {
      render(
        <SaveHistoryPanel
          saveHistory={mockSaveHistory}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByLabelText('Auto-save slots')).toBeInTheDocument()

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)

      // Check first item
      expect(listItems[0]).toHaveAttribute('aria-label', 'Today at 10:30 AM, 1 nodes')
      expect(screen.getByText('Today at 10:30 AM')).toBeInTheDocument()
      expect(screen.getByText('1 nodes')).toBeInTheDocument()

      // Check second item
      expect(listItems[1]).toHaveAttribute('aria-label', 'Today at 9:30 AM, 2 nodes')
      expect(screen.getByText('Today at 9:30 AM')).toBeInTheDocument()
      expect(screen.getByText('2 nodes')).toBeInTheDocument()
    })

    it('should render empty state when save history is empty', () => {
      render(
        <SaveHistoryPanel
          saveHistory={[]}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      const statusElements = screen.getAllByRole('status')
      expect(statusElements).toHaveLength(2) // Empty state status + footer status

      const emptyStateStatus = statusElements.find(el =>
        el.textContent?.includes('No save history yet')
      )
      expect(emptyStateStatus).toBeInTheDocument()
      expect(emptyStateStatus).toHaveAttribute('aria-live', 'polite')
      expect(
        screen.getByText('No save history yet. Auto-saves will appear here.')
      ).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <SaveHistoryPanel
          saveHistory={mockSaveHistory}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      const closeButton = screen.getByLabelText('Close save history panel')
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onRestore with correct index when restore button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <SaveHistoryPanel
          saveHistory={mockSaveHistory}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      const restoreButtons = screen.getAllByLabelText(/Restore/)
      expect(restoreButtons).toHaveLength(3)

      await user.click(restoreButtons[0])
      expect(mockOnRestore).toHaveBeenCalledWith(0)

      await user.click(restoreButtons[1])
      expect(mockOnRestore).toHaveBeenCalledWith(1)

      await user.click(restoreButtons[2])
      expect(mockOnRestore).toHaveBeenCalledWith(2)
    })

    it('should call onDelete with correct index when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <SaveHistoryPanel
          saveHistory={mockSaveHistory}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      const deleteButtons = screen.getAllByLabelText(/Delete/)
      expect(deleteButtons).toHaveLength(3)

      await user.click(deleteButtons[0])
      expect(mockOnDelete).toHaveBeenCalledWith(0)

      await user.click(deleteButtons[1])
      expect(mockOnDelete).toHaveBeenCalledWith(1)

      await user.click(deleteButtons[2])
      expect(mockOnDelete).toHaveBeenCalledWith(2)
    })

    it('should have proper button labels for each save slot', () => {
      render(
        <SaveHistoryPanel
          saveHistory={mockSaveHistory}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByLabelText('Restore Today at 10:30 AM')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete Today at 10:30 AM')).toBeInTheDocument()
      expect(screen.getByLabelText('Restore Today at 9:30 AM')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete Today at 9:30 AM')).toBeInTheDocument()
      expect(screen.getByLabelText('Restore Yesterday at 10:30 AM')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete Yesterday at 10:30 AM')).toBeInTheDocument()
    })
  })

  describe('status footer', () => {
    it('should show correct pluralization for single save', () => {
      render(
        <SaveHistoryPanel
          saveHistory={[mockSaveHistory[0]]}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Last 1 auto-save stored')).toBeInTheDocument()
    })

    it('should show correct pluralization for multiple saves', () => {
      render(
        <SaveHistoryPanel
          saveHistory={mockSaveHistory}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Last 3 auto-saves stored')).toBeInTheDocument()
    })

    it('should have proper ARIA live region for status', () => {
      render(
        <SaveHistoryPanel
          saveHistory={mockSaveHistory}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      const statusElements = screen.getAllByRole('status')
      expect(statusElements).toHaveLength(1) // Only footer status when there are save items

      // Check footer status
      const footerStatus = statusElements[0]
      expect(footerStatus).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('accessibility', () => {
    it('should be keyboard navigable', () => {
      render(
        <SaveHistoryPanel
          saveHistory={mockSaveHistory}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      const closeButton = screen.getByLabelText('Close save history panel')
      expect(closeButton).toBeInTheDocument()

      const restoreButtons = screen.getAllByLabelText(/Restore/)
      expect(restoreButtons).toHaveLength(3)

      const deleteButtons = screen.getAllByLabelText(/Delete/)
      expect(deleteButtons).toHaveLength(3)
    })

    it('should have proper focus management', () => {
      render(
        <SaveHistoryPanel
          saveHistory={mockSaveHistory}
          onRestore={mockOnRestore}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })
  })
})
