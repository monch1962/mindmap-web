import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BulkOperationsPanel from './BulkOperationsPanel'

describe('BulkOperationsPanel', () => {
  const mockProps = {
    selectedCount: 5,
    onBulkDelete: vi.fn(),
    onBulkIconChange: vi.fn(),
    onBulkCloudChange: vi.fn(),
    onBulkColorChange: vi.fn(),
    availableIcons: ['star', 'flag', 'heart', 'check', 'warning'],
    onClearSelection: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Desktop by default
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render with correct selected count', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    expect(screen.getByRole('region')).toBeInTheDocument()
    // The text is broken into multiple nodes, so we need to check the container
    const titleElement = screen.getByRole('heading', { name: /Bulk Operations/ })
    expect(titleElement).toHaveTextContent('📦 Bulk Operations (5 nodes selected)')
    expect(screen.getByLabelText('Close bulk operations panel')).toBeInTheDocument()
  })

  it('should render all action buttons', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    expect(screen.getByLabelText('Delete all 5 selected nodes')).toBeInTheDocument()
    expect(screen.getByText('🗑️ Delete All')).toBeInTheDocument()

    expect(screen.getByText('🏷️ Set Icon')).toBeInTheDocument()
    expect(screen.getByText('☁️ Set Cloud')).toBeInTheDocument()
    expect(screen.getByText('🎨 Set Color')).toBeInTheDocument()
    expect(screen.getByLabelText('Clear all selections')).toBeInTheDocument()
    expect(screen.getByText('✖️ Clear Selection')).toBeInTheDocument()
  })

  it('should call onBulkDelete when delete button is clicked', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const deleteButton = screen.getByLabelText('Delete all 5 selected nodes')
    fireEvent.click(deleteButton)

    expect(mockProps.onBulkDelete).toHaveBeenCalledTimes(1)
  })

  it('should call onClearSelection when clear selection button is clicked', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const clearButton = screen.getByLabelText('Clear all selections')
    fireEvent.click(clearButton)

    expect(mockProps.onClearSelection).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when close button is clicked', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const closeButton = screen.getByLabelText('Close bulk operations panel')
    fireEvent.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should show icon dropdown when Set Icon button is clicked', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const iconButton = screen.getByText('🏷️ Set Icon')
    expect(screen.queryByRole('menu', { name: 'Select icon' })).not.toBeInTheDocument()

    fireEvent.click(iconButton)

    expect(screen.getByRole('menu', { name: 'Select icon' })).toBeInTheDocument()
    expect(screen.getByText('Clear Icons')).toBeInTheDocument()

    // Check that some icons are rendered
    expect(screen.getByLabelText('Set star icon')).toBeInTheDocument()
    expect(screen.getByLabelText('Set flag icon')).toBeInTheDocument()
    expect(screen.getByLabelText('Set heart icon')).toBeInTheDocument()
  })

  it('should call onBulkIconChange with null when Clear Icons is clicked', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const iconButton = screen.getByText('🏷️ Set Icon')
    fireEvent.click(iconButton)

    const clearButton = screen.getByText('Clear Icons')
    fireEvent.click(clearButton)

    expect(mockProps.onBulkIconChange).toHaveBeenCalledWith(null)
    expect(screen.queryByRole('menu', { name: 'Select icon' })).not.toBeInTheDocument()
  })

  it('should call onBulkIconChange with icon when icon is clicked', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const iconButton = screen.getByText('🏷️ Set Icon')
    fireEvent.click(iconButton)

    const starIcon = screen.getByLabelText('Set star icon')
    fireEvent.click(starIcon)

    expect(mockProps.onBulkIconChange).toHaveBeenCalledWith('star')
    expect(screen.queryByRole('menu', { name: 'Select icon' })).not.toBeInTheDocument()
  })

  it('should show cloud dropdown when Set Cloud button is clicked', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const cloudButton = screen.getByText('☁️ Set Cloud')
    expect(screen.queryByRole('menu', { name: 'Select cloud color' })).not.toBeInTheDocument()

    fireEvent.click(cloudButton)

    expect(screen.getByRole('menu', { name: 'Select cloud color' })).toBeInTheDocument()
    expect(screen.getByText('Clear Clouds')).toBeInTheDocument()

    // Check that cloud colors are rendered
    expect(screen.getByLabelText('Set Red cloud')).toBeInTheDocument()
    expect(screen.getByLabelText('Set Blue cloud')).toBeInTheDocument()
    expect(screen.getByLabelText('Set Green cloud')).toBeInTheDocument()
  })

  it('should call onBulkCloudChange with null when Clear Clouds is clicked', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const cloudButton = screen.getByText('☁️ Set Cloud')
    fireEvent.click(cloudButton)

    const clearButton = screen.getByText('Clear Clouds')
    fireEvent.click(clearButton)

    expect(mockProps.onBulkCloudChange).toHaveBeenCalledWith(null)
    expect(screen.queryByRole('menu', { name: 'Select cloud color' })).not.toBeInTheDocument()
  })

  it('should call onBulkCloudChange with cloud color when cloud color is clicked', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const cloudButton = screen.getByText('☁️ Set Cloud')
    fireEvent.click(cloudButton)

    const redCloud = screen.getByLabelText('Set Red cloud')
    fireEvent.click(redCloud)

    expect(mockProps.onBulkCloudChange).toHaveBeenCalledWith({ color: '#fecaca' })
    expect(screen.queryByRole('menu', { name: 'Select cloud color' })).not.toBeInTheDocument()
  })

  it('should show color dropdown when Set Color button is clicked', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const colorButton = screen.getByText('🎨 Set Color')
    expect(screen.queryByRole('menu', { name: 'Select node color' })).not.toBeInTheDocument()

    fireEvent.click(colorButton)

    expect(screen.getByRole('menu', { name: 'Select node color' })).toBeInTheDocument()

    // Check that node colors are rendered
    expect(screen.getByLabelText('Set White color')).toBeInTheDocument()
    expect(screen.getByLabelText('Set Light Red color')).toBeInTheDocument()
    expect(screen.getByLabelText('Set Light Blue color')).toBeInTheDocument()
  })

  it('should call onBulkColorChange with color when color is clicked', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const colorButton = screen.getByText('🎨 Set Color')
    fireEvent.click(colorButton)

    const whiteColor = screen.getByLabelText('Set White color')
    fireEvent.click(whiteColor)

    expect(mockProps.onBulkColorChange).toHaveBeenCalledWith('white')
    expect(screen.queryByRole('menu', { name: 'Select node color' })).not.toBeInTheDocument()
  })

  it('should only show one dropdown at a time', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const iconButton = screen.getByText('🏷️ Set Icon')
    const cloudButton = screen.getByText('☁️ Set Cloud')
    const colorButton = screen.getByText('🎨 Set Color')

    // Open icon dropdown
    fireEvent.click(iconButton)
    expect(screen.getByRole('menu', { name: 'Select icon' })).toBeInTheDocument()
    expect(screen.queryByRole('menu', { name: 'Select cloud color' })).not.toBeInTheDocument()
    expect(screen.queryByRole('menu', { name: 'Select node color' })).not.toBeInTheDocument()

    // Click cloud button - should close icon dropdown and open cloud dropdown
    fireEvent.click(cloudButton)
    expect(screen.queryByRole('menu', { name: 'Select icon' })).not.toBeInTheDocument()
    expect(screen.getByRole('menu', { name: 'Select cloud color' })).toBeInTheDocument()
    expect(screen.queryByRole('menu', { name: 'Select node color' })).not.toBeInTheDocument()

    // Click color button - should close cloud dropdown and open color dropdown
    fireEvent.click(colorButton)
    expect(screen.queryByRole('menu', { name: 'Select icon' })).not.toBeInTheDocument()
    expect(screen.queryByRole('menu', { name: 'Select cloud color' })).not.toBeInTheDocument()
    expect(screen.getByRole('menu', { name: 'Select node color' })).toBeInTheDocument()
  })

  it('should close dropdown when clicking the same button twice', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const iconButton = screen.getByText('🏷️ Set Icon')

    // First click opens dropdown
    fireEvent.click(iconButton)
    expect(screen.getByRole('menu', { name: 'Select icon' })).toBeInTheDocument()

    // Second click closes dropdown
    fireEvent.click(iconButton)
    expect(screen.queryByRole('menu', { name: 'Select icon' })).not.toBeInTheDocument()
  })

  it('should render usage tip', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    expect(screen.getByRole('note', { name: 'Usage tip' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Tip: Use Shift+Click to add/remove nodes from selection • Ctrl+A to select all'
      )
    ).toBeInTheDocument()
  })

  it('should adapt to mobile screen size', () => {
    // Set mobile screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile width
    })

    render(<BulkOperationsPanel {...mockProps} />)

    const panel = screen.getByRole('region')
    expect(panel).toHaveStyle({ minWidth: '90vw', maxWidth: '95vw' })
  })

  it('should adapt to desktop screen size', () => {
    // Set desktop screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Desktop width
    })

    render(<BulkOperationsPanel {...mockProps} />)

    const panel = screen.getByRole('region')
    expect(panel).toHaveStyle({ minWidth: '400px', maxWidth: '600px' })
  })

  it('should handle window resize events', async () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const panel = screen.getByRole('region')

    // Initial desktop size
    expect(panel).toHaveStyle({ minWidth: '400px', maxWidth: '600px' })

    // Resize to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    fireEvent.resize(window)

    // Wait for resize handler to update
    await waitFor(() => {
      expect(panel).toHaveStyle({ minWidth: '90vw', maxWidth: '95vw' })
    })

    // Resize back to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    fireEvent.resize(window)

    await waitFor(() => {
      expect(panel).toHaveStyle({ minWidth: '400px', maxWidth: '600px' })
    })
  })

  it('should render correct icon emojis', () => {
    // Check that the component renders the correct emojis
    render(<BulkOperationsPanel {...mockProps} />)

    const iconButton = screen.getByText('🏷️ Set Icon')
    fireEvent.click(iconButton)

    // The component should render the correct emojis
    const starIcon = screen.getByLabelText('Set star icon')
    expect(starIcon).toHaveTextContent('⭐')

    const flagIcon = screen.getByLabelText('Set flag icon')
    expect(flagIcon).toHaveTextContent('🚩')
  })

  it('should handle zero selected nodes', () => {
    const propsWithZero = { ...mockProps, selectedCount: 0 }
    render(<BulkOperationsPanel {...propsWithZero} />)

    // The text is broken into multiple nodes, so we need to check the container
    const titleElement = screen.getByRole('heading', { name: /Bulk Operations/ })
    expect(titleElement).toHaveTextContent('📦 Bulk Operations (0 nodes selected)')
    expect(screen.getByLabelText('Delete all 0 selected nodes')).toBeInTheDocument()
  })

  it('should handle single selected node', () => {
    const propsWithOne = { ...mockProps, selectedCount: 1 }
    render(<BulkOperationsPanel {...propsWithOne} />)

    // The text is broken into multiple nodes, so we need to check the container
    // Note: Component says "nodes selected" even for 1 (not "node selected")
    const titleElement = screen.getByRole('heading', { name: /Bulk Operations/ })
    expect(titleElement).toHaveTextContent('📦 Bulk Operations (1 nodes selected)')
    expect(screen.getByLabelText('Delete all 1 selected nodes')).toBeInTheDocument()
  })

  it('should render icons with correct styling based on availability', () => {
    render(<BulkOperationsPanel {...mockProps} />)

    const iconButton = screen.getByText('🏷️ Set Icon')
    fireEvent.click(iconButton)

    // Star icon is in availableIcons, so it should have different background
    const starIcon = screen.getByLabelText('Set star icon')
    expect(starIcon).toHaveStyle({ background: '#eff6ff' })

    // Bookmark icon is NOT in availableIcons, so it should have default background
    const bookmarkIcon = screen.getByLabelText('Set bookmark icon')
    expect(bookmarkIcon).toHaveStyle({ background: 'white' })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<BulkOperationsPanel {...mockProps} />)

      expect(screen.getByRole('region', { name: 'Bulk operations panel' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'Bulk actions' })).toBeInTheDocument()
      expect(screen.getByRole('note', { name: 'Usage tip' })).toBeInTheDocument()

      const iconButton = screen.getByText('🏷️ Set Icon')
      fireEvent.click(iconButton)

      expect(screen.getByRole('menu', { name: 'Select icon' })).toBeInTheDocument()
      expect(screen.getAllByRole('menuitem')).toHaveLength(11) // 10 icons + clear button
    })

    it('should have proper aria-expanded states', () => {
      render(<BulkOperationsPanel {...mockProps} />)

      const iconButton = screen.getByText('🏷️ Set Icon')
      const cloudButton = screen.getByText('☁️ Set Cloud')
      const colorButton = screen.getByText('🎨 Set Color')

      // Initially all should be false
      expect(iconButton).toHaveAttribute('aria-expanded', 'false')
      expect(cloudButton).toHaveAttribute('aria-expanded', 'false')
      expect(colorButton).toHaveAttribute('aria-expanded', 'false')

      // Click icon button
      fireEvent.click(iconButton)
      expect(iconButton).toHaveAttribute('aria-expanded', 'true')
      expect(cloudButton).toHaveAttribute('aria-expanded', 'false')
      expect(colorButton).toHaveAttribute('aria-expanded', 'false')

      // Click cloud button
      fireEvent.click(cloudButton)
      expect(iconButton).toHaveAttribute('aria-expanded', 'false')
      expect(cloudButton).toHaveAttribute('aria-expanded', 'true')
      expect(colorButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should have proper aria-haspopup attributes', () => {
      render(<BulkOperationsPanel {...mockProps} />)

      const iconButton = screen.getByText('🏷️ Set Icon')
      const cloudButton = screen.getByText('☁️ Set Cloud')
      const colorButton = screen.getByText('🎨 Set Color')

      expect(iconButton).toHaveAttribute('aria-haspopup', 'true')
      expect(cloudButton).toHaveAttribute('aria-haspopup', 'true')
      expect(colorButton).toHaveAttribute('aria-haspopup', 'true')
    })
  })
})
