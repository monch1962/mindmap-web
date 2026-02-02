import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConflictResolutionModal from './ConflictResolutionModal'

// Mock data for testing
const mockSaveSlot = {
  label: '2 minutes ago',
  nodes: [
    { id: 'node-1', data: { label: 'Node 1' }, position: { x: 100, y: 100 } },
    { id: 'node-2', data: { label: 'Node 2' }, position: { x: 200, y: 200 } },
    { id: 'node-3', data: { label: 'Node 3' }, position: { x: 300, y: 300 } },
  ],
  edges: [],
  tree: null,
  timestamp: Date.now() - 120000, // 2 minutes ago
}

describe('ConflictResolutionModal', () => {
  const mockOnRestore = vi.fn()
  const mockOnDismiss = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when saveSlot is null', () => {
    it('should not render anything when saveSlot is null', () => {
      const { container } = render(
        <ConflictResolutionModal
          saveSlot={null}
          onRestore={mockOnRestore}
          onDismiss={mockOnDismiss}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('when saveSlot is provided', () => {
    it('should render the modal with title and description', () => {
      render(
        <ConflictResolutionModal
          saveSlot={mockSaveSlot}
          onRestore={mockOnRestore}
          onDismiss={mockOnDismiss}
        />
      )

      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      expect(screen.getByText('Recover Auto-Saved Version?')).toBeInTheDocument()
      expect(
        screen.getByText(/We found an auto-saved version of your mind map from/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Would you like to restore it, or start with a blank canvas?/)
      ).toBeInTheDocument()
    })

    it('should display save slot information', () => {
      render(
        <ConflictResolutionModal
          saveSlot={mockSaveSlot}
          onRestore={mockOnRestore}
          onDismiss={mockOnDismiss}
        />
      )

      expect(screen.getByText('2 minutes ago')).toBeInTheDocument()
      // The text is split: <strong>Auto-saved version:</strong> 3 nodes
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === 'Auto-saved version: 3 nodes'
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Restoring will replace your current blank canvas.')
      ).toBeInTheDocument()
    })

    it('should have proper ARIA attributes', () => {
      render(
        <ConflictResolutionModal
          saveSlot={mockSaveSlot}
          onRestore={mockOnRestore}
          onDismiss={mockOnDismiss}
        />
      )

      const dialog = screen.getByRole('alertdialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'conflict-title')
      expect(dialog).toHaveAttribute('aria-describedby', 'conflict-description')

      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Auto-save details')
    })

    it('should call onDismiss when "Start Fresh" button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ConflictResolutionModal
          saveSlot={mockSaveSlot}
          onRestore={mockOnRestore}
          onDismiss={mockOnDismiss}
        />
      )

      const startFreshButton = screen.getByRole('button', { name: /start with a blank canvas/i })
      await user.click(startFreshButton)

      expect(mockOnDismiss).toHaveBeenCalledTimes(1)
      expect(mockOnRestore).not.toHaveBeenCalled()
    })

    it('should call onRestore when "Restore Auto-Save" button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ConflictResolutionModal
          saveSlot={mockSaveSlot}
          onRestore={mockOnRestore}
          onDismiss={mockOnDismiss}
        />
      )

      const restoreButton = screen.getByRole('button', { name: /restore auto-save/i })
      await user.click(restoreButton)

      expect(mockOnRestore).toHaveBeenCalledTimes(1)
      expect(mockOnDismiss).not.toHaveBeenCalled()
    })

    it('should have proper labels for interactive elements', () => {
      render(
        <ConflictResolutionModal
          saveSlot={mockSaveSlot}
          onRestore={mockOnRestore}
          onDismiss={mockOnDismiss}
        />
      )

      expect(screen.getByLabelText('Start with a blank canvas')).toBeInTheDocument()
      expect(screen.getByLabelText('Restore auto-saved version')).toBeInTheDocument()
    })

    it('should have proper styling for buttons', () => {
      render(
        <ConflictResolutionModal
          saveSlot={mockSaveSlot}
          onRestore={mockOnRestore}
          onDismiss={mockOnDismiss}
        />
      )

      const startFreshButton = screen.getByRole('button', { name: /Start with a blank canvas/i })
      const restoreButton = screen.getByRole('button', { name: /Restore auto-saved version/i })

      expect(startFreshButton).toHaveStyle({ background: '#f3f4f6', color: '#374151' })
      expect(restoreButton).toHaveStyle({ background: '#3b82f6', color: 'rgb(255, 255, 255)' })
    })

    it('should handle edge case with empty nodes array', () => {
      const emptySaveSlot = {
        ...mockSaveSlot,
        nodes: [],
        edges: [],
        label: 'Just now',
      }

      render(
        <ConflictResolutionModal
          saveSlot={emptySaveSlot}
          onRestore={mockOnRestore}
          onDismiss={mockOnDismiss}
        />
      )

      expect(screen.getByText('Just now')).toBeInTheDocument()
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === 'Auto-saved version: 0 nodes'
        })
      ).toBeInTheDocument()
    })

    it('should handle different save slot labels', () => {
      const customSaveSlot = {
        ...mockSaveSlot,
        label: 'Yesterday at 3:45 PM',
      }

      render(
        <ConflictResolutionModal
          saveSlot={customSaveSlot}
          onRestore={mockOnRestore}
          onDismiss={mockOnDismiss}
        />
      )

      expect(screen.getByText('Yesterday at 3:45 PM')).toBeInTheDocument()
    })
  })
})
