import { lazy, Suspense, useCallback, useEffect, useState, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
  useReactFlow,
} from 'reactflow'
import type { Connection, OnConnect, Node, Edge } from 'reactflow'
import 'reactflow/dist/style.css'

import MindMapNode from './MindMapNode'
import MetadataPanel from './MetadataPanel'
import NotesPanel from './NotesPanel'
import CloudBackground from './CloudBackground'
import CrossLinkEdge from './CrossLinkEdge'
import SearchPanel, { type SearchOptions } from './SearchPanel'
import SaveHistoryPanel from './SaveHistoryPanel'
import ConflictResolutionModal from './ConflictResolutionModal'
import HistoryPanel from './HistoryPanel'
import StatisticsPanel from './StatisticsPanel'
import KeyboardShortcutsModal from './KeyboardShortcutsModal'
import BulkOperationsPanel from './BulkOperationsPanel'
import MobileToolbar from './MobileToolbar'
import PresenceIndicator from './PresenceIndicator'

// Lazy load heavy feature components
const AIAssistantPanel = lazy(() => import('./AIAssistantPanel'))
const CommentsPanel = lazy(() => import('./CommentsPanel'))
const WebhookIntegrationPanel = lazy(() => import('./WebhookIntegrationPanel'))
const CalendarExportPanel = lazy(() => import('./CalendarExportPanel'))
const EmailIntegrationPanel = lazy(() => import('./EmailIntegrationPanel'))
const PresentationMode = lazy(() => import('./PresentationMode'))
const ThreeDView = lazy(() => import('./ThreeDView'))
const TemplatesPanel = lazy(() => import('./TemplatesPanel'))
const ThemeSettingsPanel = lazy(() => import('./ThemeSettingsPanel'))
import type { MindMapNodeData, MindMapTree, NodeMetadata, User, Comment } from '../types'
import { flowToTree, treeToFlow, generateId } from '../utils/mindmapConverter'
import { useFileOperations } from '../hooks/useFileOperations'
import { parseAITextToMindMap } from '../utils/aiParser'
import { downloadMarkdown } from '../utils/enhancedExports'
import { useAutoSave } from '../hooks/useAutoSave'
import { useUndoRedo } from '../hooks/useUndoRedo'
import { useOfflineSync } from '../hooks/useOfflineSync'
import { useGestureNavigation } from '../hooks/useGestureNavigation'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { initializeTheme, toggleDarkMode, getEffectiveTheme } from '../utils/theme'

const nodeTypes = {
  mindmap: MindMapNode,
}

const edgeTypes = {
  crosslink: CrossLinkEdge,
  default: CrossLinkEdge,
}

interface MindMapCanvasProps {
  initialData?: MindMapTree
}

