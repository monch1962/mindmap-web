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

    it('should handle default case in switch statement', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      // This tests the default case in the switch statement
      // We can't directly test it, but we can verify the function doesn't crash
      expect(() => {
        // @ts-expect-error - Testing invalid format to trigger default case
        result.current.saveToFile('invalid-format')
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

    it('should handle file input creation', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      // Mock document.createElement to verify it's called
      const mockInput = {
        type: '',
        accept: '',
        click: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as HTMLInputElement
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockInput)

      result.current.loadFromFile('json')

      expect(createElementSpy).toHaveBeenCalledWith('input')
      expect(mockInput.type).toBe('file')
      expect(mockInput.accept).toBe('.json')
      expect(mockInput.click).toHaveBeenCalled()

      createElementSpy.mockRestore()
    })

    it('should set correct accept attribute for each format', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      const formatTests = [
        { format: 'json' as const, expectedAccept: '.json' },
        { format: 'freemind' as const, expectedAccept: '.mm' },
        { format: 'opml' as const, expectedAccept: '.opml' },
        { format: 'yaml' as const, expectedAccept: '.yaml,.yml' },
        { format: 'markdown' as const, expectedAccept: '.md' },
      ]

      formatTests.forEach(({ format, expectedAccept }) => {
        const mockInput = {
          type: 'file',
          accept: '',
          click: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        } as unknown as HTMLInputElement
        const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockInput)

        result.current.loadFromFile(format)

        expect(mockInput.accept).toBe(expectedAccept)

        createElementSpy.mockRestore()
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

    it('should handle missing canvas context', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      // Mock canvas.getContext to return null
      const mockCanvas = {
        width: 1920,
        height: 1080,
        getContext: vi.fn().mockReturnValue(null),
        toDataURL: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as HTMLCanvasElement
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas)

      result.current.exportAsPNG()

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')

      createElementSpy.mockRestore()
    })

    it('should handle missing SVG element', () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      // Mock canvas context
      const mockCtx = {
        fillStyle: '',
        fillRect: vi.fn(),
        drawImage: vi.fn(),
      }
      const mockCanvas = {
        width: 1920,
        height: 1080,
        getContext: vi.fn().mockReturnValue(mockCtx),
        toDataURL: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as HTMLCanvasElement

      // Mock querySelector to return null
      const querySelectorSpy = vi.spyOn(document, 'querySelector').mockReturnValue(null)
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas)

      result.current.exportAsPNG()

      expect(querySelectorSpy).toHaveBeenCalledWith('.react-flow__viewport')
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1920, 1080)

      querySelectorSpy.mockRestore()
      createElementSpy.mockRestore()
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
