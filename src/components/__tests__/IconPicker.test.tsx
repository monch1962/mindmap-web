import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import IconPicker from '../IconPicker'

describe('IconPicker', () => {
  const mockOnSelect = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when rendered', () => {
    it('should render the dialog with title', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Choose Icon')).toBeInTheDocument()
      expect(screen.getByLabelText('Search icons')).toBeInTheDocument()
    })

    it('should render all category tabs', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      expect(screen.getByText(/All \(\d+\)/)).toBeInTheDocument()
      expect(screen.getByText(/Status \(\d+\)/)).toBeInTheDocument()
      expect(screen.getByText(/Priority \(\d+\)/)).toBeInTheDocument()
      expect(screen.getByText(/Progress \(\d+\)/)).toBeInTheDocument()
      expect(screen.getByText(/Emotion \(\d+\)/)).toBeInTheDocument()
      expect(screen.getByText(/Time \(\d+\)/)).toBeInTheDocument()
      expect(screen.getByText(/Other \(\d+\)/)).toBeInTheDocument()
    })

    it('should render remove icon option', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      const removeIcon = screen.getByLabelText('Remove icon')
      expect(removeIcon).toBeInTheDocument()
      expect(removeIcon).toHaveTextContent('❌')
    })

    it('should render all icons initially', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      // Check for some representative icons
      expect(screen.getByLabelText('Yes (yes)')).toBeInTheDocument()
      expect(screen.getByLabelText('No (no)')).toBeInTheDocument()
      expect(screen.getByLabelText('Question (help)')).toBeInTheDocument()
      expect(screen.getByLabelText('Idea (idea)')).toBeInTheDocument()
    })
  })

  describe('when selecting an icon', () => {
    it('should call onSelect with icon ID when icon is clicked', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      const yesIcon = screen.getByLabelText('Yes (yes)')
      fireEvent.click(yesIcon)

      expect(mockOnSelect).toHaveBeenCalledWith('yes')
      expect(mockOnSelect).toHaveBeenCalledTimes(1)
    })

    it('should call onSelect with null when remove icon is clicked', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      const removeIcon = screen.getByLabelText('Remove icon')
      fireEvent.click(removeIcon)

      expect(mockOnSelect).toHaveBeenCalledWith(null)
      expect(mockOnSelect).toHaveBeenCalledTimes(1)
    })

    it('should highlight current icon when provided', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} currentIcon="yes" />)

      const yesIcon = screen.getByLabelText('Yes (yes)')
      expect(yesIcon).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('when searching for icons', () => {
    it('should filter icons by search term', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      const searchInput = screen.getByLabelText('Search icons by name or ID')
      fireEvent.change(searchInput, { target: { value: 'yes' } })

      expect(screen.getByLabelText('Yes (yes)')).toBeInTheDocument()
      expect(screen.queryByLabelText('No (no)')).not.toBeInTheDocument()
    })

    it('should show no results message when no icons match', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      const searchInput = screen.getByLabelText('Search icons by name or ID')
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

      expect(screen.getByText('No icons found matching "nonexistent"')).toBeInTheDocument()
    })

    it('should clear category selection when searching', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      const statusTab = screen.getByText(/Status \(\d+\)/)
      fireEvent.click(statusTab)

      const searchInput = screen.getByLabelText('Search icons by name or ID')
      fireEvent.change(searchInput, { target: { value: 'yes' } })

      const allTab = screen.getByText(/All \(\d+\)/)
      expect(allTab).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('when filtering by category', () => {
    it('should filter icons when category is selected', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      const statusTab = screen.getByText(/Status \(\d+\)/)
      fireEvent.click(statusTab)

      expect(screen.getByLabelText('Yes (yes)')).toBeInTheDocument()
      expect(screen.getByLabelText('No (no)')).toBeInTheDocument()
      expect(screen.queryByLabelText('Priority 1 (full-1)')).not.toBeInTheDocument()
    })

    it('should clear search when category is selected', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      const searchInput = screen.getByLabelText('Search icons by name or ID')
      fireEvent.change(searchInput, { target: { value: 'yes' } })

      const statusTab = screen.getByText(/Status \(\d+\)/)
      fireEvent.click(statusTab)

      expect(searchInput).toHaveValue('')
    })
  })

  describe('when closing the picker', () => {
    it('should call onClose when close button is clicked', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      const closeButton = screen.getByLabelText('Close icon picker')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should stop propagation when dialog is clicked', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      const stopPropagationSpy = vi.spyOn(Event.prototype, 'stopPropagation')

      fireEvent.click(dialog)

      expect(stopPropagationSpy).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'icon-picker-title')

      const grid = screen.getByRole('grid')
      expect(grid).toHaveAttribute('aria-label', 'Available icons')
    })

    it('should announce filtered results count', () => {
      render(<IconPicker onSelect={mockOnSelect} onClose={mockOnClose} />)

      const searchInput = screen.getByLabelText('Search icons by name or ID')
      fireEvent.change(searchInput, { target: { value: 'yes' } })

      const grid = screen.getByRole('grid')
      expect(grid).toHaveAttribute('aria-label', 'Available icons (1 shown)')
    })
  })
})
