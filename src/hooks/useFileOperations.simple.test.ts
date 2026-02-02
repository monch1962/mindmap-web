import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
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

describe('useFileOperations - simple', () => {
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
})
