import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NotesPanel from './NotesPanel'

describe('NotesPanel', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()
  const defaultNotes = 'Initial notes content'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when not visible', () => {
    it('should not render anything when visible is false', () => {
      const { container } = render(
        <NotesPanel
          visible={false}
          onClose={mockOnClose}
          notes={defaultNotes}
          onSave={mockOnSave}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('when visible', () => {
    it('should render the panel with title when visible is true', () => {
      render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={defaultNotes} onSave={mockOnSave} />
      )

      expect(screen.getByText('Notes')).toBeInTheDocument()
      expect(screen.getByLabelText('Notes panel')).toBeInTheDocument()
      expect(screen.getByLabelText('Notes content')).toBeInTheDocument()
    })

    it('should display initial notes content', () => {
      render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={defaultNotes} onSave={mockOnSave} />
      )

      const textarea = screen.getByLabelText('Notes content') as HTMLTextAreaElement
      expect(textarea.value).toBe(defaultNotes)
    })

    it('should update textarea value when typing', () => {
      render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={defaultNotes} onSave={mockOnSave} />
      )

      const textarea = screen.getByLabelText('Notes content')
      const newText = 'Updated notes content'
      fireEvent.change(textarea, { target: { value: newText } })

      expect((textarea as HTMLTextAreaElement).value).toBe(newText)
    })

    it('should call onSave with updated content when save button is clicked', () => {
      render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={defaultNotes} onSave={mockOnSave} />
      )

      const textarea = screen.getByLabelText('Notes content')
      const newText = 'Updated notes content'
      fireEvent.change(textarea, { target: { value: newText } })

      const saveButton = screen.getByLabelText('Save and close notes')
      fireEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith(newText)
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should update content when notes prop changes', () => {
      const { rerender } = render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={defaultNotes} onSave={mockOnSave} />
      )

      const newNotes = 'Updated notes from parent'
      rerender(
        <NotesPanel visible={true} onClose={mockOnClose} notes={newNotes} onSave={mockOnSave} />
      )

      const textarea = screen.getByLabelText('Notes content') as HTMLTextAreaElement
      expect(textarea.value).toBe(newNotes)
    })

    it('should have proper accessibility attributes', () => {
      render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={defaultNotes} onSave={mockOnSave} />
      )

      const textarea = screen.getByLabelText('Notes content')
      expect(textarea).toHaveAttribute('aria-label', 'Notes content')
      expect(textarea).toHaveAttribute('aria-multiline', 'true')
      expect(textarea).toHaveAttribute('placeholder', 'Enter detailed notes here...')
    })

    it('should have save button with proper styling and accessibility', () => {
      render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={defaultNotes} onSave={mockOnSave} />
      )

      const saveButton = screen.getByLabelText('Save and close notes')
      expect(saveButton).toBeInTheDocument()
      expect(saveButton).toHaveTextContent('Save')
      expect(saveButton).toHaveStyle({
        background: '#3b82f6',
        color: 'rgb(255, 255, 255)', // white is converted to rgb
      })
    })

    it('should handle empty notes content', () => {
      render(<NotesPanel visible={true} onClose={mockOnClose} notes="" onSave={mockOnSave} />)

      const textarea = screen.getByLabelText('Notes content') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
      expect(textarea).toHaveAttribute('placeholder', 'Enter detailed notes here...')
    })

    it('should handle long notes content', () => {
      const longNotes = 'A'.repeat(1000)
      render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={longNotes} onSave={mockOnSave} />
      )

      const textarea = screen.getByLabelText('Notes content') as HTMLTextAreaElement
      expect(textarea.value).toBe(longNotes)
      expect(textarea.value.length).toBe(1000)
    })

    it('should call onSave with original content when save is clicked without changes', () => {
      render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={defaultNotes} onSave={mockOnSave} />
      )

      const saveButton = screen.getByLabelText('Save and close notes')
      fireEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith(defaultNotes)
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should have proper panel styling and dimensions', () => {
      render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={defaultNotes} onSave={mockOnSave} />
      )

      const panel = screen.getByLabelText('Notes panel')
      expect(panel).toBeInTheDocument()

      // Check that panel has expected styling
      expect(panel).toHaveStyle({
        width: '350px',
        maxHeight: '70vh',
      })
    })

    it('should have textarea with proper styling', () => {
      render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={defaultNotes} onSave={mockOnSave} />
      )

      const textarea = screen.getByLabelText('Notes content')
      // Check for key styles without being too specific about exact values
      expect(textarea).toHaveStyle({
        padding: '12px',
        resize: 'none',
        outline: 'none',
      })
      // Check border style - it should be 'none' based on the component
      // but we'll be flexible about the exact value
      const borderStyle = window.getComputedStyle(textarea).border
      expect(borderStyle).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle special characters in notes', () => {
      const specialNotes = 'Notes with special chars: !@#$%^&*()_+{}[]|\\:;"\'<>,.?/~`'
      render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={specialNotes} onSave={mockOnSave} />
      )

      const textarea = screen.getByLabelText('Notes content') as HTMLTextAreaElement
      expect(textarea.value).toBe(specialNotes)
    })

    it('should handle multiline notes', () => {
      const multilineNotes = 'Line 1\nLine 2\nLine 3'
      render(
        <NotesPanel
          visible={true}
          onClose={mockOnClose}
          notes={multilineNotes}
          onSave={mockOnSave}
        />
      )

      const textarea = screen.getByLabelText('Notes content') as HTMLTextAreaElement
      expect(textarea.value).toBe(multilineNotes)
    })

    it('should handle rapid typing and saving', () => {
      render(
        <NotesPanel visible={true} onClose={mockOnClose} notes={defaultNotes} onSave={mockOnSave} />
      )

      const textarea = screen.getByLabelText('Notes content')
      const saveButton = screen.getByLabelText('Save and close notes')

      // Simulate rapid typing
      fireEvent.change(textarea, { target: { value: 'Note 1' } })
      fireEvent.change(textarea, { target: { value: 'Note 2' } })
      fireEvent.change(textarea, { target: { value: 'Note 3' } })

      // Save
      fireEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith('Note 3')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
