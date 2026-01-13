import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFileOperations } from './useFileOperations'
import type { Node, Edge } from 'reactflow'
import type { MindMapNodeData } from '../types'

describe('useFileOperations', () => {
  const mockNodes: Node<MindMapNodeData>[] = [
    { id: '1', data: { label: 'Node 1' }, position: { x: 0, y: 0 } },
    { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
  ]

  const mockEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }]

  const mockSetNodes = vi.fn()
  const mockSetEdges = vi.fn()
  const mockFitView = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should provide all required methods', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      expect(result.current.saveToFile).toBeDefined()
      expect(result.current.loadFromFile).toBeDefined()
      expect(result.current.exportAsPNG).toBeDefined()
      expect(result.current.exportAsSVG).toBeDefined()
    })

    it('should memoize callbacks based on dependencies', () => {
      const { result, rerender } = renderHook(
        ({ nodes, edges }) =>
          useFileOperations({
            nodes,
            edges,
            setNodes: mockSetNodes,
            setEdges: mockSetEdges,
            fitView: mockFitView,
          }),
        {
          initialProps: {
            nodes: mockNodes,
            edges: mockEdges,
          },
        }
      )

      const initialSave = result.current.saveToFile

      rerender({ nodes: mockNodes, edges: mockEdges })

      expect(result.current.saveToFile).toBe(initialSave)
    })
  })

  describe('saveToFile', () => {
    it('should not crash when saving to JSON', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      expect(() => {
        result.current.saveToFile('json')
      }).not.toThrow()
    })

    it('should support all export formats', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      const formats: Array<
        | 'json'
        | 'freemind'
        | 'opml'
        | 'markdown'
        | 'd2'
        | 'yaml'
        | 'pdf'
        | 'powerpoint'
        | 'presentation'
      > = [
        'json',
        'freemind',
        'opml',
        'markdown',
        'd2',
        'yaml',
        'pdf',
        'powerpoint',
        'presentation',
      ]

      formats.forEach(format => {
        expect(() => {
          result.current.saveToFile(format)
        }).not.toThrow()
      })
    })

    it('should handle empty nodes gracefully', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: [],
          edges: [],
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      expect(() => {
        result.current.saveToFile('json')
      }).not.toThrow()
    })
  })

  describe('loadFromFile', () => {
    it('should trigger file input for all formats', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      const formats: Array<'json' | 'freemind' | 'opml' | 'markdown' | 'yaml'> = [
        'json',
        'freemind',
        'opml',
        'markdown',
        'yaml',
      ]

      formats.forEach(format => {
        expect(() => {
          result.current.loadFromFile(format)
        }).not.toThrow()
      })
    })
  })

  describe('exportAsPNG', () => {
    it('should not crash when exporting to PNG', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      expect(() => {
        result.current.exportAsPNG()
      }).not.toThrow()
    })
  })

  describe('exportAsSVG', () => {
    it('should not crash when exporting to SVG', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      expect(() => {
        result.current.exportAsSVG()
      }).not.toThrow()
    })
  })

  describe('integration', () => {
    it('should handle all operations without errors', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      // Test all operations
      expect(() => {
        result.current.saveToFile('json')
        result.current.loadFromFile('json')
        result.current.exportAsPNG()
        result.current.exportAsSVG()
      }).not.toThrow()
    })

    it('should work with various node configurations', () => {
      const complexNodes: Node<MindMapNodeData>[] = [
        { id: '1', data: { label: 'Root' }, position: { x: 0, y: 0 } },
        { id: '2', data: { label: 'Child 1' }, position: { x: 100, y: 100 } },
        { id: '3', data: { label: 'Child 2' }, position: { x: 100, y: 200 } },
        { id: '4', data: { label: 'Grandchild' }, position: { x: 200, y: 150 } },
      ]

      const complexEdges: Edge[] = [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e1-3', source: '1', target: '3' },
        { id: 'e2-4', source: '2', target: '4' },
      ]

      const { result } = renderHook(() =>
        useFileOperations({
          nodes: complexNodes,
          edges: complexEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      expect(() => {
        result.current.saveToFile('json')
      }).not.toThrow()
    })
  })
})
