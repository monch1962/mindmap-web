import { useEffect } from 'react'
import type { KeyboardShortcutCallbacks, KeyboardShortcutState } from '../types'

/**
 * Custom hook to handle keyboard shortcuts for the mind map application
 * Provides cross-platform keyboard shortcuts (Ctrl/Cmd) for all major operations
 */
export function useKeyboardShortcuts(
  state: KeyboardShortcutState,
  callbacks: KeyboardShortcutCallbacks
) {
  const {
    selectedNodeId,
    selectedNodeIds,
    nodes,
    edges,
    showNotesPanel,
    showSearch,
    showSaveHistory,
    showHistoryPanel,
    showStatistics,
    showShortcuts,
    showAIAssistant,
    showCommentsPanel,
    showWebhookPanel,
    showCalendarPanel,
    showEmailPanel,
    showPresentation,
    show3DView,
    showTemplatesPanel,
    showThemeSettings,
    showBulkOperations,
    crossLinkMode,
    searchResults,
    currentResultIndex,
    canUndo,
    canRedo,
  } = state

  const {
    zoomIn,
    zoomOut,
    fitView,
    setShowNotesPanel,
    setShowSearch,
    setShowSaveHistory,
    setShowHistoryPanel,
    setShowStatistics,
    setShowShortcuts,
    setShowAIAssistant,
    setShowCommentsPanel,
    setShowWebhookPanel,
    setShowCalendarPanel,
    setShowEmailPanel,
    setShowPresentation,
    setShow3DView,
    setShowTemplatesPanel,
    setShowThemeSettings,
    setCrossLinkMode,
    setCrossLinkSource,
    createChildNode,
    createSiblingNode,
    deleteNode,
    editNode,
    toggleCollapse,
    handleUndo,
    handleRedo,
    handleNextResult,
    handlePreviousResult,
    handleClearSelection,
    handleBulkDelete,
    handleSelectAll,
    saveNow,
    toggleDarkMode,
    setCurrentTheme,
    getEffectiveTheme,
  } = callbacks

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not editing text
      if (document.activeElement?.classList.contains('node-content')) {
        return
      }

      // Tab - Create child node
      if (event.key === 'Tab' && selectedNodeId) {
        event.preventDefault()
        createChildNode(selectedNodeId)
      }

      // Enter - Create sibling node
      if (event.key === 'Enter' && selectedNodeId) {
        event.preventDefault()
        createSiblingNode(selectedNodeId)
      }

      // Delete/Backspace - Delete node
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        event.preventDefault()
        deleteNode(selectedNodeId)
      }

      // E - Edit node content (accessible on all platforms)
      if (event.key === 'e' && selectedNodeId) {
        // Only trigger if no modifier keys are pressed (to avoid conflict with Ctrl+E browser shortcuts)
        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault()
          editNode(selectedNodeId)
        }
      }

      // Space - Toggle collapse
      if (event.key === ' ' && selectedNodeId) {
        event.preventDefault()
        toggleCollapse(selectedNodeId)
      }

      // Ctrl + or = - Zoom in
      if (event.key === '=' || event.key === '+') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          zoomIn()
        }
      }

      // Ctrl - or _ - Zoom out
      if (event.key === '-' || event.key === '_') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          zoomOut()
        }
      }

      // Ctrl 0 - Fit view
      if (event.key === '0') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          fitView()
        }
      }

      // Ctrl N - Toggle notes panel
      if (event.key === 'n' || event.key === 'N') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          if (selectedNodeId) {
            setShowNotesPanel(!showNotesPanel)
          }
        }
      }

      // Ctrl Z - Undo
      if (event.key === 'z' || event.key === 'Z') {
        if (event.ctrlKey || event.metaKey) {
          if (event.shiftKey) {
            // Ctrl Shift Z - Redo
            event.preventDefault()
            handleRedo()
          } else {
            // Ctrl Z - Undo
            event.preventDefault()
            handleUndo()
          }
        }
      }

      // Ctrl Y - Redo
      if (event.key === 'y' || event.key === 'Y') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          handleRedo()
        }
      }

      // Ctrl F - Open search
      if (event.key === 'f' || event.key === 'F') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          setShowSearch(true)
        }
      }

      // Ctrl G - Next search result (standard "find next" shortcut)
      if (event.key === 'g' || event.key === 'G') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          if (event.shiftKey) {
            handlePreviousResult()
          } else {
            handleNextResult()
          }
        }
      }

      // Escape - Close panels
      if (event.key === 'Escape') {
        if (showSearch) {
          setShowSearch(false)
        }
        if (showNotesPanel) {
          setShowNotesPanel(false)
        }
        if (showSaveHistory) {
          setShowSaveHistory(false)
        }
        if (showHistoryPanel) {
          setShowHistoryPanel(false)
        }
        if (showStatistics) {
          setShowStatistics(false)
        }
        if (showShortcuts) {
          setShowShortcuts(false)
        }
        if (showAIAssistant) {
          setShowAIAssistant(false)
        }
        if (showCommentsPanel) {
          setShowCommentsPanel(false)
        }
        if (showWebhookPanel) {
          setShowWebhookPanel(false)
        }
        if (showCalendarPanel) {
          setShowCalendarPanel(false)
        }
        if (showEmailPanel) {
          setShowEmailPanel(false)
        }
        if (showPresentation) {
          setShowPresentation(false)
        }
        if (show3DView) {
          setShow3DView(false)
        }
        if (showTemplatesPanel) {
          setShowTemplatesPanel(false)
        }
        if (showThemeSettings) {
          setShowThemeSettings(false)
        }
        if (crossLinkMode) {
          setCrossLinkMode(false)
          setCrossLinkSource(null)
        }
        if (showBulkOperations || selectedNodeIds.size > 0) {
          handleClearSelection()
        }
      }

      // ? - Show keyboard shortcuts
      if (event.key === '?') {
        event.preventDefault()
        setShowShortcuts(!showShortcuts)
      }

      // Ctrl S - Manual save
      if (event.key === 's' || event.key === 'S') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          saveNow()
        }
      }

      // Ctrl H - Show save history
      if (event.key === 'h' || event.key === 'H') {
        if (event.ctrlKey || event.metaKey) {
          if (event.shiftKey) {
            // Ctrl Shift H - Show undo/redo history
            event.preventDefault()
            setShowHistoryPanel(!showHistoryPanel)
          } else {
            // Ctrl H - Show save history
            event.preventDefault()
            setShowSaveHistory(!showSaveHistory)
          }
        }
      }

      // Ctrl I - Show statistics
      if (event.key === 'i' || event.key === 'I') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          setShowStatistics(!showStatistics)
        }
      }

      // Ctrl Shift A - Open AI Assistant
      if (event.key === 'a' || event.key === 'A') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault()
          setShowAIAssistant(!showAIAssistant)
        }
      }

      // Ctrl Shift C - Toggle Comments Panel
      if (event.key === 'c' || event.key === 'C') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault()
          setShowCommentsPanel(!showCommentsPanel)
        }
      }

      // Ctrl Shift W - Toggle Webhook Integration
      if (event.key === 'w' || event.key === 'W') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault()
          setShowWebhookPanel(!showWebhookPanel)
        }
      }

      // Ctrl Shift D - Toggle Calendar Export (D for Date/Calendar)
      if (event.key === 'd' || event.key === 'D') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault()
          setShowCalendarPanel(!showCalendarPanel)
        }
      }

      // Ctrl Shift E - Toggle Email Integration
      if (event.key === 'e' || event.key === 'E') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault()
          setShowEmailPanel(!showEmailPanel)
        }
      }

      // Ctrl Shift P - Toggle Presentation Mode
      if (event.key === 'p' || event.key === 'P') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault()
          setShowPresentation(!showPresentation)
        }
      }

      // Ctrl Shift 3 - Toggle 3D View
      if (event.key === '3') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault()
          setShow3DView(!show3DView)
        }
      }

      // Ctrl Shift T - Toggle Templates Panel
      if (event.key === 't' || event.key === 'T') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault()
          setShowTemplatesPanel(!showTemplatesPanel)
        }
      }

      // Ctrl Shift ; - Toggle Theme Settings (using ; to avoid conflicts)
      if (event.key === ';') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault()
          setShowThemeSettings(!showThemeSettings)
        }
      }

      // Ctrl Shift D - Toggle dark mode (conflict with calendar, using different key)
      // NOTE: This conflicts with Ctrl Shift D for calendar, using Ctrl Shift L instead
      if (event.key === 'l' || event.key === 'L') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault()
          toggleDarkMode()
          setCurrentTheme(getEffectiveTheme())
        }
      }

      // Ctrl A - Select all nodes
      if (event.key === 'a' || event.key === 'A') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          handleSelectAll()
        }
      }

      // Delete/Backspace - Bulk delete if multiple selected
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeIds.size > 1) {
        event.preventDefault()
        handleBulkDelete()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedNodeId,
    selectedNodeIds,
    nodes,
    edges,
    zoomIn,
    zoomOut,
    fitView,
    showNotesPanel,
    showSearch,
    showSaveHistory,
    showHistoryPanel,
    showStatistics,
    showShortcuts,
    showAIAssistant,
    showCommentsPanel,
    showWebhookPanel,
    showCalendarPanel,
    showEmailPanel,
    showPresentation,
    show3DView,
    showTemplatesPanel,
    showThemeSettings,
    showBulkOperations,
    crossLinkMode,
    searchResults,
    currentResultIndex,
    canUndo,
    canRedo,
    createChildNode,
    createSiblingNode,
    deleteNode,
    editNode,
    toggleCollapse,
    handleUndo,
    handleRedo,
    handleNextResult,
    handlePreviousResult,
    handleClearSelection,
    handleBulkDelete,
    handleSelectAll,
    saveNow,
    toggleDarkMode,
    setCurrentTheme,
    getEffectiveTheme,
  ])
}
