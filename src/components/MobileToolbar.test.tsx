import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MobileToolbar from './MobileToolbar'

describe('MobileToolbar', () => {
  const defaultProps = {
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onFitView: vi.fn(),
    onAddNode: vi.fn(),
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onToggleNotes: vi.fn(),
    onToggleSearch: vi.fn(),
    canUndo: true,
    canRedo: true,
    hasSelection: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render toolbar with proper ARIA attributes', () => {
      render(<MobileToolbar {...defaultProps} />)

      const toolbar = screen.getByRole('toolbar')
      expect(toolbar).toBeInTheDocument()
      expect(toolbar).toHaveAttribute('aria-label', 'Mind map editing toolbar')
    })

    it('should have fixed positioning at bottom', () => {
      render(<MobileToolbar {...defaultProps} />)

      const toolbar = screen.getByRole('toolbar')
      expect(toolbar).toHaveStyle({
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
      })
    })

    it('should have proper styling', () => {
      render(<MobileToolbar {...defaultProps} />)

      const toolbar = screen.getByRole('toolbar')
      expect(toolbar).toHaveStyle({
        background: 'white',
        borderTop: '1px solid #d1d5db',
        padding: '8px 12px',
        zIndex: '1000',
      })
    })
  })

  describe('zoom controls', () => {
    it('should render zoom out button', () => {
      render(<MobileToolbar {...defaultProps} />)

      const zoomOutButton = screen.getByLabelText('Zoom out')
      expect(zoomOutButton).toBeInTheDocument()
      expect(zoomOutButton).toHaveTextContent('−')
    })

    it('should call onZoomOut when zoom out button is clicked', () => {
      render(<MobileToolbar {...defaultProps} />)

      const zoomOutButton = screen.getByLabelText('Zoom out')
      fireEvent.click(zoomOutButton)

      expect(defaultProps.onZoomOut).toHaveBeenCalledTimes(1)
    })

    it('should render fit view button', () => {
      render(<MobileToolbar {...defaultProps} />)

      const fitViewButton = screen.getByLabelText('Fit view')
      expect(fitViewButton).toBeInTheDocument()
      expect(fitViewButton).toHaveTextContent('⤢')
    })

    it('should call onFitView when fit view button is clicked', () => {
      render(<MobileToolbar {...defaultProps} />)

      const fitViewButton = screen.getByLabelText('Fit view')
      fireEvent.click(fitViewButton)

      expect(defaultProps.onFitView).toHaveBeenCalledTimes(1)
    })

    it('should render zoom in button', () => {
      render(<MobileToolbar {...defaultProps} />)

      const zoomInButton = screen.getByLabelText('Zoom in')
      expect(zoomInButton).toBeInTheDocument()
      expect(zoomInButton).toHaveTextContent('+')
    })

    it('should call onZoomIn when zoom in button is clicked', () => {
      render(<MobileToolbar {...defaultProps} />)

      const zoomInButton = screen.getByLabelText('Zoom in')
      fireEvent.click(zoomInButton)

      expect(defaultProps.onZoomIn).toHaveBeenCalledTimes(1)
    })
  })

  describe('add node button', () => {
    it('should render add node button', () => {
      render(<MobileToolbar {...defaultProps} />)

      const addNodeButton = screen.getByLabelText('Add node')
      expect(addNodeButton).toBeInTheDocument()
      expect(addNodeButton).toHaveTextContent('+')
    })

    it('should call onAddNode when add node button is clicked', () => {
      render(<MobileToolbar {...defaultProps} />)

      const addNodeButton = screen.getByLabelText('Add node')
      fireEvent.click(addNodeButton)

      expect(defaultProps.onAddNode).toHaveBeenCalledTimes(1)
    })
  })

  describe('search button', () => {
    it('should render search button', () => {
      render(<MobileToolbar {...defaultProps} />)

      const searchButton = screen.getByLabelText('Search')
      expect(searchButton).toBeInTheDocument()
      expect(searchButton).toHaveTextContent('🔍')
    })

    it('should call onToggleSearch when search button is clicked', () => {
      render(<MobileToolbar {...defaultProps} />)

      const searchButton = screen.getByLabelText('Search')
      fireEvent.click(searchButton)

      expect(defaultProps.onToggleSearch).toHaveBeenCalledTimes(1)
    })
  })

  describe('undo/redo controls', () => {
    it('should render undo button when canUndo is true', () => {
      render(<MobileToolbar {...defaultProps} canUndo={true} />)

      const undoButton = screen.getByLabelText('Undo last action')
      expect(undoButton).toBeInTheDocument()
      expect(undoButton).toHaveTextContent('↶')
      expect(undoButton).not.toBeDisabled()
    })

    it('should render undo button as disabled when canUndo is false', () => {
      render(<MobileToolbar {...defaultProps} canUndo={false} />)

      const undoButton = screen.getByLabelText('Cannot undo')
      expect(undoButton).toBeInTheDocument()
      expect(undoButton).toBeDisabled()
      expect(undoButton).toHaveStyle({ opacity: '0.3' })
    })

    it('should call onUndo when undo button is clicked and canUndo is true', () => {
      render(<MobileToolbar {...defaultProps} canUndo={true} />)

      const undoButton = screen.getByLabelText('Undo last action')
      fireEvent.click(undoButton)

      expect(defaultProps.onUndo).toHaveBeenCalledTimes(1)
    })

    it('should render redo button when canRedo is true', () => {
      render(<MobileToolbar {...defaultProps} canRedo={true} />)

      const redoButton = screen.getByLabelText('Redo last action')
      expect(redoButton).toBeInTheDocument()
      expect(redoButton).toHaveTextContent('↷')
      expect(redoButton).not.toBeDisabled()
    })

    it('should render redo button as disabled when canRedo is false', () => {
      render(<MobileToolbar {...defaultProps} canRedo={false} />)

      const redoButton = screen.getByLabelText('Cannot redo')
      expect(redoButton).toBeInTheDocument()
      expect(redoButton).toBeDisabled()
      expect(redoButton).toHaveStyle({ opacity: '0.3' })
    })

    it('should call onRedo when redo button is clicked and canRedo is true', () => {
      render(<MobileToolbar {...defaultProps} canRedo={true} />)

      const redoButton = screen.getByLabelText('Redo last action')
      fireEvent.click(redoButton)

      expect(defaultProps.onRedo).toHaveBeenCalledTimes(1)
    })
  })

  describe('notes button', () => {
    it('should render notes button when hasSelection is true', () => {
      render(<MobileToolbar {...defaultProps} hasSelection={true} />)

      const notesButton = screen.getByLabelText('Toggle notes')
      expect(notesButton).toBeInTheDocument()
      expect(notesButton).toHaveTextContent('📝')
    })

    it('should not render notes button when hasSelection is false', () => {
      render(<MobileToolbar {...defaultProps} hasSelection={false} />)

      const notesButton = screen.queryByLabelText('Toggle notes')
      expect(notesButton).not.toBeInTheDocument()
    })

    it('should call onToggleNotes when notes button is clicked', () => {
      render(<MobileToolbar {...defaultProps} hasSelection={true} />)

      const notesButton = screen.getByLabelText('Toggle notes')
      fireEvent.click(notesButton)

      expect(defaultProps.onToggleNotes).toHaveBeenCalledTimes(1)
    })
  })

  describe('button styling', () => {
    it('should apply mobileButtonStyle to all buttons', () => {
      render(<MobileToolbar {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // Check key styles that are important for mobile usability
        expect(button).toHaveStyle({
          padding: '12px',
          background: '#f3f4f6',
          fontSize: '18px',
          fontWeight: 'bold',
        })

        // Check minimum dimensions for touch targets
        expect(button).toHaveStyle({
          minHeight: '44px',
          minWidth: '44px',
        })
      })
    })

    it('should have proper styling for mobile usability', () => {
      render(<MobileToolbar {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      const firstButton = buttons[0]

      // Check that buttons have proper styling for mobile
      expect(firstButton).toHaveStyle({
        borderRadius: '8px',
        cursor: 'pointer',
      })

      // Check display properties for proper button layout
      expect(firstButton).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })
    })
  })

  describe('layout and grid', () => {
    it('should use grid layout with 5 columns', () => {
      render(<MobileToolbar {...defaultProps} />)

      const toolbar = screen.getByRole('toolbar')
      expect(toolbar).toHaveStyle({
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
      })
    })

    it('should adjust spacer when hasSelection is true', () => {
      render(<MobileToolbar {...defaultProps} hasSelection={true} />)

      // When hasSelection is true, notes button is shown
      // The spacer should span 2 columns
      const toolbar = screen.getByRole('toolbar')
      const spacer = toolbar.querySelector('div')
      expect(spacer).toHaveStyle({
        gridColumn: 'span 2',
      })
    })

    it('should adjust spacer when hasSelection is false', () => {
      render(<MobileToolbar {...defaultProps} hasSelection={false} />)

      // When hasSelection is false, notes button is not shown
      // The spacer should span 3 columns
      const toolbar = screen.getByRole('toolbar')
      const spacer = toolbar.querySelector('div')
      expect(spacer).toHaveStyle({
        gridColumn: 'span 3',
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels for all buttons', () => {
      render(<MobileToolbar {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    })

    it('should have proper ARIA labels for undo/redo based on state', () => {
      render(<MobileToolbar {...defaultProps} canUndo={false} canRedo={true} />)

      const undoButton = screen.getByLabelText('Cannot undo')
      const redoButton = screen.getByLabelText('Redo last action')

      expect(undoButton).toHaveAttribute('aria-label', 'Cannot undo')
      expect(redoButton).toHaveAttribute('aria-label', 'Redo last action')
    })

    it('should disable undo/redo buttons when cannot perform action', () => {
      render(<MobileToolbar {...defaultProps} canUndo={false} canRedo={false} />)

      const undoButton = screen.getByLabelText('Cannot undo')
      const redoButton = screen.getByLabelText('Cannot redo')

      expect(undoButton).toBeDisabled()
      expect(redoButton).toBeDisabled()
    })
  })

  describe('edge cases', () => {
    it('should handle rapid button clicks', () => {
      render(<MobileToolbar {...defaultProps} />)

      const zoomInButton = screen.getByLabelText('Zoom in')
      const zoomOutButton = screen.getByLabelText('Zoom out')

      // Simulate rapid clicking
      fireEvent.click(zoomInButton)
      fireEvent.click(zoomOutButton)
      fireEvent.click(zoomInButton)
      fireEvent.click(zoomOutButton)

      expect(defaultProps.onZoomIn).toHaveBeenCalledTimes(2)
      expect(defaultProps.onZoomOut).toHaveBeenCalledTimes(2)
    })

    it('should handle all buttons being clicked', () => {
      render(<MobileToolbar {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        fireEvent.click(button)
      })

      // Check that all handlers were called
      expect(defaultProps.onZoomIn).toHaveBeenCalled()
      expect(defaultProps.onZoomOut).toHaveBeenCalled()
      expect(defaultProps.onFitView).toHaveBeenCalled()
      expect(defaultProps.onAddNode).toHaveBeenCalled()
      expect(defaultProps.onToggleSearch).toHaveBeenCalled()
      expect(defaultProps.onUndo).toHaveBeenCalled()
      expect(defaultProps.onRedo).toHaveBeenCalled()
      expect(defaultProps.onToggleNotes).toHaveBeenCalled()
    })

    it('should render correctly with minimal props', () => {
      const minimalProps = {
        onZoomIn: vi.fn(),
        onZoomOut: vi.fn(),
        onFitView: vi.fn(),
        onAddNode: vi.fn(),
        onUndo: vi.fn(),
        onRedo: vi.fn(),
        onToggleNotes: vi.fn(),
        onToggleSearch: vi.fn(),
        canUndo: false,
        canRedo: false,
        hasSelection: false,
      }

      render(<MobileToolbar {...minimalProps} />)

      const toolbar = screen.getByRole('toolbar')
      expect(toolbar).toBeInTheDocument()

      // Should have all buttons except notes
      expect(screen.getByLabelText('Zoom out')).toBeInTheDocument()
      expect(screen.getByLabelText('Fit view')).toBeInTheDocument()
      expect(screen.getByLabelText('Zoom in')).toBeInTheDocument()
      expect(screen.getByLabelText('Add node')).toBeInTheDocument()
      expect(screen.getByLabelText('Search')).toBeInTheDocument()
      expect(screen.getByLabelText('Cannot undo')).toBeInTheDocument()
      expect(screen.getByLabelText('Cannot redo')).toBeInTheDocument()
      expect(screen.queryByLabelText('Toggle notes')).not.toBeInTheDocument()
    })
  })
})
