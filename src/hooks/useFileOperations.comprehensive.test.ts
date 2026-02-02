import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFileOperations } from './useFileOperations'
import type { Node, Edge } from 'reactflow'
import type { MindMapNodeData } from '../types'

// Mock external dependencies
vi.mock('../utils/formats', () => ({
  stringifyJSON: vi.fn(() => '{"test": "json"}'),
  parseJSON: vi.fn(() => ({ root: { id: '1', content: 'Test' } })),
  parseFreeMind: vi.fn(() => ({ root: { id: '1', content: 'Test' } })),
  toFreeMind: vi.fn(() => '<map><node TEXT="Test"/></map>'),
  parseOPML: vi.fn(() => ({ root: { id: '1', content: 'Test' } })),
  toOPML: vi.fn(() => '<opml><body><outline text="Test"/></body></opml>'),
  parseMarkdown: vi.fn(() => ({ root: { id: '1', content: 'Test' } })),
  toMarkdown: vi.fn(() => '# Test'),
  toD2: vi.fn(() => 'Test -> Test2'),
  toYaml: vi.fn(() => 'root:\n  id: "1"'),
  parseYaml: vi.fn(() => ({ root: { id: '1', content: 'Test' } })),
  toSVG: vi.fn(() => '<svg><text>Test</text></svg>'),
}))

vi.mock('../utils/enhancedExports', () => ({
  exportToPDF: vi.fn(),
  exportToPowerPoint: vi.fn(),
  createPresentation: vi.fn(),
}))

vi.mock('../utils/errorTracking', () => ({
  trackError: vi.fn(),
}))

vi.mock('../utils/fileDownload', () => ({
  downloadFile: vi.fn(),
}))

vi.mock('../utils/mindmapConverter', () => ({
  flowToTree: vi.fn(() => ({ root: { id: '1', content: 'Test', children: [] } })),
  treeToFlow: vi.fn(() => ({
    nodes: [{ id: '1', data: { label: 'Test' }, position: { x: 0, y: 0 } }],
    edges: [],
  })),
}))

