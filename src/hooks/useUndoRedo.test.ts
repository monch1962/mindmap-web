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

  it('should jump to history point in past', () => {
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

    // Jump to first history item (index 0)
    let state: unknown
    hookAct(() => {
      state = result.current.jumpToHistory(0, true)
    })
    expect(state).not.toBeNull()
    expect((state as { nodes: Array<{ id: string }> })?.nodes[0].id).toBe('1')
    // After jumping to index 0, only states before index 0 remain in past (none)
    // States from index 1 onward move to future
    expect(result.current.past).toHaveLength(0)
    expect(result.current.future).toHaveLength(2) // States 2 and 3 moved to future

    // Jump to invalid index should return null
    hookAct(() => {
      state = result.current.jumpToHistory(5, true)
    })
    expect(state).toBeNull()
  })

  it('should jump to history point in future', () => {
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

    // Undo twice to move states to future
    hookAct(() => {
      result.current.undo()
      result.current.undo()
    })

    expect(result.current.past).toHaveLength(1)
    expect(result.current.future).toHaveLength(2)

    // Jump to future item (index 1, which is the second future state)
    let state: unknown
    hookAct(() => {
      state = result.current.jumpToHistory(1, false)
    })
    expect(state).not.toBeNull()
    expect((state as { nodes: Array<{ id: string }> })?.nodes[0].id).toBe('3')
    // After jumping to future index 1, states 0 and 1 move to past, state 1 is returned
    expect(result.current.past).toHaveLength(2) // States 1 and 2 now in past
    expect(result.current.future).toHaveLength(0) // Future cleared

    // Jump to invalid future index should return null
    hookAct(() => {
      state = result.current.jumpToHistory(5, false)
    })
    expect(state).toBeNull()
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

  it('should get full history including future states', () => {
    const { result } = renderHook(() => useUndoRedo())

    const nodes1: Node<MindMapNodeData>[] = [
      { id: '1', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'State 1' } },
    ]
    const nodes2: Node<MindMapNodeData>[] = [
      { id: '2', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'State 2' } },
    ]
    const nodes3: Node<MindMapNodeData>[] = [
      { id: '3', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'State 3' } },
    ]

    // Add 3 states
    hookAct(() => {
      result.current.addToHistory(nodes1, [])
      result.current.addToHistory(nodes2, [])
      result.current.addToHistory(nodes3, [])
    })

    // Undo twice to create future states
    hookAct(() => {
      result.current.undo()
      result.current.undo()
    })

    const fullHistory = result.current.getFullHistory()

    // Should have: past (1 item) + current (1) + future (2) = 4 total
    expect(fullHistory).toHaveLength(4)

    // Check structure
    expect(fullHistory[0].nodes[0].id).toBe('1') // Past state
    expect(fullHistory[0].isCurrent).toBe(false)

    expect(fullHistory[1].label).toBe('Current state') // Current state
    expect(fullHistory[1].isCurrent).toBe(true)

    expect(fullHistory[2].nodes[0].id).toBe('3') // Future state (reversed order)
    expect(fullHistory[2].isCurrent).toBe(false)

    expect(fullHistory[3].nodes[0].id).toBe('2') // Future state (reversed order)
    expect(fullHistory[3].isCurrent).toBe(false)
  })

  it('should get empty full history when no states added', () => {
    const { result } = renderHook(() => useUndoRedo())

    const fullHistory = result.current.getFullHistory()

    // When no history has been added, lastState is null
    // So getFullHistory should return empty array
    expect(fullHistory).toHaveLength(0)
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

  describe('action label generation', () => {
    it('should generate "Added child node" label for single child node addition', () => {
      const { result } = renderHook(() => useUndoRedo())

      const parentNode: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Parent' },
      }

      const childNode: Node<MindMapNodeData> = {
        id: '2',
        type: 'mindmap',
        position: { x: 100, y: 100 },
        data: { label: 'Child' },
      }

      const childEdge: Edge = { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' }

      // First state (parent only)
      hookAct(() => {
        result.current.addToHistory([parentNode], [])
      })

      // Second state (parent + child with edge)
      hookAct(() => {
        result.current.addToHistory([parentNode, childNode], [childEdge])
      })

      // Check the label of the second history item
      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Added child node')
    })

    it('should generate "Added sibling node" label for single sibling node addition', () => {
      const { result } = renderHook(() => useUndoRedo())

      const node1: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1' },
      }

      const node2: Node<MindMapNodeData> = {
        id: '2',
        type: 'mindmap',
        position: { x: 100, y: 0 },
        data: { label: 'Node 2' },
      }

      // First state (node1 only)
      hookAct(() => {
        result.current.addToHistory([node1], [])
      })

      // Second state (node1 + node2, no edge means sibling)
      hookAct(() => {
        result.current.addToHistory([node1, node2], [])
      })

      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Added sibling node')
    })

    it('should generate "Added 3 nodes" label for multiple node additions', () => {
      const { result } = renderHook(() => useUndoRedo())

      const node1: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1' },
      }

      const nodes = [
        node1,
        { id: '2', type: 'mindmap', position: { x: 100, y: 0 }, data: { label: 'Node 2' } },
        { id: '3', type: 'mindmap', position: { x: 200, y: 0 }, data: { label: 'Node 3' } },
        { id: '4', type: 'mindmap', position: { x: 300, y: 0 }, data: { label: 'Node 4' } },
      ]

      // First state (node1 only)
      hookAct(() => {
        result.current.addToHistory([node1], [])
      })

      // Second state (all 4 nodes)
      hookAct(() => {
        result.current.addToHistory(nodes, [])
      })

      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Added 3 nodes')
    })

    it('should generate "Deleted node" label for single node deletion', () => {
      const { result } = renderHook(() => useUndoRedo())

      const nodes = [
        { id: '1', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
        { id: '2', type: 'mindmap', position: { x: 100, y: 0 }, data: { label: 'Node 2' } },
      ]

      const node1Only = [
        { id: '1', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
      ]

      // First state (2 nodes)
      hookAct(() => {
        result.current.addToHistory(nodes, [])
      })

      // Second state (1 node - deletion)
      hookAct(() => {
        result.current.addToHistory(node1Only, [])
      })

      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Deleted node')
    })

    it('should generate "Deleted 2 nodes" label for multiple node deletions', () => {
      const { result } = renderHook(() => useUndoRedo())

      const nodes = [
        { id: '1', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
        { id: '2', type: 'mindmap', position: { x: 100, y: 0 }, data: { label: 'Node 2' } },
        { id: '3', type: 'mindmap', position: { x: 200, y: 0 }, data: { label: 'Node 3' } },
        { id: '4', type: 'mindmap', position: { x: 300, y: 0 }, data: { label: 'Node 4' } },
      ]

      const twoNodes = [
        { id: '1', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
        { id: '2', type: 'mindmap', position: { x: 100, y: 0 }, data: { label: 'Node 2' } },
      ]

      // First state (4 nodes)
      hookAct(() => {
        result.current.addToHistory(nodes, [])
      })

      // Second state (2 nodes - deletion of 2)
      hookAct(() => {
        result.current.addToHistory(twoNodes, [])
      })

      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Deleted 2 nodes')
    })

    it('should generate "Added cross-link" label for single edge addition', () => {
      const { result } = renderHook(() => useUndoRedo())

      const nodes = [
        { id: '1', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
        { id: '2', type: 'mindmap', position: { x: 100, y: 0 }, data: { label: 'Node 2' } },
      ]

      const edge: Edge = { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' }

      // First state (nodes only, no edges)
      hookAct(() => {
        result.current.addToHistory(nodes, [])
      })

      // Second state (nodes with edge)
      hookAct(() => {
        result.current.addToHistory(nodes, [edge])
      })

      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Added cross-link')
    })

    it('should generate "Added 3 links" label for multiple edge additions', () => {
      const { result } = renderHook(() => useUndoRedo())

      const nodes = [
        { id: '1', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
        { id: '2', type: 'mindmap', position: { x: 100, y: 0 }, data: { label: 'Node 2' } },
        { id: '3', type: 'mindmap', position: { x: 0, y: 100 }, data: { label: 'Node 3' } },
      ]

      const edges = [
        { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
        { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
        { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
      ]

      // First state (nodes only, no edges)
      hookAct(() => {
        result.current.addToHistory(nodes, [])
      })

      // Second state (nodes with 3 edges)
      hookAct(() => {
        result.current.addToHistory(nodes, edges)
      })

      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Added 3 links')
    })

    it('should generate "Removed link" label for edge deletion', () => {
      const { result } = renderHook(() => useUndoRedo())

      const nodes = [
        { id: '1', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
        { id: '2', type: 'mindmap', position: { x: 100, y: 0 }, data: { label: 'Node 2' } },
      ]

      const edge: Edge = { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' }

      // First state (nodes with edge)
      hookAct(() => {
        result.current.addToHistory(nodes, [edge])
      })

      // Second state (nodes without edge)
      hookAct(() => {
        result.current.addToHistory(nodes, [])
      })

      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Removed link')
    })

    it('should generate edited text label for text changes', () => {
      const { result } = renderHook(() => useUndoRedo())

      const originalNode: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Original text' },
      }

      const modifiedNode: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Modified text' },
      }

      // First state (original text)
      hookAct(() => {
        result.current.addToHistory([originalNode], [])
      })

      // Second state (modified text)
      hookAct(() => {
        result.current.addToHistory([modifiedNode], [])
      })

      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Edited text: "Modified text"')
    })

    it('should truncate long edited text in label', () => {
      const { result } = renderHook(() => useUndoRedo())

      const longText =
        'This is a very long text that should be truncated when displayed in the history label'
      const originalNode: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Short text' },
      }

      const modifiedNode: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: longText },
      }

      // First state (original text)
      hookAct(() => {
        result.current.addToHistory([originalNode], [])
      })

      // Second state (long text)
      hookAct(() => {
        result.current.addToHistory([modifiedNode], [])
      })

      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Edited text: "This is a very long ..."')
    })

    it('should generate "Updated metadata" label for metadata changes', () => {
      const { result } = renderHook(() => useUndoRedo())

      const originalNode: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Node', metadata: { tags: ['old'] } },
      }

      const modifiedNode: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Node', metadata: { tags: ['new'] } },
      }

      // First state (original metadata)
      hookAct(() => {
        result.current.addToHistory([originalNode], [])
      })

      // Second state (modified metadata)
      hookAct(() => {
        result.current.addToHistory([modifiedNode], [])
      })

      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Updated metadata')
    })

    it('should generate "Changed icon" label for icon changes', () => {
      const { result } = renderHook(() => useUndoRedo())

      const originalNode: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Node', icon: 'star' },
      }

      const modifiedNode: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Node', icon: 'heart' },
      }

      // First state (original icon)
      hookAct(() => {
        result.current.addToHistory([originalNode], [])
      })

      // Second state (modified icon)
      hookAct(() => {
        result.current.addToHistory([modifiedNode], [])
      })

      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Changed icon')
    })

    it('should generate "Changed cloud" label for cloud changes', () => {
      const { result } = renderHook(() => useUndoRedo())

      const originalNode: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Node', cloud: { color: '#0000ff' } },
      }

      const modifiedNode: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Node', cloud: { color: '#ff0000' } },
      }

      // First state (original cloud)
      hookAct(() => {
        result.current.addToHistory([originalNode], [])
      })

      // Second state (modified cloud)
      hookAct(() => {
        result.current.addToHistory([modifiedNode], [])
      })

      expect(result.current.past).toHaveLength(2)
      expect(result.current.past[1].label).toBe('Changed cloud')
    })

    it('should generate "Action" as default label when no specific change detected', () => {
      const { result } = renderHook(() => useUndoRedo())

      const node: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Node' },
      }

      // First state (no previous state to compare)
      hookAct(() => {
        result.current.addToHistory([node], [])
      })

      expect(result.current.past).toHaveLength(1)
      expect(result.current.past[0].label).toBe('Action')
    })

    it('should handle edge case when newNodes array is empty in getActionLabel', () => {
      const { result } = renderHook(() => useUndoRedo())

      // Create a scenario where node count appears to increase but newNodes array is empty
      // This could happen with duplicate IDs (which shouldn't happen but we test it)
      const node1: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1' },
      }

      // Second state with duplicate ID (bug scenario)
      const nodesWithDuplicate = [
        { id: '1', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
        {
          id: '1',
          type: 'mindmap',
          position: { x: 100, y: 0 },
          data: { label: 'Node 1 duplicate' },
        }, // Same ID!
      ]

      // First state
      hookAct(() => {
        result.current.addToHistory([node1], [])
      })

      // Second state - has duplicate ID, so count increases but filter finds no "new" nodes
      hookAct(() => {
        result.current.addToHistory(nodesWithDuplicate, [])
      })

      expect(result.current.past).toHaveLength(2)
      // With duplicate IDs, newNodes filter returns empty array, so it should return "Added 1 nodes"
      expect(result.current.past[1].label).toBe('Added 1 nodes')
    })

    it('should handle edge case when nodes are completely replaced', () => {
      const { result } = renderHook(() => useUndoRedo())

      const node1: Node<MindMapNodeData> = {
        id: '1',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1' },
      }

      const node2: Node<MindMapNodeData> = {
        id: '2',
        type: 'mindmap',
        position: { x: 100, y: 0 },
        data: { label: 'Node 2' },
      }

      // First state (node1)
      hookAct(() => {
        result.current.addToHistory([node1], [])
      })

      // Second state (completely different node2)
      hookAct(() => {
        result.current.addToHistory([node2], [])
      })

      expect(result.current.past).toHaveLength(2)
      // When node1 is replaced by node2 (different ID, same count),
      // it's not detected as an addition since node count is the same
      // It falls through to default "Action" label
      expect(result.current.past[1].label).toBe('Action')
    })
  })
})
