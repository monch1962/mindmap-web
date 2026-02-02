import { render, screen, fireEvent } from '@testing-library/react'
import BasePanel from './BasePanel'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('BasePanel', () => {
  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
    title: 'Test Panel',
    children: <div>Test Content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders null when not visible', () => {
    const { container } = render(<BasePanel {...defaultProps} visible={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders panel with title and content when visible', () => {
    render(<BasePanel {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Panel')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<BasePanel {...defaultProps} />)

    const closeButton = screen.getByLabelText('Close panel')
    fireEvent.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render close button when showCloseButton is false', () => {
    render(<BasePanel {...defaultProps} showCloseButton={false} />)

    expect(screen.queryByLabelText('Close panel')).not.toBeInTheDocument()
  })

  it('handles escape key to close panel', () => {
    render(<BasePanel {...defaultProps} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on escape when closeOnEscape is false', () => {
    render(<BasePanel {...defaultProps} closeOnEscape={false} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<BasePanel {...defaultProps} className="custom-class" />)

    const panel = screen.getByRole('dialog')
    expect(panel).toHaveClass('custom-class')
  })

  it('uses aria-label when provided', () => {
    render(<BasePanel {...defaultProps} ariaLabel="Custom Label" />)

    const panel = screen.getByLabelText('Custom Label')
    expect(panel).toBeInTheDocument()
  })

  it('falls back to title for aria-label', () => {
    render(<BasePanel {...defaultProps} />)

    const panel = screen.getByLabelText('Test Panel')
    expect(panel).toBeInTheDocument()
  })

  describe('position prop', () => {
    it('applies right position styles by default', () => {
      render(<BasePanel {...defaultProps} />)

      const panel = screen.getByRole('dialog')
      expect(panel).toHaveStyle({ right: '20px', top: '50%' })
    })

    it('applies center position styles', () => {
      render(<BasePanel {...defaultProps} position="center" />)

      const panel = screen.getByRole('dialog')
      expect(panel).toHaveStyle({ top: '50%', left: '50%' })
    })

    it('applies left position styles', () => {
      render(<BasePanel {...defaultProps} position="left" />)

      const panel = screen.getByRole('dialog')
      expect(panel).toHaveStyle({ left: '20px', top: '50%' })
    })
  })

  describe('size prop', () => {
    it('applies medium size by default', () => {
      render(<BasePanel {...defaultProps} />)

      const panel = screen.getByRole('dialog')
      expect(panel).toHaveStyle({ width: '400px' })
    })

    it('applies small size', () => {
      render(<BasePanel {...defaultProps} size="sm" />)

      const panel = screen.getByRole('dialog')
      expect(panel).toHaveStyle({ width: '300px' })
    })

    it('applies large size', () => {
      render(<BasePanel {...defaultProps} size="lg" />)

      const panel = screen.getByRole('dialog')
      expect(panel).toHaveStyle({ width: '500px' })
    })
  })

  it('applies custom styles', () => {
    const customStyles = { boxShadow: '0 0 10px red', width: '500px' }
    render(<BasePanel {...defaultProps} customStyles={customStyles} />)

    const panel = screen.getByRole('dialog')
    // Check style attribute directly
    expect(panel).toHaveAttribute('style')
    const style = panel.getAttribute('style') || ''
    expect(style).toContain('width: 500px')
    expect(style).toContain('box-shadow: 0 0 10px red')
  })

  it('renders backdrop when provided', () => {
    const backdrop = <div data-testid="backdrop">Backdrop</div>
    render(<BasePanel {...defaultProps} backdrop={backdrop} />)

    expect(screen.getByTestId('backdrop')).toBeInTheDocument()
  })

  it('traps focus when trapFocus is true', () => {
    render(
      <BasePanel {...defaultProps} showCloseButton={false}>
        <button>First</button>
        <button>Second</button>
      </BasePanel>
    )

    // Focus should be trapped inside the panel
    // Without close button, first button should get focus
    const firstButton = screen.getByText('First')
    expect(document.activeElement).toBe(firstButton)
  })
})