describe('useFileOperations - comprehensive', () => {
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

  describe('saveToFile', () => {
    it('should call downloadFile with correct parameters for JSON format', async () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.saveToFile('json')
      })

      const { flowToTree } = await import('../utils/mindmapConverter')
      const { stringifyJSON } = await import('../utils/formats')
      const { downloadFile } = await import('../utils/fileDownload')

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(stringifyJSON).toHaveBeenCalled()
      expect(downloadFile).toHaveBeenCalledWith('{"test": "json"}', 'mindmap.json', {
        mimeType: 'application/json',
      })
    })

    it('should call downloadFile with correct parameters for FreeMind format', async () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.saveToFile('freemind')
      })

      const { flowToTree } = await import('../utils/mindmapConverter')
      const { toFreeMind } = await import('../utils/formats')
      const { downloadFile } = await import('../utils/fileDownload')

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(toFreeMind).toHaveBeenCalled()
      expect(downloadFile).toHaveBeenCalledWith('<map><node TEXT="Test"/></map>', 'mindmap.mm', {
        mimeType: 'application/xml',
      })
    })

    it('should call downloadFile with correct parameters for OPML format', async () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.saveToFile('opml')
      })

      const { flowToTree } = await import('../utils/mindmapConverter')
      const { toOPML } = await import('../utils/formats')
      const { downloadFile } = await import('../utils/fileDownload')

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(toOPML).toHaveBeenCalled()
      expect(downloadFile).toHaveBeenCalledWith(
        '<opml><body><outline text="Test"/></body></opml>',
        'mindmap.opml',
        { mimeType: 'application/xml' }
      )
    })

    it('should call downloadFile with correct parameters for Markdown format', async () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.saveToFile('markdown')
      })

      const { flowToTree } = await import('../utils/mindmapConverter')
      const { toMarkdown } = await import('../utils/formats')
      const { downloadFile } = await import('../utils/fileDownload')

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(toMarkdown).toHaveBeenCalled()
      expect(downloadFile).toHaveBeenCalledWith('# Test', 'mindmap.md', {
        mimeType: 'text/markdown',
      })
    })

    it('should call downloadFile with correct parameters for D2 format', async () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.saveToFile('d2')
      })

      const { flowToTree } = await import('../utils/mindmapConverter')
      const { toD2 } = await import('../utils/formats')
      const { downloadFile } = await import('../utils/fileDownload')

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(toD2).toHaveBeenCalled()
      expect(downloadFile).toHaveBeenCalledWith('Test -> Test2', 'mindmap.d2', {
        mimeType: 'text/plain',
      })
    })

    it('should call downloadFile with correct parameters for YAML format', async () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.saveToFile('yaml')
      })

      const { flowToTree } = await import('../utils/mindmapConverter')
      const { toYaml } = await import('../utils/formats')
      const { downloadFile } = await import('../utils/fileDownload')

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(toYaml).toHaveBeenCalled()
      expect(downloadFile).toHaveBeenCalledWith('root:\n  id: "1"', 'mindmap.yaml', {
        mimeType: 'text/yaml',
      })
    })

    it('should call downloadFile with correct parameters for SVG format', async () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.saveToFile('svg')
      })

      const { flowToTree } = await import('../utils/mindmapConverter')
      const { toSVG } = await import('../utils/formats')
      const { downloadFile } = await import('../utils/fileDownload')

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(toSVG).toHaveBeenCalled()
      expect(downloadFile).toHaveBeenCalledWith('<svg><text>Test</text></svg>', 'mindmap.svg', {
        mimeType: 'image/svg+xml',
      })
    })

    it('should call exportToPDF for PDF format', async () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.saveToFile('pdf')
      })

      const { flowToTree } = await import('../utils/mindmapConverter')
      const { exportToPDF } = await import('../utils/enhancedExports')

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(exportToPDF).toHaveBeenCalled()
    })

    it('should call exportToPowerPoint for PowerPoint format', async () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.saveToFile('powerpoint')
      })

      const { flowToTree } = await import('../utils/mindmapConverter')
      const { exportToPowerPoint } = await import('../utils/enhancedExports')

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(exportToPowerPoint).toHaveBeenCalled()
    })

    it('should call createPresentation for presentation format', async () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.saveToFile('presentation')
      })

      const { flowToTree } = await import('../utils/mindmapConverter')
      const { createPresentation } = await import('../utils/enhancedExports')

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(createPresentation).toHaveBeenCalled()
    })

    it('should return early when flowToTree returns null', async () => {
      const { flowToTree } = await import('../utils/mindmapConverter')
      const { stringifyJSON } = await import('../utils/formats')
      const { downloadFile } = await import('../utils/fileDownload')

      vi.mocked(flowToTree).mockReturnValueOnce(null)

      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.saveToFile('json')
      })

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(stringifyJSON).not.toHaveBeenCalled()
      expect(downloadFile).not.toHaveBeenCalled()
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
        act(() => {
          result.current.saveToFile('json')
        })
      }).not.toThrow()
    })
  })

  describe('exportAsSVG', () => {
    it('should call toSVG and downloadFile', async () => {
      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.exportAsSVG()
      })

      const { flowToTree } = await import('../utils/mindmapConverter')
      const { toSVG } = await import('../utils/formats')
      const { downloadFile } = await import('../utils/fileDownload')

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(toSVG).toHaveBeenCalled()
      expect(downloadFile).toHaveBeenCalledWith('<svg><text>Test</text></svg>', 'mindmap.svg', {
        mimeType: 'image/svg+xml',
      })
    })

    it('should return early when flowToTree returns null', async () => {
      const { flowToTree } = await import('../utils/mindmapConverter')
      const { toSVG } = await import('../utils/formats')
      const { downloadFile } = await import('../utils/fileDownload')

      vi.mocked(flowToTree).mockReturnValueOnce(null)

      const { result } = renderHook(() =>
        useFileOperations({
          nodes: mockNodes,
          edges: mockEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          fitView: mockFitView,
        })
      )

      act(() => {
        result.current.exportAsSVG()
      })

      expect(flowToTree).toHaveBeenCalledWith(mockNodes, mockEdges)
      expect(toSVG).not.toHaveBeenCalled()
      expect(downloadFile).not.toHaveBeenCalled()
    })
  })

  describe('memoization', () => {
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
      const initialLoad = result.current.loadFromFile
      const initialExportPNG = result.current.exportAsPNG
      const initialExportSVG = result.current.exportAsSVG

      // Re-render with same props
      rerender({ nodes: mockNodes, edges: mockEdges })

      expect(result.current.saveToFile).toBe(initialSave)
      expect(result.current.loadFromFile).toBe(initialLoad)
      expect(result.current.exportAsPNG).toBe(initialExportPNG)
      expect(result.current.exportAsSVG).toBe(initialExportSVG)

      // Re-render with different props
      const newNodes = [
        ...mockNodes,
        { id: '3', data: { label: 'Node 3' }, position: { x: 200, y: 200 } },
      ]
      rerender({ nodes: newNodes, edges: mockEdges })

      expect(result.current.saveToFile).not.toBe(initialSave)
      expect(result.current.loadFromFile).toBe(initialLoad) // loadFromFile doesn't depend on nodes/edges
      expect(result.current.exportAsPNG).toBe(initialExportPNG) // exportAsPNG doesn't depend on nodes/edges
      expect(result.current.exportAsSVG).not.toBe(initialExportSVG) // exportAsSVG depends on nodes/edges
    })
  })
})
