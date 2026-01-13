import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  const mockCallbacks = {
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    fitView: vi.fn(),
    setShowNotesPanel: vi.fn(),
    setShowSearch: vi.fn(),
    setShowSaveHistory: vi.fn(),
    setShowHistoryPanel: vi.fn(),
    setShowStatistics: vi.fn(),
    setShowShortcuts: vi.fn(),
    setShowAIAssistant: vi.fn(),
    setShowCommentsPanel: vi.fn(),
    setShowWebhookPanel: vi.fn(),
    setShowCalendarPanel: vi.fn(),
    setShowEmailPanel: vi.fn(),
    setShowPresentation: vi.fn(),
    setShow3DView: vi.fn(),
    setShowTemplatesPanel: vi.fn(),
    setShowThemeSettings: vi.fn(),
    setCrossLinkMode: vi.fn(),
    setCrossLinkSource: vi.fn(),
    createChildNode: vi.fn(),
    createSiblingNode: vi.fn(),
    deleteNode: vi.fn(),
    editNode: vi.fn(),
    toggleCollapse: vi.fn(),
    handleUndo: vi.fn(),
    handleRedo: vi.fn(),
    handleNextResult: vi.fn(),
    handlePreviousResult: vi.fn(),
    handleClearSelection: vi.fn(),
    handleBulkDelete: vi.fn(),
    handleSelectAll: vi.fn(),
    saveNow: vi.fn(),
    toggleDarkMode: vi.fn(),
    setCurrentTheme: vi.fn(),
    getEffectiveTheme: vi.fn(() => 'light'),
  }

  const mockState = {
    selectedNodeId: 'node-1',
    selectedNodeIds: new Set(['node-1']),
    nodes: [],
    edges: [],
    showNotesPanel: false,
    showSearch: false,
    showSaveHistory: false,
    showHistoryPanel: false,
    showStatistics: false,
    showShortcuts: false,
    showAIAssistant: false,
    showCommentsPanel: false,
    showWebhookPanel: false,
    showCalendarPanel: false,
    showEmailPanel: false,
    showPresentation: false,
    show3DView: false,
    showTemplatesPanel: false,
    showThemeSettings: false,
    showBulkOperations: false,
    crossLinkMode: false,
    searchResults: [],
    currentResultIndex: 0,
    canUndo: true,
    canRedo: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock document.activeElement
    Object.defineProperty(document, 'activeElement', {
      value: { classList: { contains: vi.fn(() => false) } },
      writable: true,
    })
  })

  describe('node editing shortcuts', () => {
    it('should create child node on Tab', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'Tab' })
      document.dispatchEvent(event)

      expect(mockCallbacks.createChildNode).toHaveBeenCalledWith('node-1')
    })

    it('should create sibling node on Enter', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      document.dispatchEvent(event)

      expect(mockCallbacks.createSiblingNode).toHaveBeenCalledWith('node-1')
    })

    it('should delete node on Delete', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'Delete' })
      document.dispatchEvent(event)

      expect(mockCallbacks.deleteNode).toHaveBeenCalledWith('node-1')
    })

    it('should delete node on Backspace', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'Backspace' })
      document.dispatchEvent(event)

      expect(mockCallbacks.deleteNode).toHaveBeenCalledWith('node-1')
    })

    it('should edit node on E key', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'e' })
      document.dispatchEvent(event)

      expect(mockCallbacks.editNode).toHaveBeenCalledWith('node-1')
    })

    it('should toggle collapse on Space', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: ' ' })
      document.dispatchEvent(event)

      expect(mockCallbacks.toggleCollapse).toHaveBeenCalledWith('node-1')
    })

    it('should not trigger shortcuts when editing text', () => {
      const activeElement = document.activeElement as HTMLElement
      activeElement.classList.contains = vi.fn(className => className === 'node-content')

      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'Tab' })
      document.dispatchEvent(event)

      expect(mockCallbacks.createChildNode).not.toHaveBeenCalled()
    })
  })

  describe('zoom shortcuts', () => {
    it('should zoom in on Ctrl +', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: '+', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.zoomIn).toHaveBeenCalled()
    })

    it('should zoom in on Ctrl =', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: '=', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.zoomIn).toHaveBeenCalled()
    })

    it('should zoom out on Ctrl -', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: '-', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.zoomOut).toHaveBeenCalled()
    })

    it('should zoom out on Ctrl _', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: '_', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.zoomOut).toHaveBeenCalled()
    })

    it('should fit view on Ctrl 0', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: '0', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.fitView).toHaveBeenCalled()
    })

    it('should support Cmd key on Mac', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: '+', metaKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.zoomIn).toHaveBeenCalled()
    })
  })

  describe('panel toggle shortcuts', () => {
    it('should toggle notes panel on Ctrl N', () => {
      const state = { ...mockState, showNotesPanel: false }
      renderHook(() => useKeyboardShortcuts(state, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowNotesPanel).toHaveBeenCalledWith(true)
    })

    it('should open search on Ctrl F', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowSearch).toHaveBeenCalledWith(true)
    })

    it('should show statistics on Ctrl I', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'i', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowStatistics).toHaveBeenCalledWith(true)
    })

    it('should show shortcuts on ?', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: '?' })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowShortcuts).toHaveBeenCalledWith(true)
    })

    it('should show save history on Ctrl H', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'h', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowSaveHistory).toHaveBeenCalledWith(true)
    })

    it('should show history panel on Ctrl Shift H', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'h', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowHistoryPanel).toHaveBeenCalledWith(true)
    })
  })

  describe('undo/redo shortcuts', () => {
    it('should undo on Ctrl Z', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.handleUndo).toHaveBeenCalled()
    })

    it('should redo on Ctrl Shift Z', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.handleRedo).toHaveBeenCalled()
    })

    it('should redo on Ctrl Y', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'y', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.handleRedo).toHaveBeenCalled()
    })
  })

  describe('save shortcuts', () => {
    it('should save now on Ctrl S', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.saveNow).toHaveBeenCalled()
    })
  })

  describe('feature panel shortcuts', () => {
    it('should toggle AI assistant on Ctrl Shift A', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowAIAssistant).toHaveBeenCalledWith(true)
    })

    it('should toggle comments panel on Ctrl Shift C', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowCommentsPanel).toHaveBeenCalledWith(true)
    })

    it('should toggle webhook panel on Ctrl Shift W', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'w', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowWebhookPanel).toHaveBeenCalledWith(true)
    })

    it('should toggle calendar panel on Ctrl Shift D', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'd', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowCalendarPanel).toHaveBeenCalledWith(true)
    })

    it('should toggle email panel on Ctrl Shift E', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'e', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowEmailPanel).toHaveBeenCalledWith(true)
    })

    it('should toggle presentation on Ctrl Shift P', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'p', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowPresentation).toHaveBeenCalledWith(true)
    })

    it('should toggle 3D view on Ctrl Shift 3', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: '3', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShow3DView).toHaveBeenCalledWith(true)
    })

    it('should toggle templates panel on Ctrl Shift T', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 't', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowTemplatesPanel).toHaveBeenCalledWith(true)
    })

    it('should toggle theme settings on Ctrl Shift ;', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: ';', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowThemeSettings).toHaveBeenCalledWith(true)
    })
  })

  describe('theme shortcuts', () => {
    it('should toggle dark mode on Ctrl Shift L', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'l', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.toggleDarkMode).toHaveBeenCalled()
      expect(mockCallbacks.setCurrentTheme).toHaveBeenCalled()
    })
  })

  describe('search navigation shortcuts', () => {
    it('should go to next result on Ctrl G', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'g', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.handleNextResult).toHaveBeenCalled()
    })

    it('should go to previous result on Ctrl Shift G', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'g', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.handlePreviousResult).toHaveBeenCalled()
    })
  })

  describe('escape key shortcuts', () => {
    it('should close search panel on Escape', () => {
      const state = { ...mockState, showSearch: true }
      renderHook(() => useKeyboardShortcuts(state, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowSearch).toHaveBeenCalledWith(false)
    })

    it('should close notes panel on Escape', () => {
      const state = { ...mockState, showNotesPanel: true }
      renderHook(() => useKeyboardShortcuts(state, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowNotesPanel).toHaveBeenCalledWith(false)
    })

    it('should close all panels on Escape', () => {
      const state = {
        ...mockState,
        showSearch: true,
        showNotesPanel: true,
        showStatistics: true,
        showShortcuts: true,
      }
      renderHook(() => useKeyboardShortcuts(state, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(mockCallbacks.setShowSearch).toHaveBeenCalledWith(false)
      expect(mockCallbacks.setShowNotesPanel).toHaveBeenCalledWith(false)
      expect(mockCallbacks.setShowStatistics).toHaveBeenCalledWith(false)
      expect(mockCallbacks.setShowShortcuts).toHaveBeenCalledWith(false)
    })

    it('should exit cross link mode on Escape', () => {
      const state = { ...mockState, crossLinkMode: true }
      renderHook(() => useKeyboardShortcuts(state, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(mockCallbacks.setCrossLinkMode).toHaveBeenCalledWith(false)
      expect(mockCallbacks.setCrossLinkSource).toHaveBeenCalledWith(null)
    })

    it('should clear selection on Escape when bulk operations active', () => {
      const state = { ...mockState, showBulkOperations: true }
      renderHook(() => useKeyboardShortcuts(state, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(mockCallbacks.handleClearSelection).toHaveBeenCalled()
    })
  })

  describe('bulk operations shortcuts', () => {
    it('should select all nodes on Ctrl A', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockCallbacks.handleSelectAll).toHaveBeenCalled()
    })

    it('should bulk delete on Delete when multiple nodes selected', () => {
      const state = { ...mockState, selectedNodeIds: new Set(['node-1', 'node-2', 'node-3']) }
      renderHook(() => useKeyboardShortcuts(state, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'Delete' })
      document.dispatchEvent(event)

      expect(mockCallbacks.handleBulkDelete).toHaveBeenCalled()
    })

    it('should bulk delete on Backspace when multiple nodes selected', () => {
      const state = { ...mockState, selectedNodeIds: new Set(['node-1', 'node-2', 'node-3']) }
      renderHook(() => useKeyboardShortcuts(state, mockCallbacks))

      const event = new KeyboardEvent('keydown', { key: 'Backspace' })
      document.dispatchEvent(event)

      expect(mockCallbacks.handleBulkDelete).toHaveBeenCalled()
    })
  })

  describe('event listener setup', () => {
    it('should add event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { unmount } = renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('integration', () => {
    it('should handle all shortcuts without errors', () => {
      renderHook(() => useKeyboardShortcuts(mockState, mockCallbacks))

      const shortcuts = [
        { key: 'Tab' },
        { key: 'Enter' },
        { key: 'Delete' },
        { key: ' ' },
        { key: '+', ctrlKey: true },
        { key: '-', ctrlKey: true },
        { key: '0', ctrlKey: true },
        { key: 'n', ctrlKey: true },
        { key: 'z', ctrlKey: true },
        { key: 'y', ctrlKey: true },
        { key: 'f', ctrlKey: true },
        { key: 's', ctrlKey: true },
        { key: '?' },
        { key: 'Escape' },
      ]

      shortcuts.forEach(shortcut => {
        const event = new KeyboardEvent('keydown', shortcut)
        document.dispatchEvent(event)
      })

      // Should complete without errors
      expect(true).toBe(true)
    })
  })
})
