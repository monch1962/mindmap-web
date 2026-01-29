import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act as hookAct } from '@testing-library/react'
import { useUndoRedo } from './useUndoRedo'
import type { Node, Edge } from 'reactflow'
import type { MindMapNodeData } from '../types'

describe('useUndoRedo', () => {
  const mockNodes: Node<MindMapNodeData>[] = [
    {
      id: 'root',
      type: 'mindmap',
      position: { x: 0, y: 0 },
      data: { label: 'Root' },
    },
  ]

  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with initial state', () => {
    const { result } = renderHook(() => useUndoRedo())

    expect(result.current.past).toHaveLength(0)
    expect(result.current.future).toHaveLength(0)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('should add state to past when addToHistory is called', () => {
    const { result } = renderHook(() => useUndoRedo())

    hookAct(() => {
      result.current.addToHistory(mockNodes, [])
    })

    expect(result.current.past).toHaveLength(1)
    expect(result.current.past[0]).toMatchObject({
      nodes: mockNodes,
      edges: [],
    })
  })

  it('should support undo', () => {
    const { result } = renderHook(() => useUndoRedo())

    const newNodes: Node<MindMapNodeData>[] = [
      {
        id: 'root',
        type: 'mindmap',
        position: { x: 100, y: 100 },
        data: { label: 'Modified Root' },
      },
    ]

    hookAct(() => {
      result.current.addToHistory(mockNodes, [])
      result.current.addToHistory(newNodes, [])
    })

    expect(result.current.canUndo).toBe(true)
    expect(result.current.past).toHaveLength(2)

    hookAct(() => {
      result.current.undo()
    })

    // After undo, one item remains in past, one moved to future
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(true)
    expect(result.current.past).toHaveLength(1)
    expect(result.current.future).toHaveLength(1)
  })

  it('should support redo', () => {
    const { result } = renderHook(() => useUndoRedo())

    const newNodes: Node<MindMapNodeData>[] = [
      {
        id: 'root',
        type: 'mindmap',
        position: { x: 100, y: 100 },
        data: { label: 'Modified Root' },
      },
    ]

    hookAct(() => {
      result.current.addToHistory(mockNodes, [])
      result.current.addToHistory(newNodes, [])
    })

    hookAct(() => {
      result.current.undo()
    })

    expect(result.current.canRedo).toBe(true)

    hookAct(() => {
      result.current.redo()
    })

    expect(result.current.canRedo).toBe(false)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.past).toHaveLength(2)
  })

  it('should not undo when past is empty', () => {
    const { result } = renderHook(() => useUndoRedo())

    const state = result.current.undo()
    expect(state).toBeNull()
  })

  it('should not redo when future is empty', () => {
    const { result } = renderHook(() => useUndoRedo())

    const state = result.current.redo()
    expect(state).toBeNull()
  })

  it('should limit history size to 50', () => {
    const { result } = renderHook(() => useUndoRedo())

    // Add 60 states
    hookAct(() => {
      for (let i = 0; i < 60; i++) {
        const nodes: Node<MindMapNodeData>[] = [
          {
            id: `root-${i}`,
            type: 'mindmap',
            position: { x: i, y: i },
            data: { label: `State ${i}` },
          },
        ]
        result.current.addToHistory(nodes, [])
      }
    })

    // Should be limited to 50
    expect(result.current.past).toHaveLength(50)
  })

  it('should clear future when new state is added', () => {
    const { result } = renderHook(() => useUndoRedo())

    const newNodes1: Node<MindMapNodeData>[] = [
      {
        id: 'root',
        type: 'mindmap',
        position: { x: 100, y: 100 },
        data: { label: 'State 1' },
      },
    ]

    const newNodes2: Node<MindMapNodeData>[] = [
      {
        id: 'root',
        type: 'mindmap',
        position: { x: 200, y: 200 },
        data: { label: 'State 2' },
      },
    ]

    hookAct(() => {
      result.current.addToHistory(newNodes1, [])
      result.current.undo()
    })

    // Future should have 1 item
    expect(result.current.future).toHaveLength(1)
    expect(result.current.canRedo).toBe(true)

    // Add new state should clear future
    hookAct(() => {
      result.current.addToHistory(newNodes2, [])
    })

    expect(result.current.future).toHaveLength(0)
    expect(result.current.canRedo).toBe(false)
  })

  it('should jump to history point', () => {
    const { result } = renderHook(() => useUndoRedo())

    const nodes1: Node<MindMapNodeData>[] = [
      { id: '1', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: '1' } },
    ]
    const nodes2: Node<MindMapNodeData>[] = [
      { id: '2', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: '2' } },
    ]
    const nodes3: Node<MindMapNodeData>[] = [
      { id: '3', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: '3' } },
    ]

    hookAct(() => {
      result.current.addToHistory(nodes1, [])
      result.current.addToHistory(nodes2, [])
      result.current.addToHistory(nodes3, [])
    })

    expect(result.current.past).toHaveLength(3)

    // Jump to first history item
    let state: unknown
    hookAct(() => {
      state = result.current.jumpToHistory(0, true)
    })
    expect(state).not.toBeNull()
    expect((state as { nodes: Array<{ id: string }> })?.nodes[0].id).toBe('1')
  })

  it('should get full history', () => {
    const { result } = renderHook(() => useUndoRedo())

    hookAct(() => {
      result.current.addToHistory(mockNodes, [])
    })

    const fullHistory = result.current.getFullHistory()
    expect(fullHistory.length).toBeGreaterThan(0)
    expect(fullHistory[0].isCurrent).toBe(false)
  })

  it('should clear history', () => {
    const { result } = renderHook(() => useUndoRedo())

    hookAct(() => {
      result.current.addToHistory(mockNodes, [])
    })

    expect(result.current.past).toHaveLength(1)

    hookAct(() => {
      result.current.clearHistory()
    })

    expect(result.current.past).toHaveLength(0)
    expect(result.current.future).toHaveLength(0)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('should track edges in history', () => {
    const { result } = renderHook(() => useUndoRedo())

    const mockEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2', type: 'smoothstep' }]

    hookAct(() => {
      result.current.addToHistory(mockNodes, mockEdges)
    })

    expect(result.current.past[0].edges).toEqual(mockEdges)
  })
})
