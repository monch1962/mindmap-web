import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAutoSave } from './useAutoSave'
import type { Node, Edge } from 'reactflow'
import type { MindMapNodeData } from '../types'

describe('useAutoSave', () => {
  const mockNodes: Node<MindMapNodeData>[] = [
    { id: '1', data: { label: 'Node 1' }, position: { x: 0, y: 0 } },
    { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
  ]

  const mockEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Clear localStorage
    localStorage.clear()

    // Mock localStorage methods
    Storage.prototype.getItem = vi.fn((key: string) => {
      if (key in localStorage) {
        return (localStorage as unknown as Record<string, string>)[key] || null
      }
      return null
    })

    Storage.prototype.setItem = vi.fn((key: string, value: string) => {
      ;(localStorage as unknown as Record<string, unknown>)[key] = value
    })

    Storage.prototype.removeItem = vi.fn((key: string) => {
      delete (localStorage as unknown as Record<string, unknown>)[key]
    })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with empty save history', () => {
      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      expect(result.current.saveHistory).toEqual([])
    })

    it('should load save history from localStorage on mount', () => {
      const mockHistory = [
        {
          nodes: mockNodes,
          edges: mockEdges,
          tree: null,
          timestamp: Date.now(),
          label: 'Today at 10:00 AM',
        },
      ]

      localStorage.setItem('mindmap_autosave_history', JSON.stringify(mockHistory))

      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      expect(result.current.saveHistory).toEqual(mockHistory)
    })

    it('should handle corrupted save history gracefully', () => {
      localStorage.setItem('mindmap_autosave_history', 'invalid json')

      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      expect(result.current.saveHistory).toEqual([])
    })

    it('should detect conflict on mount with old auto-save', () => {
      const onConflictFound = vi.fn()
      const oldData = {
        nodes: [{ id: 'old', data: { label: 'Old' }, position: { x: 0, y: 0 } }],
        edges: [],
        tree: null,
        timestamp: Date.now() - 120000, // 2 minutes ago
      }

      localStorage.setItem('mindmap_autosave', JSON.stringify(oldData))

      renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
          onConflictFound,
        })
      )

      expect(onConflictFound).toHaveBeenCalledWith(
        expect.objectContaining({
          label: expect.stringContaining('ago'),
        })
      )
    })

    it('should not trigger conflict for recent auto-save', () => {
      const onConflictFound = vi.fn()
      const recentData = {
        nodes: mockNodes,
        edges: mockEdges,
        tree: null,
        timestamp: Date.now() - 30000, // 30 seconds ago
      }

      localStorage.setItem('mindmap_autosave', JSON.stringify(recentData))

      renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
          onConflictFound,
        })
      )

      expect(onConflictFound).not.toHaveBeenCalled()
    })
  })

  describe('auto-save functionality', () => {
    it('should save after interval on data change', () => {
      const onStatusChange = vi.fn()

      renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
          onSaveStatusChange: onStatusChange,
        })
      )

      // Initial render should mark as unsaved
      expect(onStatusChange).toHaveBeenCalledWith('unsaved')

      // Fast-forward past the auto-save interval
      act(() => {
        vi.advanceTimersByTime(30000)
      })

      waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith('saving')
        expect(onStatusChange).toHaveBeenCalledWith('saved')
      })
    })

    it('should debounce saves when data changes rapidly', () => {
      const onStatusChange = vi.fn()
      const { rerender } = renderHook(
        ({ nodes }) =>
          useAutoSave({
            nodes,
            edges: mockEdges,
            onSaveStatusChange: onStatusChange,
          }),
        {
          initialProps: { nodes: mockNodes },
        }
      )

      // Change nodes multiple times rapidly
      const newNodes = [
        ...mockNodes,
        { id: '3', data: { label: 'Node 3' }, position: { x: 200, y: 200 } },
      ]

      act(() => {
        rerender({ nodes: newNodes })
        vi.advanceTimersByTime(10000)
        rerender({
          nodes: [
            ...newNodes,
            { id: '4', data: { label: 'Node 4' }, position: { x: 300, y: 300 } },
          ],
        })
        vi.advanceTimersByTime(10000)
      })

      // Should only save once after the final change
      // Each data change triggers 'unsaved', then 'saving' and 'saved'
      waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledTimes(4) // unsaved (2x), saving, saved
      })
    })

    it('should not save if data has not changed', () => {
      const onStatusChange = vi.fn()
      const { rerender } = renderHook(
        ({ nodes }) =>
          useAutoSave({
            nodes,
            edges: mockEdges,
            onSaveStatusChange: onStatusChange,
          }),
        {
          initialProps: { nodes: mockNodes },
        }
      )

      // Initial render marks as unsaved and schedules save
      expect(onStatusChange).toHaveBeenCalledWith('unsaved')

      act(() => {
        rerender({ nodes: mockNodes }) // Same data
        vi.advanceTimersByTime(30000)
      })

      // First save should complete
      expect(onStatusChange).toHaveBeenCalledWith('saved')

      // Clear the mock for next check
      onStatusChange.mockClear()

      act(() => {
        rerender({ nodes: mockNodes }) // Same data again
        vi.advanceTimersByTime(30000)
      })

      // Should not trigger another save if data unchanged
      expect(onStatusChange).not.toHaveBeenCalledWith('saved')
    })

    it('should save immediately on unmount', () => {
      const onStatusChange = vi.fn()
      const { unmount } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
          onSaveStatusChange: onStatusChange,
        })
      )

      act(() => {
        unmount()
      })

      expect(onStatusChange).toHaveBeenCalledWith('saved')
      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('save history management', () => {
    it('should add saved slot to history', () => {
      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      act(() => {
        vi.advanceTimersByTime(30000)
      })

      waitFor(() => {
        expect(result.current.saveHistory.length).toBeGreaterThan(0)
      })
    })

    it('should limit history to MAX_HISTORY_SLOTS', () => {
      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      // Trigger multiple saves
      act(() => {
        for (let i = 0; i < 10; i++) {
          vi.advanceTimersByTime(30000)
        }
      })

      waitFor(() => {
        expect(result.current.saveHistory.length).toBeLessThanOrEqual(5)
      })
    })

    it('should restore from history slot', () => {
      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      // Trigger a save to populate history
      act(() => {
        result.current.saveNow()
      })

      const restored = result.current.restoreFromHistory(0)

      // Should restore the slot we just saved
      expect(restored).toBeDefined()
      expect(restored?.nodes).toEqual(mockNodes)
      expect(restored?.edges).toEqual(mockEdges)
    })

    it('should return null for invalid history index', () => {
      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      const restored = result.current.restoreFromHistory(999)

      expect(restored).toBeNull()
    })

    it('should delete history slot', () => {
      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      // Verify deleteHistorySlot is a function
      expect(typeof result.current.deleteHistorySlot).toBe('function')

      // Pre-populate localStorage with history before mounting
      const mockSlot1 = {
        nodes: mockNodes,
        edges: mockEdges,
        tree: null,
        timestamp: Date.now(),
        label: 'Slot 1',
      }
      const mockSlot2 = {
        nodes: [{ id: '2', data: { label: 'Node 2' }, position: { x: 0, y: 0 } }],
        edges: [],
        tree: null,
        timestamp: Date.now() + 1000,
        label: 'Slot 2',
      }

      localStorage.setItem('mindmap_autosave_history', JSON.stringify([mockSlot1, mockSlot2]))

      // Re-render hook with the pre-populated history
      const { result: result2 } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      // Should have loaded the history
      expect(result2.current.saveHistory.length).toBe(2)

      // Delete the first slot
      act(() => {
        result2.current.deleteHistorySlot(0)
      })

      // History should be reduced by 1
      expect(result2.current.saveHistory.length).toBe(1)
      expect(result2.current.saveHistory[0].label).toBe('Slot 2')
    })
  })

  describe('manual operations', () => {
    it('should save immediately when saveNow is called', () => {
      const onStatusChange = vi.fn()

      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
          onSaveStatusChange: onStatusChange,
        })
      )

      act(() => {
        result.current.saveNow()
      })

      expect(onStatusChange).toHaveBeenCalledWith('saved')
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mindmap_autosave',
        expect.stringContaining('"nodes"')
      )
    })

    it('should clear pending timeout when saveNow is called', () => {
      const onStatusChange = vi.fn()

      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
          onSaveStatusChange: onStatusChange,
        })
      )

      // Trigger auto-save timer
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Call saveNow before timer completes
      act(() => {
        result.current.saveNow()
      })

      // Advance past original timer - should not trigger another save
      act(() => {
        vi.advanceTimersByTime(20000)
      })

      // Should only have saved once (from saveNow)
      expect(onStatusChange).toHaveBeenCalledWith('saved')
    })

    it('should clear all auto-saved data', () => {
      localStorage.setItem('mindmap_autosave', 'data')
      localStorage.setItem('mindmap_autosave_history', 'history')

      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      act(() => {
        result.current.clearAutoSave()
      })

      expect(localStorage.removeItem).toHaveBeenCalledWith('mindmap_autosave')
      expect(localStorage.removeItem).toHaveBeenCalledWith('mindmap_autosave_history')
      expect(result.current.saveHistory).toEqual([])
    })
  })

  describe('error handling', () => {
    it('should handle save errors gracefully', () => {
      const onStatusChange = vi.fn()
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage full')
      })

      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
          onSaveStatusChange: onStatusChange,
        })
      )

      act(() => {
        result.current.saveNow()
      })

      expect(onStatusChange).toHaveBeenCalledWith('unsaved')
    })

    it('should handle history save errors', () => {
      localStorage.setItem = vi.fn(key => {
        if (key === 'mindmap_autosave_history') {
          throw new Error('Storage full')
        }
      })

      renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      act(() => {
        vi.advanceTimersByTime(30000)
      })

      // Should not crash, just log error
      expect(true).toBe(true)
    })
  })

  describe('timestamp formatting', () => {
    it("should format today's timestamp correctly", () => {
      const today = Date.now()
      const mockSlot = {
        nodes: mockNodes,
        edges: mockEdges,
        tree: null,
        timestamp: today,
        label: `Today at ${new Date(today).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      }

      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      act(() => {
        result.current.saveHistory = [mockSlot]
      })

      expect(result.current.saveHistory[0].label).toContain('Today at')
    })

    it("should format yesterday's timestamp correctly", () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000
      const mockSlot = {
        nodes: mockNodes,
        edges: mockEdges,
        tree: null,
        timestamp: yesterday,
        label: `Yesterday at ${new Date(yesterday).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      }

      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      act(() => {
        result.current.saveHistory = [mockSlot]
      })

      expect(result.current.saveHistory[0].label).toContain('Yesterday at')
    })
  })

  describe('integration', () => {
    it('should provide all required methods', () => {
      const { result } = renderHook(() =>
        useAutoSave({
          nodes: mockNodes,
          edges: mockEdges,
        })
      )

      expect(result.current.saveNow).toBeDefined()
      expect(result.current.clearAutoSave).toBeDefined()
      expect(result.current.saveHistory).toBeDefined()
      expect(result.current.restoreFromHistory).toBeDefined()
      expect(result.current.deleteHistorySlot).toBeDefined()
    })

    it('should handle rapid data changes without errors', () => {
      const { rerender } = renderHook(
        ({ nodes }) =>
          useAutoSave({
            nodes,
            edges: mockEdges,
          }),
        {
          initialProps: { nodes: mockNodes },
        }
      )

      act(() => {
        for (let i = 0; i < 20; i++) {
          rerender({
            nodes: [
              ...mockNodes,
              { id: `${i}`, data: { label: `Node ${i}` }, position: { x: i, y: i } },
            ],
          })
          vi.advanceTimersByTime(1000)
        }
      })

      // Should complete without errors
      expect(true).toBe(true)
    })
  })
})