function MindMapCanvas({ initialData }: MindMapCanvasProps) {
  const { nodes: initialNodes, edges: initialEdges } = initialData
    ? treeToFlow(initialData)
    : { nodes: [], edges: [] }

  const [nodes, setNodes, onNodesChange] = useNodesState<MindMapNodeData>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())
  const [showBulkOperations, setShowBulkOperations] = useState(false)
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [crossLinkMode, setCrossLinkMode] = useState(false)
  const [crossLinkSource, setCrossLinkSource] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved')
  const [showSearch, setShowSearch] = useState(false)
  const [, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [currentResultIndex, setCurrentResultIndex] = useState(0)
  const [showSaveHistory, setShowSaveHistory] = useState(false)
  const [conflictSlot, setConflictSlot] = useState<{
    nodes: Node<MindMapNodeData>[]
    edges: Edge[]
    tree: MindMapTree | null
    timestamp: number
    label: string
  } | null>(null)
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [showStatistics, setShowStatistics] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showCommentsPanel, setShowCommentsPanel] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [showWebhookPanel, setShowWebhookPanel] = useState(false)
  const [showCalendarPanel, setShowCalendarPanel] = useState(false)
  const [showEmailPanel, setShowEmailPanel] = useState(false)
  const [showPresentation, setShowPresentation] = useState(false)
  const [show3DView, setShow3DView] = useState(false)
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false)
  const [showThemeSettings, setShowThemeSettings] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(getEffectiveTheme)
  const [currentUser] = useState(() => {
    const name = localStorage.getItem('user_name') || `User ${Math.floor(Math.random() * 1000)}`
    const color = localStorage.getItem('user_color') || '#3b82f6'
    return { id: Date.now().toString(), name, color }
  })
  const [onlineUsers] = useState<User[]>([currentUser])

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  // Helper functions for collapsing/expanding descendants
  const collapseAllDescendants = useCallback(
    (nodeId: string) => {
      setNodes(nds => {
        // Find all descendant nodes
        const descendantIds = new Set<string>()
        const queue = [nodeId]

        while (queue.length > 0) {
          const currentId = queue.shift()!
          // Find all children (edges where source is currentId)
          const children = edges.filter(e => e.source === currentId)
          children.forEach(edge => {
            descendantIds.add(edge.target)
            queue.push(edge.target)
          })
        }

        // Set collapsed=true for all descendants
        return nds.map(node => {
          if (descendantIds.has(node.id)) {
            return {
              ...node,
              data: {
                ...node.data,
                collapsed: true,
              },
            }
          }
          return node
        })
      })
    },
    [edges, setNodes]
  )

  const expandAllDescendants = useCallback(
    (nodeId: string) => {
      setNodes(nds => {
        // Find all descendant nodes
        const descendantIds = new Set<string>()
        const queue = [nodeId]

        while (queue.length > 0) {
          const currentId = queue.shift()!
          // Find all children (edges where source is currentId)
          const children = edges.filter(e => e.source === currentId)
          children.forEach(edge => {
            descendantIds.add(edge.target)
            queue.push(edge.target)
          })
        }

        // Set collapsed=false for all descendants
        return nds.map(node => {
          if (descendantIds.has(node.id)) {
            return {
              ...node,
              data: {
                ...node.data,
                collapsed: false,
              },
            }
          }
          return node
        })
      })
    },
    [edges, setNodes]
  )

  // Transform nodes to add multi-selection state
  const transformedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      selected: node.id === selectedNodeId || selectedNodeIds.has(node.id),
    }))
  }, [nodes, selectedNodeId, selectedNodeIds])

  // Auto-save hook with history
  const { saveNow, saveHistory, restoreFromHistory, deleteHistorySlot } = useAutoSave({
    nodes,
    edges,
    onSaveStatusChange: setSaveStatus,
    onConflictFound: slot => setConflictSlot(slot),
  })

  // File operations hook
  const { saveToFile, loadFromFile, exportAsPNG, exportAsSVG } = useFileOperations({
    nodes,
    edges,
    setNodes,
    setEdges,
    fitView,
  })

  // Undo/Redo hook
  const { canUndo, canRedo, undo, redo, getFullHistory, jumpToHistory } = useUndoRedo()

  // Offline sync hook - runs for side effects
  useOfflineSync({
    onOnline: () => {
      // Sync data when coming back online
      console.log('Back online - syncing data')
    },
    onOffline: () => {
      // Notify user they're offline
      console.log('Gone offline - changes will be saved locally')
    },
  })

  // Gesture navigation
  useGestureNavigation({
    enabled: true,
  })

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme()
  }, [])

  // Handle node label changes from rich text editor
  useEffect(() => {
    const handleNodeLabelChange = (e: CustomEvent) => {
      const { nodeId, label } = e.detail
      setNodes(nds =>
        nds.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label,
                lastModified: Date.now(),
              },
            }
          }
          return node
        })
      )
    }

    const handleNodeCheckboxChange = (e: CustomEvent) => {
      const { nodeId, checked } = e.detail
      setNodes(nds =>
        nds.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                checked,
                lastModified: Date.now(),
              },
            }
          }
          return node
        })
      )
    }

    const handleCollapseAll = (e: Event) => {
      const customEvent = e as CustomEvent
      collapseAllDescendants(customEvent.detail.nodeId)
    }

    const handleExpandAll = (e: Event) => {
      const customEvent = e as CustomEvent
      expandAllDescendants(customEvent.detail.nodeId)
    }

    window.addEventListener('nodeLabelChange', handleNodeLabelChange as EventListener)
    window.addEventListener('nodeCheckboxChange', handleNodeCheckboxChange as EventListener)
    window.addEventListener('collapseAllDescendants', handleCollapseAll as EventListener)
    window.addEventListener('expandAllDescendants', handleExpandAll as EventListener)
    return () => {
      window.removeEventListener('nodeLabelChange', handleNodeLabelChange as EventListener)
      window.removeEventListener('nodeCheckboxChange', handleNodeCheckboxChange as EventListener)
      window.removeEventListener('collapseAllDescendants', handleCollapseAll as EventListener)
      window.removeEventListener('expandAllDescendants', handleExpandAll as EventListener)
    }
  }, [collapseAllDescendants, expandAllDescendants, setNodes])

  // Node manipulation functions (must be declared before keyboard handler useEffect)
  const createChildNode = useCallback(
    (parentId: string) => {
      const parent = nodes.find(n => n.id === parentId)
      if (!parent) return

      const newNode: Node<MindMapNodeData> = {
        id: generateId(),
        type: 'mindmap',
        position: {
          x: parent.position.x + 250,
          y: parent.position.y + Math.random() * 50,
        },
        data: { label: 'New Node', lastModified: Date.now() },
      }

      setNodes(nds => [...nds, newNode])
      setEdges(eds => [
        ...eds,
        {
          id: `${parentId}-${newNode.id}`,
          source: parentId,
          target: newNode.id,
          type: 'smoothstep',
        },
      ])
      setSelectedNodeId(newNode.id)

      // Trigger edit mode for the new node
      setTimeout(() => {
        const event = new CustomEvent('triggerNodeEdit', {
          detail: { nodeId: newNode.id },
        })
        window.dispatchEvent(event)
      }, 100)
    },
    [nodes, setNodes, setEdges, setSelectedNodeId]
  )

  const createSiblingNode = useCallback(
    (siblingId: string) => {
      const sibling = nodes.find(n => n.id === siblingId)
      if (!sibling) return

      // Find parent edge
      const parentEdge = edges.find(e => e.target === siblingId)
      if (!parentEdge) {
        // Root node - create a new root sibling
        const newNode: Node<MindMapNodeData> = {
          id: generateId(),
          type: 'mindmap',
          position: {
            x: sibling.position.x,
            y: sibling.position.y + 100,
          },
          data: { label: 'New Sibling', lastModified: Date.now() },
        }

        setNodes(nds => [...nds, newNode])
        setSelectedNodeId(newNode.id)

        setTimeout(() => {
          const event = new CustomEvent('triggerNodeEdit', {
            detail: { nodeId: newNode.id },
          })
          window.dispatchEvent(event)
        }, 100)

        return
      }

      const parentId = parentEdge.source
      const newNode: Node<MindMapNodeData> = {
        id: generateId(),
        type: 'mindmap',
        position: {
          x: sibling.position.x,
          y: sibling.position.y + 100,
        },
        data: { label: 'New Sibling', lastModified: Date.now() },
      }

      setNodes(nds => [...nds, newNode])
      setEdges(eds => [
        ...eds,
        {
          id: `${parentId}-${newNode.id}`,
          source: parentId,
          target: newNode.id,
          type: 'smoothstep',
        },
      ])
      setSelectedNodeId(newNode.id)

      setTimeout(() => {
        const event = new CustomEvent('triggerNodeEdit', {
          detail: { nodeId: newNode.id },
        })
        window.dispatchEvent(event)
      }, 100)
    },
    [nodes, edges, setNodes, setEdges, setSelectedNodeId]
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      // Don't delete if it's the only node
      if (nodes.length === 1) return

      // Find all descendants
      const nodesToDelete = new Set<string>([nodeId])
      const queue = [nodeId]

      while (queue.length > 0) {
        const currentId = queue.shift()!
        const children = edges.filter(e => e.source === currentId)
        children.forEach(edge => {
          nodesToDelete.add(edge.target)
          queue.push(edge.target)
        })
      }

      // Remove nodes and edges
      setNodes(nds => nds.filter(n => !nodesToDelete.has(n.id)))
      setEdges(eds => eds.filter(e => !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)))

      // Clear selection if deleted node was selected
      if (selectedNodeId === nodeId || nodesToDelete.has(selectedNodeId || '')) {
        setSelectedNodeId(null)
      }
    },
    [nodes, edges, selectedNodeId, setNodes, setEdges, setSelectedNodeId]
  )

  const editNode = useCallback((nodeId: string) => {
    const nodeElement = document.querySelector(
      `[data-nodeid="${nodeId}"] .node-content`
    ) as HTMLElement
    if (nodeElement) {
      nodeElement.focus()
      // Select all text
      const range = document.createRange()
      range.selectNodeContents(nodeElement)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }, [])

  const toggleCollapse = useCallback(
    (nodeId: string) => {
      setNodes(nds =>
        nds.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                collapsed: !node.data.collapsed,
              },
            }
          }
          return node
        })
      )
    },
    [setNodes]
  )

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setCurrentTheme(getEffectiveTheme())
    }

    // Listen for storage events (theme changes from other tabs)
    window.addEventListener('storage', handleThemeChange)

    // Listen for custom theme change events
    window.addEventListener('themeChange', handleThemeChange)

    return () => {
      window.removeEventListener('storage', handleThemeChange)
      window.removeEventListener('themeChange', handleThemeChange)
    }
  }, [])

  const handleUndo = () => {
    if (!canUndo) return

    const previousState = undo()
    if (previousState) {
      setNodes(previousState.nodes)
      setEdges(previousState.edges)
    }
  }

  const handleRedo = () => {
    if (!canRedo) return

    const nextState = redo()
    if (nextState) {
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
    }
  }

  // Template Handler
  const handleApplyTemplate = (tree: MindMapTree) => {
    const { nodes: newNodes, edges: newEdges } = treeToFlow(tree)
    setNodes(newNodes)
    setEdges(newEdges)
    fitView({ duration: 800 })
  }

  // Search handlers
  const handleSearch = (query: string, options: SearchOptions) => {
    // If no query and no filters, clear results
    if (!query.trim() && !options.filterIcon && !options.filterCloud && !options.filterDate) {
      setSearchResults([])
      setSearchQuery('')
      setCurrentResultIndex(0)
      return
    }

    const now = Date.now()
    const timeLimits = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    }

    const matchingNodeIds = nodes
      .filter(node => {
        // Text search
        if (query.trim()) {
          const label = node.data.label || ''
          const notes = node.data.metadata?.notes || ''
          const searchText = options.searchInNotes ? `${label} ${notes}` : label

          let searchQuery = query
          let searchTarget = searchText

          // Case sensitivity
          if (!options.caseSensitive) {
            searchQuery = searchQuery.toLowerCase()
            searchTarget = searchTarget.toLowerCase()
          }

          // Regex mode
          if (options.useRegex) {
            try {
              const regex = new RegExp(searchQuery, options.caseSensitive ? 'g' : 'gi')
              if (!regex.test(searchTarget)) return false
            } catch {
              // Invalid regex, fall back to regular search
              if (!searchTarget.includes(searchQuery)) return false
            }
          } else if (options.wholeWord) {
            // Whole word mode
            const words = searchTarget.split(/\s+/)
            if (!words.some(word => word === searchQuery)) return false
          } else {
            // Default: contains search
            if (!searchTarget.includes(searchQuery)) return false
          }
        }

        // Icon filter
        if (options.filterIcon && node.data.icon !== options.filterIcon) {
          return false
        }

        // Cloud filter
        if (options.filterCloud && node.data.cloud?.color !== options.filterCloud) {
          return false
        }

        // Date filter - use creation timestamp if available (stored in node data)
        if (options.filterDate) {
          const nodeTime = node.data.lastModified || now
          const timeDiff = now - nodeTime
          if (timeDiff > timeLimits[options.filterDate]) {
            return false
          }
        }

        return true
      })
      .map(node => node.id)

    setSearchResults(matchingNodeIds)
    setSearchQuery(query)
    setCurrentResultIndex(0)

    if (matchingNodeIds.length > 0) {
      setSelectedNodeId(matchingNodeIds[0])
    }
  }

  const handleNextResult = () => {
    if (searchResults.length === 0) return

    const nextIndex = (currentResultIndex + 1) % searchResults.length
    setCurrentResultIndex(nextIndex)
    setSelectedNodeId(searchResults[nextIndex])
  }

  const handlePreviousResult = () => {
    if (searchResults.length === 0) return

    const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length
    setCurrentResultIndex(prevIndex)
    setSelectedNodeId(searchResults[prevIndex])
  }

  const handleUpdateMetadata = (metadata: NodeMetadata) => {
    if (!selectedNodeId) return

    setNodes(nds =>
      nds.map(node => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
              lastModified: Date.now(),
            },
          }
        }
        return node
      })
    )
  }

  const handleUpdateIcon = (icon: string | null) => {
    if (!selectedNodeId) return

    setNodes(nds =>
      nds.map(node => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              icon: icon || undefined,
              lastModified: Date.now(),
            },
          }
        }
        return node
      })
    )
  }

  const handleUpdateCloud = (cloud: { color?: string } | null) => {
    if (!selectedNodeId) return

    setNodes(nds =>
      nds.map(node => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              cloud: cloud || undefined,
              lastModified: Date.now(),
            },
          }
        }
        return node
      })
    )
  }

  // Multi-selection handlers
  const handleMultiSelectToggle = (nodeId: string, addToSelection: boolean) => {
    if (addToSelection) {
      setSelectedNodeIds(prev => {
        const newSet = new Set(prev)
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId)
        } else {
          newSet.add(nodeId)
        }
        // Show bulk operations panel if we have more than one node selected
        setShowBulkOperations(newSet.size > 1)
        return newSet
      })
    } else {
      setSelectedNodeIds(new Set())
      setSelectedNodeId(nodeId)
    }
  }

  const handleClearSelection = () => {
    setSelectedNodeIds(new Set())
    setSelectedNodeId(null)
    setShowBulkOperations(false)
  }

  const handleSelectAll = () => {
    setSelectedNodeIds(new Set(nodes.map(n => n.id)))
    setShowBulkOperations(true)
  }

  const handleBulkDelete = () => {
    if (selectedNodeIds.size === 0) return

    // Don't delete if it would delete all nodes
    if (selectedNodeIds.size >= nodes.length) {
      alert('Cannot delete all nodes')
      return
    }

    // Find all descendants of selected nodes
    const allToDelete = new Set<string>(selectedNodeIds)
    let added = true

    while (added) {
      added = false
      edges.forEach(edge => {
        if (allToDelete.has(edge.source) && !allToDelete.has(edge.target)) {
          allToDelete.add(edge.target)
          added = true
        }
      })
    }

    setNodes(nds => nds.filter(n => !allToDelete.has(n.id)))
    setEdges(eds => eds.filter(e => !allToDelete.has(e.source) && !allToDelete.has(e.target)))
    handleClearSelection()
  }

  const handleBulkIconChange = (icon: string | null) => {
    if (selectedNodeIds.size === 0) return

    setNodes(nds =>
      nds.map(node => {
        if (selectedNodeIds.has(node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              icon: icon || undefined,
              lastModified: Date.now(),
            },
          }
        }
        return node
      })
    )
  }

  const handleBulkCloudChange = (cloud: { color: string } | null) => {
    if (selectedNodeIds.size === 0) return

    setNodes(nds =>
      nds.map(node => {
        if (selectedNodeIds.has(node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              cloud: cloud || undefined,
              lastModified: Date.now(),
            },
          }
        }
        return node
      })
    )
  }

  const handleBulkColorChange = (backgroundColor: string) => {
    if (selectedNodeIds.size === 0) return

    setNodes(nds =>
      nds.map(node => {
        if (selectedNodeIds.has(node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              backgroundColor,
              lastModified: Date.now(),
            },
          }
        }
        return node
      })
    )
  }

  // AI Handlers
  const handleAIGenerateMindMap = (text: string) => {
    try {
      const mindMapTree = parseAITextToMindMap(text)
      const { nodes: newNodes, edges: newEdges } = treeToFlow(mindMapTree)
      setNodes(newNodes)
      setEdges(newEdges)
    } catch (error) {
      alert(
        `Error generating mind map: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  const handleAISuggestIdeas = (nodeId: string) => {
    // This would normally get suggestions from AI
    // For now, it's a placeholder that could be expanded
    const suggestions = [
      'Consider related concepts',
      'Add examples',
      'Include counter-arguments',
      'Add references',
      'Create sub-categories',
    ]

    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    // Add suggestions as child nodes
    const newNodes = suggestions.map(suggestion => ({
      id: generateId(),
      type: 'mindmap',
      position: {
        x: node.position.x + 250,
        y: node.position.y + Math.random() * 100,
      },
      data: { label: suggestion, lastModified: Date.now() },
    }))

    const newEdges = newNodes.map(newNode => ({
      id: `${nodeId}-${newNode.id}`,
      source: nodeId,
      target: newNode.id,
      type: 'smoothstep',
    }))

    setNodes(nds => [...nds, ...newNodes])
    setEdges(eds => [...eds, ...newEdges])
  }

  const handleAISummarizeBranch = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    // Get all descendants
    const descendants = new Set<string>([nodeId])
    let added = true
    while (added) {
      added = false
      edges.forEach(edge => {
        if (descendants.has(edge.source) && !descendants.has(edge.target)) {
          descendants.add(edge.target)
          added = true
        }
      })
    }

    const branchNodes = nodes.filter(n => descendants.has(n.id))
    const summary = `Branch: ${node.data.label}\nContains ${branchNodes.length} nodes`

    // Show the summary in a modal or alert
    alert(summary)
  }

  // Comment Handlers
  const handleAddComment = (content: string) => {
    if (!selectedNodeId) return

    const newComment = {
      id: generateId(),
      nodeId: selectedNodeId,
      author: currentUser.name,
      authorColor: currentUser.color,
      content,
      timestamp: Date.now(),
      resolved: false,
    }

    setComments(prev => [...prev, newComment])
  }

  const handleResolveComment = (commentId: string) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId ? { ...comment, resolved: !comment.resolved } : comment
      )
    )
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId))
  }

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'crosslink',
        data: { isCrossLink: crossLinkMode },
        style: crossLinkMode
          ? { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' }
          : undefined,
      }
      setEdges(eds => addEdge(newEdge, eds))
      if (crossLinkMode) {
        setCrossLinkMode(false)
        setCrossLinkSource(null)
      }
    },
    [setEdges, crossLinkMode]
  )

  // Handle cross-link creation via node clicks
  const handleNodeClickForCrossLink = (nodeId: string) => {
    if (crossLinkMode) {
      if (crossLinkSource === null) {
        // First click - set as source
        setCrossLinkSource(nodeId)
      } else if (crossLinkSource !== nodeId) {
        // Second click - create cross-link
        const existingEdge = edges.find(e => e.source === crossLinkSource && e.target === nodeId)

        if (!existingEdge) {
          const newEdge = {
            id: `${crossLinkSource}-${nodeId}`,
            source: crossLinkSource,
            target: nodeId,
            type: 'crosslink' as const,
            data: { isCrossLink: true },
            style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
          }
          setEdges(eds => [...eds, newEdge])
        }

        // Reset cross-link mode
        setCrossLinkMode(false)
        setCrossLinkSource(null)
      }
    }
  }

  // Keyboard shortcuts hook - handles all keyboard shortcuts for the application
  useKeyboardShortcuts(
    {
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
    },
    {
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
    }
  )

  const handleRestoreFromHistory = (index: number) => {
    const slot = restoreFromHistory(index)
    if (slot) {
      setNodes(slot.nodes)
      setEdges(slot.edges)
      setShowSaveHistory(false)
    }
  }

  const handleConflictRestore = () => {
    if (conflictSlot) {
      setNodes(conflictSlot.nodes)
      setEdges(conflictSlot.edges)
      setConflictSlot(null)
    }
  }

  const handleJumpToHistory = (index: number, fromPast: boolean) => {
    const state = jumpToHistory(index, fromPast)
    if (state) {
      setNodes(state.nodes)
      setEdges(state.edges)
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={transformedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(event, node) => {
          if (crossLinkMode) {
            handleNodeClickForCrossLink(node.id)
          } else if (event.shiftKey) {
            // Shift+click - Toggle node in multi-selection
            handleMultiSelectToggle(node.id, true)
          } else {
            // Regular click - Clear multi-selection and select single node
            if (selectedNodeIds.size > 0) {
              handleClearSelection()
            }
            setSelectedNodeId(node.id)
          }
        }}
        onPaneClick={() => {
          setSelectedNodeId(null)
          handleClearSelection()
          if (crossLinkMode) {
            setCrossLinkMode(false)
            setCrossLinkSource(null)
          }
        }}
        fitView
      >
        <Background />
        <CloudBackground nodes={nodes} />
        <Controls />
        <MiniMap />

        {/* Save Status Indicator */}
        <Panel position="top-center" style={{ background: 'transparent' }}>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'white',
              border: '1px solid #d1d5db',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {saveStatus === 'saved' && (
                <>
                  <span style={{ color: '#10b981' }}>✓</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>Saved</span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <span style={{ color: '#f59e0b' }}>●</span>
                  <span style={{ color: '#f59e0b' }}>Unsaved changes</span>
                </>
              )}
              {saveStatus === 'saving' && (
                <>
                  <span style={{ color: '#3b82f6' }}>⟳</span>
                  <span style={{ color: '#3b82f6' }}>Saving...</span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={saveNow}
                title="Save now (Ctrl+S)"
                style={{
                  padding: '4px 8px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                }}
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveHistory(true)}
                title="View save history (Ctrl+H)"
                style={{
                  padding: '4px 8px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                }}
              >
                History ({saveHistory.length})
              </button>
            </div>
          </div>
        </Panel>

        {/* Search Panel */}
        {showSearch && (
          <Panel position="top-center" style={{ top: '60px' }}>
            <SearchPanel
              onSearch={handleSearch}
              onNext={handleNextResult}
              onPrevious={handlePreviousResult}
              resultCount={searchResults.length}
              currentResult={currentResultIndex}
              availableIcons={Array.from(
                new Set(nodes.map(n => n.data.icon).filter((i): i is string => Boolean(i)))
              )}
              availableClouds={Array.from(
                new Set(nodes.map(n => n.data.cloud?.color).filter((c): c is string => Boolean(c)))
              )}
            />
          </Panel>
        )}

        <Panel position="bottom-right" style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'white',
              border: '1px solid #d1d5db',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              opacity: canUndo ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ↶
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'white',
              border: '1px solid #d1d5db',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              opacity: canRedo ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ↷
          </button>
          <button
            onClick={() => setShowHistoryPanel(true)}
            title="History (Ctrl+Shift+H)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'white',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🕐
          </button>
          <button
            onClick={() => zoomIn()}
            title="Zoom In (Ctrl +)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'white',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
          <button
            onClick={() => zoomOut()}
            title="Zoom Out (Ctrl -)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'white',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            -
          </button>
          <button
            onClick={() => fitView()}
            title="Fit View (Ctrl 0)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'white',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⤢
          </button>
        </Panel>

        <Panel position="top-right" className="controls-panel">
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <button
              onClick={() => {
                toggleDarkMode()
                setCurrentTheme(getEffectiveTheme())
              }}
              title="Toggle dark mode (Ctrl+Shift+D)"
              style={{
                padding: '8px 12px',
                background: currentTheme === 'dark' ? '#1e293b' : '#f3f4f6',
                color: currentTheme === 'dark' ? '#f1f5f9' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontWeight: 'bold',
              }}
            >
              {currentTheme === 'dark' ? '☀️' : '🌙'}
              {currentTheme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <hr />
            <button onClick={() => createChildNode(nodes[0]?.id || generateId())}>
              + New Root
            </button>
            <hr />
            <div>
              <strong>Save As:</strong>
            </div>
            <button onClick={() => saveToFile('json')}>JSON</button>
            <button onClick={() => saveToFile('freemind')}>FreeMind (.mm)</button>
            <button onClick={() => saveToFile('opml')}>OPML</button>
            <button onClick={() => saveToFile('markdown')}>Markdown</button>
            <button onClick={() => saveToFile('d2')}>D2</button>
            <button onClick={() => saveToFile('yaml')}>YAML</button>
            <hr />
            <div>
              <strong>Enhanced Exports:</strong>
            </div>
            <button onClick={() => saveToFile('pdf')}>PDF (Print)</button>
            <button onClick={() => saveToFile('powerpoint')}>PowerPoint</button>
            <button onClick={() => saveToFile('presentation')}>Presentation</button>
            <button onClick={() => downloadMarkdown(flowToTree(nodes, edges)!, 'notion.md')}>
              Notion/Obsidian
            </button>
            <hr />
            <div>
              <strong>Export As Image:</strong>
            </div>
            <button onClick={exportAsSVG}>SVG</button>
            <button onClick={exportAsPNG}>PNG</button>
            <hr />
            <div>
              <strong>Load From:</strong>
            </div>
            <button onClick={() => loadFromFile('json')}>JSON</button>
            <button onClick={() => loadFromFile('freemind')}>FreeMind (.mm)</button>
            <button onClick={() => loadFromFile('opml')}>OPML</button>
            <button onClick={() => loadFromFile('markdown')}>Markdown</button>
            <button onClick={() => loadFromFile('yaml')}>YAML</button>
            <hr />
            <div>
              <strong>Cross-Links:</strong>
            </div>
            <button
              onClick={() => setCrossLinkMode(!crossLinkMode)}
              style={{
                background: crossLinkMode ? '#f59e0b' : '#f3f4f6',
                color: crossLinkMode ? 'white' : '#374151',
              }}
            >
              {crossLinkMode ? 'Cancel Link Mode' : 'Add Cross-Link'}
            </button>
            {crossLinkMode && (
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {crossLinkSource
                  ? `Source selected. Click target node.`
                  : 'Click source node first.'}
              </div>
            )}
          </div>
        </Panel>

        <Panel position="bottom-left">
          <div style={{ fontSize: '12px', color: '#666' }}>
            <strong>Shortcuts:</strong>
            <br />
            Tab - Create child
            <br />
            Enter - Create sibling
            <br />
            Delete - Remove node
            <br />
            F2 - Edit text
            <br />
            Space - Toggle collapse
            <br />
            <strong>Multi-Select:</strong> Shift+Click
            <br />
            <strong>Select All:</strong> Ctrl+A
            <br />
            <strong>Zoom:</strong> Ctrl +/-/0
            <br />
            <strong>Notes:</strong> F3 / Ctrl+N
            <br />
            <strong>Stats:</strong> Ctrl+I
            <br />
            <strong>Help:</strong> ?
            {selectedNodeId && (
              <button
                onClick={() => setShowNotesPanel(!showNotesPanel)}
                style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  background: showNotesPanel ? '#3b82f6' : '#f3f4f6',
                  color: showNotesPanel ? 'white' : '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                {showNotesPanel ? 'Hide Notes' : 'Show Notes'}
              </button>
            )}
            <button
              onClick={() => setShowStatistics(true)}
              style={{
                marginTop: '4px',
                padding: '4px 8px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              📊 Statistics
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              style={{
                marginTop: '4px',
                padding: '4px 8px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              ⌨️ Shortcuts
            </button>
            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              style={{
                marginTop: '4px',
                padding: '4px 8px',
                background: showAIAssistant ? '#8b5cf6' : '#f3f4f6',
                color: showAIAssistant ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              🤖 AI Assistant
            </button>
            <button
              onClick={() => setShowWebhookPanel(!showWebhookPanel)}
              title="Webhook Integration (Ctrl+Shift+W)"
              style={{
                marginTop: '4px',
                padding: '4px 8px',
                background: showWebhookPanel ? '#8b5cf6' : '#f3f4f6',
                color: showWebhookPanel ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              🔗 Webhooks
            </button>
            <button
              onClick={() => setShowCalendarPanel(!showCalendarPanel)}
              title="Calendar Export (Ctrl+Shift+D)"
              style={{
                marginTop: '4px',
                padding: '4px 8px',
                background: showCalendarPanel ? '#8b5cf6' : '#f3f4f6',
                color: showCalendarPanel ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              📅 Calendar
            </button>
            <button
              onClick={() => setShowEmailPanel(!showEmailPanel)}
              title="Email Integration (Ctrl+Shift+E)"
              style={{
                marginTop: '4px',
                padding: '4px 8px',
                background: showEmailPanel ? '#8b5cf6' : '#f3f4f6',
                color: showEmailPanel ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              ✉️ Email
            </button>
            <button
              onClick={() => setShowPresentation(!showPresentation)}
              title="Presentation Mode (Ctrl+Shift+P)"
              style={{
                marginTop: '4px',
                padding: '4px 8px',
                background: showPresentation ? '#8b5cf6' : '#f3f4f6',
                color: showPresentation ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              🎯 Present
            </button>
            <button
              onClick={() => setShow3DView(!show3DView)}
              title="3D View (Ctrl+Shift+3)"
              style={{
                marginTop: '4px',
                padding: '4px 8px',
                background: show3DView ? '#8b5cf6' : '#f3f4f6',
                color: show3DView ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              🎨 3D View
            </button>
            <button
              onClick={() => setShowTemplatesPanel(!showTemplatesPanel)}
              title="Templates (Ctrl+Shift+T)"
              style={{
                marginTop: '4px',
                padding: '4px 8px',
                background: showTemplatesPanel ? '#8b5cf6' : '#f3f4f6',
                color: showTemplatesPanel ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              📋 Templates
            </button>
            <button
              onClick={() => setShowThemeSettings(!showThemeSettings)}
              title="Theme Settings (Ctrl+Shift+;)"
              style={{
                marginTop: '4px',
                padding: '4px 8px',
                background: showThemeSettings ? '#8b5cf6' : '#f3f4f6',
                color: showThemeSettings ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              🎨 Theme
            </button>
          </div>
        </Panel>

        <Panel position="top-left">
          <MetadataPanel
            key={selectedNodeId || 'no-selection'}
            nodeId={selectedNodeId}
            nodeLabel={selectedNode?.data.label || ''}
            metadata={selectedNode?.data.metadata}
            icon={selectedNode?.data.icon}
            cloud={selectedNode?.data.cloud}
            onUpdateMetadata={handleUpdateMetadata}
            onUpdateIcon={handleUpdateIcon}
            onUpdateCloud={handleUpdateCloud}
          />
        </Panel>
      </ReactFlow>

      {/* Notes Panel */}
      <NotesPanel
        visible={showNotesPanel}
        onClose={() => setShowNotesPanel(false)}
        notes={selectedNode?.data.metadata?.notes || ''}
        onSave={notes => {
          if (selectedNodeId) {
            handleUpdateMetadata({
              ...(selectedNode?.data.metadata || {}),
              notes: notes || undefined,
            })
          }
        }}
      />

      {/* Save History Panel */}
      {showSaveHistory && (
        <SaveHistoryPanel
          saveHistory={saveHistory}
          onRestore={handleRestoreFromHistory}
          onDelete={deleteHistorySlot}
          onClose={() => setShowSaveHistory(false)}
        />
      )}

      {/* Conflict Resolution Modal */}
      {conflictSlot && (
        <ConflictResolutionModal
          saveSlot={conflictSlot}
          onRestore={handleConflictRestore}
          onDismiss={() => setConflictSlot(null)}
        />
      )}

      {/* History Panel */}
      {showHistoryPanel && (
        <HistoryPanel
          history={getFullHistory()}
          canUndo={canUndo}
          canRedo={canRedo}
          onJump={handleJumpToHistory}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClose={() => setShowHistoryPanel(false)}
        />
      )}

      {/* Statistics Panel */}
      {showStatistics && (
        <StatisticsPanel
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onClose={() => setShowStatistics(false)}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {/* Bulk Operations Panel */}
      {showBulkOperations && selectedNodeIds.size > 1 && (
        <BulkOperationsPanel
          selectedCount={selectedNodeIds.size}
          onBulkDelete={handleBulkDelete}
          onBulkIconChange={handleBulkIconChange}
          onBulkCloudChange={handleBulkCloudChange}
          onBulkColorChange={handleBulkColorChange}
          availableIcons={Array.from(
            new Set(nodes.map(n => n.data.icon).filter((i): i is string => Boolean(i)))
          )}
          onClearSelection={handleClearSelection}
          onClose={() => setShowBulkOperations(false)}
        />
      )}

      {/* Mobile Toolbar */}
      {isMobile && (
        <MobileToolbar
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitView={fitView}
          onAddNode={() => nodes[0] && createChildNode(nodes[0].id)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onToggleNotes={() => setShowNotesPanel(!showNotesPanel)}
          onToggleSearch={() => setShowSearch(!showSearch)}
          canUndo={canUndo}
          canRedo={canRedo}
          hasSelection={!!selectedNodeId}
        />
      )}

      {/* AI Assistant Panel */}
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading AI Assistant...</div>}>
        <AIAssistantPanel
          visible={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          onGenerateMindMap={handleAIGenerateMindMap}
          onSuggestIdeas={handleAISuggestIdeas}
          onSummarizeBranch={handleAISummarizeBranch}
          selectedNodeId={selectedNodeId}
        />
      </Suspense>

      {/* Comments Panel */}
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading Comments...</div>}>
        <CommentsPanel
          visible={showCommentsPanel}
          onClose={() => setShowCommentsPanel(false)}
          nodeId={selectedNodeId}
          nodeLabel={selectedNode?.data?.label || ''}
          comments={comments}
          onAddComment={handleAddComment}
          onResolveComment={handleResolveComment}
          onDeleteComment={handleDeleteComment}
        />
      </Suspense>

      {/* Presence Indicator */}
      <PresenceIndicator users={onlineUsers} currentUser={currentUser} />

      {/* Webhook Integration Panel */}
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading Webhook Integration...</div>}>
        <WebhookIntegrationPanel
          visible={showWebhookPanel}
          onClose={() => setShowWebhookPanel(false)}
          tree={flowToTree(nodes, edges)}
          onWebhookData={data => {
            if (data.parentId) {
              createChildNode(data.parentId)
            }
          }}
        />
      </Suspense>

      {/* Calendar Export Panel */}
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading Calendar Export...</div>}>
        <CalendarExportPanel
          visible={showCalendarPanel}
          onClose={() => setShowCalendarPanel(false)}
          tree={flowToTree(nodes, edges)}
        />
      </Suspense>

      {/* Email Integration Panel */}
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading Email Integration...</div>}>
        <EmailIntegrationPanel
          visible={showEmailPanel}
          onClose={() => setShowEmailPanel(false)}
          tree={flowToTree(nodes, edges)}
        />
      </Suspense>

      {/* Presentation Mode */}
      {showPresentation && (
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading Presentation...</div>}>
          <PresentationMode
            visible={showPresentation}
            onClose={() => setShowPresentation(false)}
            tree={flowToTree(nodes, edges)}
          />
        </Suspense>
      )}

      {/* 3D View */}
      {show3DView && (
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading 3D View...</div>}>
          <ThreeDView
            visible={show3DView}
            onClose={() => setShow3DView(false)}
            tree={flowToTree(nodes, edges)}
          />
        </Suspense>
      )}

      {/* Templates Panel */}
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading Templates...</div>}>
        <TemplatesPanel
          visible={showTemplatesPanel}
          onClose={() => setShowTemplatesPanel(false)}
          onApplyTemplate={handleApplyTemplate}
        />
      </Suspense>

      {/* Theme Settings Panel */}
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading Theme Settings...</div>}>
        <ThemeSettingsPanel
          visible={showThemeSettings}
          onClose={() => setShowThemeSettings(false)}
          onThemeChange={() => {
            // Theme change handled by the panel itself
          }}
        />
      </Suspense>
    </div>
  )
}

export default function MindMapCanvasWrapper(props: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapCanvas {...props} />
    </ReactFlowProvider>
  )
}
