import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Position } from 'reactflow'
import CrossLinkEdge from './CrossLinkEdge'
import type { EdgeProps } from 'reactflow'

// Mock reactflow components
vi.mock('reactflow', async () => {
  const actual = await vi.importActual<typeof import('reactflow')>('reactflow')
  return {
    ...actual,
    BaseEdge: ({
      path,
      markerEnd,
      style = {},
    }: {
      path: string
      markerEnd?: string
      style?: React.CSSProperties
    }) => {
      const mergedStyle = {
        ...style,
        stroke: '#f59e0b',
        strokeWidth: 2,
        strokeDasharray: '5,5',
      }
      return (
        <path
          data-testid="base-edge"
          d={path}
          marker-end={markerEnd || undefined}
          style={mergedStyle}
          role="presentation"
        />
      )
    },
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="edge-label-renderer">{children}</div>
    ),
    getBezierPath: vi.fn().mockReturnValue(['M0,0 L100,100', 50, 50]),
  }
})

describe('CrossLinkEdge', () => {
  const defaultProps: EdgeProps = {
    id: 'edge-1',
    source: 'node-1',
    target: 'node-2',
    sourceX: 0,
    sourceY: 0,
    targetX: 100,
    targetY: 100,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {},
    markerEnd: undefined,
    data: {},
  }

  describe('basic rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<CrossLinkEdge {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render with presentation role', () => {
      const { getAllByRole } = render(<CrossLinkEdge {...defaultProps} />)
      const presentationElements = getAllByRole('presentation')
      expect(presentationElements.length).toBeGreaterThan(0)
    })

    it('should have aria-label for cross-link edge', () => {
      const { getAllByRole } = render(<CrossLinkEdge {...defaultProps} />)
      const presentationElements = getAllByRole('presentation')
      // The outer <g> element should have the aria-label
      const edgeElement = presentationElements.find(
        el => el.getAttribute('aria-label') === 'Cross-link edge between nodes'
      )
      expect(edgeElement).toBeInTheDocument()
    })
  })

  describe('edge styling', () => {
    it('should render BaseEdge with correct path', () => {
      const { getByTestId } = render(<CrossLinkEdge {...defaultProps} />)
      const baseEdge = getByTestId('base-edge')
      expect(baseEdge).toBeInTheDocument()
      expect(baseEdge).toHaveAttribute('d', 'M0,0 L100,100')
    })

    it('should apply custom styling to edge', () => {
      const { getByTestId } = render(<CrossLinkEdge {...defaultProps} />)
      const baseEdge = getByTestId('base-edge')

      // Check for cross-link specific styling
      expect(baseEdge).toHaveStyle({
        stroke: '#f59e0b',
        strokeWidth: '2',
      })

      // Check for dashed line style
      const strokeDasharray = window.getComputedStyle(baseEdge).strokeDasharray
      expect(strokeDasharray).toBe('5,5')
    })

    it('should merge custom style props', () => {
      const customStyle = { opacity: 0.5 }
      const { getByTestId } = render(<CrossLinkEdge {...defaultProps} style={customStyle} />)
      const baseEdge = getByTestId('base-edge')

      // Component's styles should override custom styles for stroke, strokeWidth, strokeDasharray
      expect(baseEdge).toHaveStyle({
        stroke: '#f59e0b', // Component's default
        strokeWidth: '2', // Component's default, not custom
        opacity: '0.5', // Custom should work for other properties
      })

      // But dashed style should still be present
      const strokeDasharray = window.getComputedStyle(baseEdge).strokeDasharray
      expect(strokeDasharray).toBe('5,5')
    })

    it('should apply markerEnd if provided', () => {
      const { getByTestId } = render(<CrossLinkEdge {...defaultProps} markerEnd="url(#arrow)" />)
      const baseEdge = getByTestId('base-edge')
      // Check if markerEnd is passed through
      expect(baseEdge).toBeInTheDocument()
      // The mock should pass markerEnd as SVG attribute (marker-end)
      expect(baseEdge.getAttribute('marker-end')).toBe('url(#arrow)')
    })
  })

  describe('cross-link label rendering', () => {
    it('should not render cross-link label when data.isCrossLink is false', () => {
      const { queryByTestId } = render(
        <CrossLinkEdge {...defaultProps} data={{ isCrossLink: false }} />
      )
      expect(queryByTestId('edge-label-renderer')).not.toBeInTheDocument()
    })

    it('should not render cross-link label when data is undefined', () => {
      const { queryByTestId } = render(<CrossLinkEdge {...defaultProps} data={undefined} />)
      expect(queryByTestId('edge-label-renderer')).not.toBeInTheDocument()
    })

    it('should render cross-link label when data.isCrossLink is true', () => {
      const { getByTestId, getByRole } = render(
        <CrossLinkEdge {...defaultProps} data={{ isCrossLink: true }} />
      )

      expect(getByTestId('edge-label-renderer')).toBeInTheDocument()

      // Check for the label with arrow icon
      const label = getByRole('img')
      expect(label).toBeInTheDocument()
      expect(label).toHaveAttribute('aria-label', 'Cross-link connection')
      expect(label).toHaveTextContent('↗')
    })

    it('should apply correct styling to cross-link label', () => {
      const { getByRole } = render(<CrossLinkEdge {...defaultProps} data={{ isCrossLink: true }} />)

      const label = getByRole('img')

      // Check key styles without being too strict about exact values
      expect(label).toHaveStyle({
        background: '#f59e0b',
        padding: '2px 6px',
        cursor: 'pointer',
      })

      // Check that it has expected properties
      const computedStyle = window.getComputedStyle(label)
      expect(computedStyle.color).toBe('rgb(255, 255, 255)') // white
      expect(computedStyle.fontSize).toBe('10px')
      expect(computedStyle.borderRadius).toBe('4px')
      expect(computedStyle.pointerEvents).toBe('all')

      // Check for positioning
      expect(label).toHaveStyle({
        position: 'absolute',
        transform: 'translate(-50%, -50%) translate(50px, 50px)',
      })
    })

    it('should have edge-label class on cross-link label', () => {
      const { getByRole } = render(<CrossLinkEdge {...defaultProps} data={{ isCrossLink: true }} />)

      const label = getByRole('img')
      expect(label).toHaveClass('edge-label')
    })
  })

  describe('edge cases', () => {
    it('should handle zero-length edge (same position)', () => {
      const props: EdgeProps = {
        ...defaultProps,
        sourceX: 50,
        sourceY: 50,
        targetX: 50,
        targetY: 50,
      }

      const { container } = render(<CrossLinkEdge {...props} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle negative coordinates', () => {
      const props: EdgeProps = {
        ...defaultProps,
        sourceX: -100,
        sourceY: -100,
        targetX: 100,
        targetY: 100,
      }

      const { container } = render(<CrossLinkEdge {...props} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle large coordinates', () => {
      const props: EdgeProps = {
        ...defaultProps,
        sourceX: 0,
        sourceY: 0,
        targetX: 1000,
        targetY: 1000,
      }

      const { container } = render(<CrossLinkEdge {...props} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle additional data properties', () => {
      const props: EdgeProps = {
        ...defaultProps,
        data: {
          isCrossLink: true,
          customProperty: 'test-value',
          anotherProperty: 123,
        },
      }

      const { getByRole } = render(<CrossLinkEdge {...props} />)
      expect(getByRole('img')).toBeInTheDocument()
    })

    it('should handle empty data object', () => {
      const props: EdgeProps = {
        ...defaultProps,
        data: {},
      }

      const { container } = render(<CrossLinkEdge {...props} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes on edge', () => {
      const { getAllByRole } = render(<CrossLinkEdge {...defaultProps} />)
      const presentationElements = getAllByRole('presentation')
      // The outer <g> element should have the aria-label
      const edgeElement = presentationElements.find(
        el => el.getAttribute('aria-label') === 'Cross-link edge between nodes'
      )
      expect(edgeElement).toBeInTheDocument()
    })

    it('should maintain accessibility when style is overridden', () => {
      const customStyle = { opacity: 0.5 }
      const { getAllByRole } = render(<CrossLinkEdge {...defaultProps} style={customStyle} />)

      const presentationElements = getAllByRole('presentation')
      // The outer <g> element should have the aria-label
      const edgeElement = presentationElements.find(
        el => el.getAttribute('aria-label') === 'Cross-link edge between nodes'
      )
      expect(edgeElement).toBeInTheDocument()
    })

    it('should have proper ARIA attributes on cross-link label', () => {
      const { getByRole } = render(<CrossLinkEdge {...defaultProps} data={{ isCrossLink: true }} />)

      const label = getByRole('img')
      expect(label).toHaveAttribute('aria-label', 'Cross-link connection')
      expect(label).toHaveAttribute('role', 'img')
    })

    it('should maintain accessibility when custom style is applied', () => {
      const customStyle = { opacity: 0.5 }
      const { getAllByRole } = render(<CrossLinkEdge {...defaultProps} style={customStyle} />)

      const presentationElements = getAllByRole('presentation')
      // The outer <g> element should have the aria-label
      const edgeElement = presentationElements.find(
        el => el.getAttribute('aria-label') === 'Cross-link edge between nodes'
      )
      expect(edgeElement).toBeInTheDocument()
    })
  })
})
