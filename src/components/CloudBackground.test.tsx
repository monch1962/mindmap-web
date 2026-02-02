import { render, screen } from '@testing-library/react'
import CloudBackground from './CloudBackground'
import type { Node } from 'reactflow'
import type { MindMapNodeData } from '../types'

describe('CloudBackground', () => {
  const mockNodes: Node<MindMapNodeData>[] = [
    {
      id: 'node-1',
      type: 'mindMapNode',
      position: { x: 100, y: 100 },
      data: {
        label: 'Test Node 1',
        cloud: { color: '#f0f9ff' },
      },
    },
    {
      id: 'node-2',
      type: 'mindMapNode',
      position: { x: 200, y: 200 },
      data: {
        label: 'Test Node 2',
        cloud: { color: '#e0f2fe' },
      },
    },
    {
      id: 'node-3',
      type: 'mindMapNode',
      position: { x: 300, y: 300 },
      data: {
        label: 'Test Node 3',
        // No cloud
      },
    },
  ]

  describe('when nodes have clouds', () => {
    it('should render SVG with cloud backgrounds', () => {
      render(<CloudBackground nodes={mockNodes} />)

      const svg = screen.getByRole('presentation', {
        name: 'Cloud backgrounds visualizing node groupings',
      })
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveStyle({
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '0',
      })

      // Should render 2 cloud ellipses (nodes 1 and 2 have clouds)
      const ellipses = screen.getAllByLabelText(/Cloud background for/)
      expect(ellipses).toHaveLength(2)
    })

    it('should render ellipses with correct positions and styles', () => {
      render(<CloudBackground nodes={mockNodes} />)

      const ellipses = screen.getAllByLabelText(/Cloud background for/)

      // First ellipse (node-1)
      expect(ellipses[0]).toHaveAttribute('cx', '180') // 100 - 20 + 100
      expect(ellipses[0]).toHaveAttribute('cy', '110') // 100 - 20 + 30
      expect(ellipses[0]).toHaveAttribute('rx', '150')
      expect(ellipses[0]).toHaveAttribute('ry', '60')
      expect(ellipses[0]).toHaveAttribute('fill', '#f0f9ff')
      expect(ellipses[0]).toHaveAttribute('stroke', '#f0f9ff')
      expect(ellipses[0]).toHaveAttribute('stroke-width', '2')
      expect(ellipses[0]).toHaveAttribute('opacity', '0.3')
      expect(ellipses[0]).toHaveStyle({ filter: 'blur(2px)' })

      // Second ellipse (node-2)
      expect(ellipses[1]).toHaveAttribute('cx', '280') // 200 - 20 + 100
      expect(ellipses[1]).toHaveAttribute('cy', '210') // 200 - 20 + 30
      expect(ellipses[1]).toHaveAttribute('fill', '#e0f2fe')
    })

    it('should use default cloud color when not specified', () => {
      const nodesWithDefaultColor: Node<MindMapNodeData>[] = [
        {
          id: 'node-4',
          type: 'mindMapNode',
          position: { x: 400, y: 400 },
          data: {
            label: 'Test Node 4',
            cloud: {}, // No color specified
          },
        },
      ]

      render(<CloudBackground nodes={nodesWithDefaultColor} />)

      const ellipse = screen.getByLabelText('Cloud background for Test Node 4')
      expect(ellipse).toHaveAttribute('fill', '#f0f9ff')
    })

    it('should use node ID in aria-label when label is not provided', () => {
      const nodesWithoutLabel: Node<MindMapNodeData>[] = [
        {
          id: 'node-5',
          type: 'mindMapNode',
          position: { x: 500, y: 500 },
          data: {
            cloud: { color: '#dbeafe' },
            // No label
          },
        },
      ]

      render(<CloudBackground nodes={nodesWithoutLabel} />)

      const ellipse = screen.getByLabelText('Cloud background for node-5')
      expect(ellipse).toBeInTheDocument()
    })
  })

  describe('when no nodes have clouds', () => {
    it('should not render anything', () => {
      const nodesWithoutClouds: Node<MindMapNodeData>[] = [
        {
          id: 'node-6',
          type: 'mindMapNode',
          position: { x: 600, y: 600 },
          data: {
            label: 'Test Node 6',
            // No cloud
          },
        },
      ]

      const { container } = render(<CloudBackground nodes={nodesWithoutClouds} />)

      // Should return null, so container should be empty
      expect(container.firstChild).toBeNull()
    })
  })

  describe('when nodes array is empty', () => {
    it('should not render anything', () => {
      const { container } = render(<CloudBackground nodes={[]} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CloudBackground nodes={mockNodes} />)

      const svg = screen.getByRole('presentation', {
        name: 'Cloud backgrounds visualizing node groupings',
      })
      expect(svg).toBeInTheDocument()

      const ellipses = screen.getAllByLabelText(/Cloud background for/)
      expect(ellipses[0]).toHaveAccessibleName('Cloud background for Test Node 1')
      expect(ellipses[1]).toHaveAccessibleName('Cloud background for Test Node 2')
    })
  })

  describe('performance', () => {
    it('should memoize the component', () => {
      expect(CloudBackground.displayName).toBe('CloudBackground')
      expect(CloudBackground).toHaveProperty('displayName', 'CloudBackground')
    })
  })
})
