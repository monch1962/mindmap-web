import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThreeDView from './ThreeDView'
import type { MindMapTree } from '../types'

describe('ThreeDView', () => {
  const mockTree: MindMapTree = {
    id: 'root',
    content: 'Root Topic',
    children: [
      {
        id: '1',
        content: 'Child 1',
        children: [],
      },
      {
        id: '2',
        content: 'Child 2',
        children: [],
      },
    ],
  }

  it('should not render when visible is false', () => {
    const { container } = render(<ThreeDView visible={false} onClose={vi.fn()} tree={mockTree} />)

    expect(container.firstChild).toBe(null)
  })

  it('should not render when tree is null', () => {
    const { container } = render(<ThreeDView visible={true} onClose={vi.fn()} tree={null} />)

    expect(container.firstChild).toBe(null)
  })

  it('should render 3D view when visible and tree provided', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    expect(screen.getByText('🎨 3D View')).toBeInTheDocument()
    expect(screen.getAllByText('Root Topic')).toHaveLength(2) // Title and node
  })

  it('should display title with tree content', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    expect(screen.getAllByText('Root Topic')).toHaveLength(2) // Title and node
  })

  it('should call onClose when exit button is clicked', () => {
    const handleClose = vi.fn()
    render(<ThreeDView visible={true} onClose={handleClose} tree={mockTree} />)

    const exitButton = screen.getByLabelText('Exit 3D view (Escape)')
    fireEvent.click(exitButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Escape key is pressed', () => {
    const handleClose = vi.fn()
    render(<ThreeDView visible={true} onClose={handleClose} tree={mockTree} />)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should toggle auto-rotate when button is clicked', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    const rotateButton = screen.getByLabelText('Pause auto-rotation')
    fireEvent.click(rotateButton)

    expect(screen.getByLabelText('Start auto-rotation')).toBeInTheDocument()
  })

  it('should display controls help text', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    expect(screen.getByLabelText(/3D view keyboard and mouse controls/)).toBeInTheDocument()
    expect(screen.getByText(/Drag to rotate/)).toBeInTheDocument()
    expect(screen.getByText(/Scroll to zoom/)).toBeInTheDocument()
    expect(screen.getByText(/Arrow keys to navigate/)).toBeInTheDocument()
  })

  it('should display zoom indicator', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    const zoomIndicator = screen.getByLabelText(/Zoom level:/)
    expect(zoomIndicator).toBeInTheDocument()
    expect(zoomIndicator).toHaveTextContent(/Zoom: 100%/)
  })

  it('should display stats panel', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    expect(screen.getByText('Stats')).toBeInTheDocument()
    expect(screen.getByText(/Total Nodes:/)).toBeInTheDocument()
    expect(screen.getByText(/Max Depth:/)).toBeInTheDocument()
    expect(screen.getByText(/Rotation X:/)).toBeInTheDocument()
    expect(screen.getByText(/Rotation Y:/)).toBeInTheDocument()
  })

  it('should handle mouse drag for rotation', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    const container = screen.getByLabelText(/3D view of mind map/)

    fireEvent.mouseDown(container, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(container, { clientX: 150, clientY: 120 })
    fireEvent.mouseUp(container)

    // Verify auto-rotate is disabled after drag
    expect(screen.getByLabelText('Start auto-rotation')).toBeInTheDocument()
  })

  it('should handle scroll for zoom', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    const container = screen.getByLabelText(/3D view of mind map/)

    fireEvent.wheel(container, { deltaY: 100 })

    // Zoom indicator should update
    const zoomIndicator = screen.getByLabelText(/Zoom level:/)
    expect(zoomIndicator).toBeInTheDocument()
  })

  it('should handle arrow keys for navigation', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    fireEvent.keyDown(window, { key: 'ArrowUp' })
    fireEvent.keyDown(window, { key: 'ArrowDown' })

    // Should not close the view, navigation should work
    expect(screen.getByLabelText('Exit 3D view (Escape)')).toBeInTheDocument()
  })

  it('should handle + and - keys for zoom', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    const zoomIndicator1 = screen.getByLabelText(/Zoom level:/)
    const text1 = zoomIndicator1.textContent

    fireEvent.keyDown(window, { key: '+' })

    const zoomIndicator2 = screen.getByLabelText(/Zoom level:/)
    const text2 = zoomIndicator2.textContent

    // Zoom should change
    expect(text1).not.toBe(text2)
  })

  it('should handle R key to toggle auto-rotate', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    expect(screen.getByLabelText('Pause auto-rotation')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'r' })

    expect(screen.getByLabelText('Start auto-rotation')).toBeInTheDocument()
  })

  it('should show selected node info when node is clicked', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    // Find a node in the list
    const nodes = screen.getAllByRole('listitem')
    expect(nodes.length).toBeGreaterThan(0)

    // Click on first node
    fireEvent.click(nodes[0])

    // Selected node info should appear
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should support keyboard selection of nodes', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    const nodes = screen.getAllByRole('listitem')
    expect(nodes.length).toBeGreaterThan(0)

    // Press Enter on first node
    fireEvent.keyDown(nodes[0], { key: 'Enter' })

    // Selected node info should appear
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should deselect node when clicking same node', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    const nodes = screen.getAllByRole('listitem')
    const firstNode = nodes[0]

    // Select node
    fireEvent.click(firstNode)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Deselect node
    fireEvent.click(firstNode)

    // Dialog should be gone
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should have correct accessibility attributes', () => {
    render(<ThreeDView visible={true} onClose={vi.fn()} tree={mockTree} />)

    expect(screen.getByRole('region')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })
})
