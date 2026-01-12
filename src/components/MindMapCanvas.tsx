import { useCallback, useEffect, useState, useMemo } from 'react';
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
} from 'reactflow';
import type { Connection, OnConnect, Node } from 'reactflow';
import 'reactflow/dist/style.css';

import MindMapNode from './MindMapNode';
import MetadataPanel from './MetadataPanel';
import NotesPanel from './NotesPanel';
import CloudBackground from './CloudBackground';
import CrossLinkEdge from './CrossLinkEdge';
import SearchPanel, { type SearchOptions } from './SearchPanel';
import SaveHistoryPanel from './SaveHistoryPanel';
import ConflictResolutionModal from './ConflictResolutionModal';
import HistoryPanel from './HistoryPanel';
import StatisticsPanel from './StatisticsPanel';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import BulkOperationsPanel from './BulkOperationsPanel';
import MobileToolbar from './MobileToolbar';
import AIAssistantPanel from './AIAssistantPanel';
import CommentsPanel from './CommentsPanel';
import PresenceIndicator from './PresenceIndicator';
import WebhookIntegrationPanel from './WebhookIntegrationPanel';
import CalendarExportPanel from './CalendarExportPanel';
import EmailIntegrationPanel from './EmailIntegrationPanel';
import PresentationMode from './PresentationMode';
import ThreeDView from './ThreeDView';
import TemplatesPanel from './TemplatesPanel';
import ThemeSettingsPanel from './ThemeSettingsPanel';
import type { MindMapNodeData, MindMapTree, NodeMetadata } from '../types';
import { flowToTree, treeToFlow, generateId } from '../utils/mindmapConverter';
import { parseJSON, stringifyJSON, parseFreeMind, toFreeMind, parseOPML, toOPML, parseMarkdown, toMarkdown, toD2, toYaml, parseYaml } from '../utils/formats';
import { parseAITextToMindMap } from '../utils/aiParser';
import { exportToPDF, exportToPowerPoint, downloadMarkdown, createPresentation } from '../utils/enhancedExports';
import { useAutoSave } from '../hooks/useAutoSave';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useGestureNavigation } from '../hooks/useGestureNavigation';
import { initializeTheme } from '../utils/theme';

const nodeTypes = {
  mindmap: MindMapNode,
};

const edgeTypes = {
  crosslink: CrossLinkEdge,
  default: CrossLinkEdge,
};

interface MindMapCanvasProps {
  initialData?: MindMapTree;
}

function MindMapCanvas({ initialData }: MindMapCanvasProps) {
  const { nodes: initialNodes, edges: initialEdges } = initialData
    ? treeToFlow(initialData)
    : { nodes: [], edges: [] };

  const [nodes, setNodes, onNodesChange] = useNodesState<MindMapNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [crossLinkMode, setCrossLinkMode] = useState(false);
  const [crossLinkSource, setCrossLinkSource] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [showSearch, setShowSearch] = useState(false);
  const [_searchQuery, setSearchQuery] = useState('');
  const [_searchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
    searchInNotes: false,
  });
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [showSaveHistory, setShowSaveHistory] = useState(false);
  const [conflictSlot, setConflictSlot] = useState<any>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [showWebhookPanel, setShowWebhookPanel] = useState(false);
  const [showCalendarPanel, setShowCalendarPanel] = useState(false);
  const [showEmailPanel, setShowEmailPanel] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [show3DView, setShow3DView] = useState(false);
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [currentUser] = useState(() => {
    const name = localStorage.getItem('user_name') || `User ${Math.floor(Math.random() * 1000)}`;
    const color = localStorage.getItem('user_color') || '#3b82f6';
    return { id: Date.now().toString(), name, color };
  });
  const [onlineUsers, setOnlineUsers] = useState<any[]>([currentUser]);

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Update onlineUsers when currentUser changes
  useEffect(() => {
    setOnlineUsers((prev) => {
      const filtered = prev.filter((u) => u.id !== currentUser.id);
      return [...filtered, currentUser];
    });
  }, [currentUser]);

  // Transform nodes to add multi-selection state
  const transformedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      selected: node.id === selectedNodeId || selectedNodeIds.has(node.id),
    }));
  }, [nodes, selectedNodeId, selectedNodeIds]);

  // Auto-save hook with history
  const { saveNow, saveHistory, restoreFromHistory, deleteHistorySlot } = useAutoSave({
    nodes,
    edges,
    onSaveStatusChange: setSaveStatus,
    onConflictFound: (slot) => setConflictSlot(slot),
  });

  // Undo/Redo hook
  const { canUndo, canRedo, addToHistory: _addToHistory, undo, redo, getFullHistory, jumpToHistory } = useUndoRedo();

  // Offline sync hook - runs for side effects
  useOfflineSync({
    onOnline: () => {
      // Sync data when coming back online
      console.log('Back online - syncing data');
    },
    onOffline: () => {
      // Notify user they're offline
      console.log('Gone offline - changes will be saved locally');
    },
  });

  // Gesture navigation
  useGestureNavigation({
    enabled: true,
  });

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, []);

  // Handle node label changes from rich text editor
  useEffect(() => {
    const handleNodeLabelChange = (e: CustomEvent) => {
      const { nodeId, label } = e.detail;
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label,
                lastModified: Date.now(),
              },
            };
          }
          return node;
        })
      );
    };

    const handleNodeCheckboxChange = (e: CustomEvent) => {
      const { nodeId, checked } = e.detail;
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                checked,
                lastModified: Date.now(),
              },
            };
          }
          return node;
        })
      );
    };

    window.addEventListener('nodeLabelChange', handleNodeLabelChange as EventListener);
    window.addEventListener('nodeCheckboxChange', handleNodeCheckboxChange as EventListener);
    return () => {
      window.removeEventListener('nodeLabelChange', handleNodeLabelChange as EventListener);
      window.removeEventListener('nodeCheckboxChange', handleNodeCheckboxChange as EventListener);
    };
  }, []);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleUndo = () => {
    if (!canUndo) return;

    const previousState = undo();
    if (previousState) {
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
    }
  };

  const handleRedo = () => {
    if (!canRedo) return;

    const nextState = redo();
    if (nextState) {
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
    }
  };

  // Template Handler
  const handleApplyTemplate = (tree: MindMapTree) => {
    const { nodes: newNodes, edges: newEdges } = treeToFlow(tree);
    setNodes(newNodes);
    setEdges(newEdges);
    fitView({ duration: 800 });
  };

  // Search handlers
  const handleSearch = (query: string, options: SearchOptions) => {
    // If no query and no filters, clear results
    if (!query.trim() && !options.filterIcon && !options.filterCloud && !options.filterDate) {
      setSearchResults([]);
      setSearchQuery('');
      setCurrentResultIndex(0);
      return;
    }

    const now = Date.now();
    const timeLimits = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };

    const matchingNodeIds = nodes.filter((node) => {
      // Text search
      if (query.trim()) {
        const label = node.data.label || '';
        const notes = node.data.metadata?.notes || '';
        const searchText = options.searchInNotes
          ? `${label} ${notes}`
          : label;

        let searchQuery = query;
        let searchTarget = searchText;

        // Case sensitivity
        if (!options.caseSensitive) {
          searchQuery = searchQuery.toLowerCase();
          searchTarget = searchTarget.toLowerCase();
        }

        // Regex mode
        if (options.useRegex) {
          try {
            const regex = new RegExp(searchQuery, options.caseSensitive ? 'g' : 'gi');
            if (!regex.test(searchTarget)) return false;
          } catch {
            // Invalid regex, fall back to regular search
            if (!searchTarget.includes(searchQuery)) return false;
          }
        } else if (options.wholeWord) {
          // Whole word mode
          const words = searchTarget.split(/\s+/);
          if (!words.some((word) => word === searchQuery)) return false;
        } else {
          // Default: contains search
          if (!searchTarget.includes(searchQuery)) return false;
        }
      }

      // Icon filter
      if (options.filterIcon && node.data.icon !== options.filterIcon) {
        return false;
      }

      // Cloud filter
      if (options.filterCloud && node.data.cloud?.color !== options.filterCloud) {
        return false;
      }

      // Date filter - use creation timestamp if available (stored in node data)
      if (options.filterDate) {
        const nodeTime = (node.data as any).lastModified || now;
        const timeDiff = now - nodeTime;
        if (timeDiff > timeLimits[options.filterDate]) {
          return false;
        }
      }

      return true;
    }).map((node) => node.id);

    setSearchResults(matchingNodeIds);
    setSearchQuery(query);
    setCurrentResultIndex(0);

    if (matchingNodeIds.length > 0) {
      setSelectedNodeId(matchingNodeIds[0]);
    }
  };

  const handleNextResult = () => {
    if (searchResults.length === 0) return;

    const nextIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(nextIndex);
    setSelectedNodeId(searchResults[nextIndex]);
  };

  const handlePreviousResult = () => {
    if (searchResults.length === 0) return;

    const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentResultIndex(prevIndex);
    setSelectedNodeId(searchResults[prevIndex]);
  };

  const handleUpdateMetadata = (metadata: NodeMetadata) => {
    if (!selectedNodeId) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
              lastModified: Date.now(),
            },
          };
        }
        return node;
      })
    );
  };

  const handleUpdateIcon = (icon: string | null) => {
    if (!selectedNodeId) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              icon: icon || undefined,
              lastModified: Date.now(),
            },
          };
        }
        return node;
      })
    );
  };

  const handleUpdateCloud = (cloud: { color?: string } | null) => {
    if (!selectedNodeId) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              cloud: cloud || undefined,
              lastModified: Date.now(),
            },
          };
        }
        return node;
      })
    );
  };

  // Multi-selection handlers
  const handleMultiSelectToggle = (nodeId: string, addToSelection: boolean) => {
    if (addToSelection) {
      setSelectedNodeIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        // Show bulk operations panel if we have more than one node selected
        setShowBulkOperations(newSet.size > 1);
        return newSet;
      });
    } else {
      setSelectedNodeIds(new Set());
      setSelectedNodeId(nodeId);
    }
  };

  const handleClearSelection = () => {
    setSelectedNodeIds(new Set());
    setSelectedNodeId(null);
    setShowBulkOperations(false);
  };

  const handleSelectAll = () => {
    setSelectedNodeIds(new Set(nodes.map((n) => n.id)));
    setShowBulkOperations(true);
  };

  const handleBulkDelete = () => {
    if (selectedNodeIds.size === 0) return;

    // Don't delete if it would delete all nodes
    if (selectedNodeIds.size >= nodes.length) {
      alert('Cannot delete all nodes');
      return;
    }

    // Find all descendants of selected nodes
    const allToDelete = new Set<string>(selectedNodeIds);
    let added = true;

    while (added) {
      added = false;
      edges.forEach((edge) => {
        if (allToDelete.has(edge.source) && !allToDelete.has(edge.target)) {
          allToDelete.add(edge.target);
          added = true;
        }
      });
    }

    setNodes((nds) => nds.filter((n) => !allToDelete.has(n.id)));
    setEdges((eds) => eds.filter((e) => !allToDelete.has(e.source) && !allToDelete.has(e.target)));
    handleClearSelection();
  };

  const handleBulkIconChange = (icon: string | null) => {
    if (selectedNodeIds.size === 0) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (selectedNodeIds.has(node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              icon: icon || undefined,
              lastModified: Date.now(),
            },
          };
        }
        return node;
      })
    );
  };

  const handleBulkCloudChange = (cloud: { color: string } | null) => {
    if (selectedNodeIds.size === 0) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (selectedNodeIds.has(node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              cloud: cloud || undefined,
              lastModified: Date.now(),
            },
          };
        }
        return node;
      })
    );
  };

  const handleBulkColorChange = (backgroundColor: string) => {
    if (selectedNodeIds.size === 0) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (selectedNodeIds.has(node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              backgroundColor,
              lastModified: Date.now(),
            },
          };
        }
        return node;
      })
    );
  };

  // AI Handlers
  const handleAIGenerateMindMap = (text: string) => {
    try {
      const mindMapTree = parseAITextToMindMap(text);
      const { nodes: newNodes, edges: newEdges } = treeToFlow(mindMapTree);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error: any) {
      alert(`Error generating mind map: ${error.message}`);
    }
  };

  const handleAISuggestIdeas = (nodeId: string) => {
    // This would normally get suggestions from AI
    // For now, it's a placeholder that could be expanded
    const suggestions = [
      'Consider related concepts',
      'Add examples',
      'Include counter-arguments',
      'Add references',
      'Create sub-categories',
    ];

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Add suggestions as child nodes
    const newNodes = suggestions.map((suggestion) => ({
      id: generateId(),
      type: 'mindmap',
      position: {
        x: node.position.x + 250,
        y: node.position.y + Math.random() * 100,
      },
      data: { label: suggestion, lastModified: Date.now() },
    }));

    const newEdges = newNodes.map((newNode) => ({
      id: `${nodeId}-${newNode.id}`,
      source: nodeId,
      target: newNode.id,
      type: 'smoothstep',
    }));

    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
  };

  const handleAISummarizeBranch = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Get all descendants
    const descendants = new Set<string>([nodeId]);
    let added = true;
    while (added) {
      added = false;
      edges.forEach((edge) => {
        if (descendants.has(edge.source) && !descendants.has(edge.target)) {
          descendants.add(edge.target);
          added = true;
        }
      });
    }

    const branchNodes = nodes.filter((n) => descendants.has(n.id));
    const summary = `Branch: ${node.data.label}\nContains ${branchNodes.length} nodes`;

    // Show the summary in a modal or alert
    alert(summary);
  };

  // Comment Handlers
  const handleAddComment = (content: string) => {
    if (!selectedNodeId) return;

    const newComment = {
      id: generateId(),
      nodeId: selectedNodeId,
      author: currentUser.name,
      authorColor: currentUser.color,
      content,
      timestamp: Date.now(),
      resolved: false,
    };

    setComments((prev) => [...prev, newComment]);
  };

  const handleResolveComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, resolved: !comment.resolved } : comment
      )
    );
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'crosslink',
        data: { isCrossLink: crossLinkMode },
        style: crossLinkMode
          ? { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' }
          : undefined,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      if (crossLinkMode) {
        setCrossLinkMode(false);
        setCrossLinkSource(null);
      }
    },
    [setEdges, crossLinkMode]
  );

  // Handle cross-link creation via node clicks
  const handleNodeClickForCrossLink = (nodeId: string) => {
    if (crossLinkMode) {
      if (crossLinkSource === null) {
        // First click - set as source
        setCrossLinkSource(nodeId);
      } else if (crossLinkSource !== nodeId) {
        // Second click - create cross-link
        const existingEdge = edges.find(
          (e) => e.source === crossLinkSource && e.target === nodeId
        );

        if (!existingEdge) {
          const newEdge = {
            id: `${crossLinkSource}-${nodeId}`,
            source: crossLinkSource,
            target: nodeId,
            type: 'crosslink' as const,
            data: { isCrossLink: true },
            style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
          };
          setEdges((eds) => [...eds, newEdge]);
        }

        // Reset cross-link mode
        setCrossLinkMode(false);
        setCrossLinkSource(null);
      }
    }
  };

  // Keyboard shortcuts for mind map operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not editing text
      if (document.activeElement?.classList.contains('node-content')) {
        return;
      }

      // Tab - Create child node
      if (event.key === 'Tab' && selectedNodeId) {
        event.preventDefault();
        createChildNode(selectedNodeId);
      }

      // Enter - Create sibling node
      if (event.key === 'Enter' && selectedNodeId) {
        event.preventDefault();
        createSiblingNode(selectedNodeId);
      }

      // Delete/Backspace - Delete node
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        event.preventDefault();
        deleteNode(selectedNodeId);
      }

      // F2 - Edit node content
      if (event.key === 'F2' && selectedNodeId) {
        event.preventDefault();
        editNode(selectedNodeId);
      }

      // Space - Toggle collapse
      if (event.key === ' ' && selectedNodeId) {
        event.preventDefault();
        toggleCollapse(selectedNodeId);
      }

      // Ctrl + or = - Zoom in
      if (event.key === '=' || event.key === '+') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          zoomIn();
        }
      }

      // Ctrl - or _ - Zoom out
      if (event.key === '-' || event.key === '_') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          zoomOut();
        }
      }

      // Ctrl 0 - Fit view
      if (event.key === '0') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          fitView();
        }
      }

      // Ctrl N - Toggle notes panel
      if (event.key === 'n' || event.key === 'N') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (selectedNode) {
            setShowNotesPanel(!showNotesPanel);
          }
        }
      }

      // F3 - Toggle notes panel (when node selected)
      if (event.key === 'F3' && selectedNodeId) {
        event.preventDefault();
        setShowNotesPanel(!showNotesPanel);
      }

      // Ctrl Z - Undo
      if (event.key === 'z' || event.key === 'Z') {
        if (event.ctrlKey || event.metaKey) {
          if (event.shiftKey) {
            // Ctrl Shift Z - Redo
            event.preventDefault();
            handleRedo();
          } else {
            // Ctrl Z - Undo
            event.preventDefault();
            handleUndo();
          }
        }
      }

      // Ctrl Y - Redo
      if (event.key === 'y' || event.key === 'Y') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handleRedo();
        }
      }

      // Ctrl F - Open search
      if (event.key === 'f' || event.key === 'F') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          setShowSearch(true);
        }
      }

      // F3 - Next search result
      if (event.key === 'F3') {
        event.preventDefault();
        if (event.shiftKey) {
          handlePreviousResult();
        } else {
          handleNextResult();
        }
      }

      // Escape - Close panels
      if (event.key === 'Escape') {
        if (showSearch) {
          setShowSearch(false);
        }
        if (showNotesPanel) {
          setShowNotesPanel(false);
        }
        if (showSaveHistory) {
          setShowSaveHistory(false);
        }
        if (showHistoryPanel) {
          setShowHistoryPanel(false);
        }
        if (showStatistics) {
          setShowStatistics(false);
        }
        if (showShortcuts) {
          setShowShortcuts(false);
        }
        if (showAIAssistant) {
          setShowAIAssistant(false);
        }
        if (showCommentsPanel) {
          setShowCommentsPanel(false);
        }
        if (showWebhookPanel) {
          setShowWebhookPanel(false);
        }
        if (showCalendarPanel) {
          setShowCalendarPanel(false);
        }
        if (showEmailPanel) {
          setShowEmailPanel(false);
        }
        if (showPresentation) {
          setShowPresentation(false);
        }
        if (show3DView) {
          setShow3DView(false);
        }
        if (showTemplatesPanel) {
          setShowTemplatesPanel(false);
        }
        if (showThemeSettings) {
          setShowThemeSettings(false);
        }
        if (crossLinkMode) {
          setCrossLinkMode(false);
          setCrossLinkSource(null);
        }
        if (showBulkOperations || selectedNodeIds.size > 0) {
          handleClearSelection();
        }
      }

      // ? - Show keyboard shortcuts
      if (event.key === '?') {
        event.preventDefault();
        setShowShortcuts(!showShortcuts);
      }

      // Ctrl S - Manual save
      if (event.key === 's' || event.key === 'S') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          saveNow();
        }
      }

      // Ctrl H - Show save history
      if (event.key === 'h' || event.key === 'H') {
        if (event.ctrlKey || event.metaKey) {
          if (event.shiftKey) {
            // Ctrl Shift H - Show undo/redo history
            event.preventDefault();
            setShowHistoryPanel(!showHistoryPanel);
          } else {
            // Ctrl H - Show save history
            event.preventDefault();
            setShowSaveHistory(!showSaveHistory);
          }
        }
      }

      // Ctrl I - Show statistics
      if (event.key === 'i' || event.key === 'I') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          setShowStatistics(!showStatistics);
        }
      }

      // Ctrl Shift A - Open AI Assistant
      if (event.key === 'a' || event.key === 'A') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault();
          setShowAIAssistant(!showAIAssistant);
        }
      }

      // Ctrl Shift C - Toggle Comments Panel
      if (event.key === 'c' || event.key === 'C') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault();
          setShowCommentsPanel(!showCommentsPanel);
        }
      }

      // Ctrl Shift W - Toggle Webhook Integration
      if (event.key === 'w' || event.key === 'W') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault();
          setShowWebhookPanel(!showWebhookPanel);
        }
      }

      // Ctrl Shift D - Toggle Calendar Export (D for Date/Calendar)
      if (event.key === 'd' || event.key === 'D') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault();
          setShowCalendarPanel(!showCalendarPanel);
        }
      }

      // Ctrl Shift E - Toggle Email Integration
      if (event.key === 'e' || event.key === 'E') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault();
          setShowEmailPanel(!showEmailPanel);
        }
      }

      // Ctrl Shift P - Toggle Presentation Mode
      if (event.key === 'p' || event.key === 'P') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault();
          setShowPresentation(!showPresentation);
        }
      }

      // Ctrl Shift 3 - Toggle 3D View
      if (event.key === '3') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault();
          setShow3DView(!show3DView);
        }
      }

      // Ctrl Shift T - Toggle Templates Panel
      if (event.key === 't' || event.key === 'T') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault();
          setShowTemplatesPanel(!showTemplatesPanel);
        }
      }

      // Ctrl Shift ; - Toggle Theme Settings (using ; to avoid conflicts)
      if (event.key === ';') {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          event.preventDefault();
          setShowThemeSettings(!showThemeSettings);
        }
      }

      // Ctrl A - Select all nodes
      if (event.key === 'a' || event.key === 'A') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handleSelectAll();
        }
      }

      // Delete/Backspace - Bulk delete if multiple selected
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeIds.size > 1) {
        event.preventDefault();
        handleBulkDelete();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedNodeIds, nodes, edges, zoomIn, zoomOut, fitView, showNotesPanel, canUndo, canRedo, showSearch, showSaveHistory, showHistoryPanel, showStatistics, showShortcuts, showAIAssistant, showCommentsPanel, showWebhookPanel, showCalendarPanel, showEmailPanel, showPresentation, show3DView, showTemplatesPanel, showThemeSettings, showBulkOperations, crossLinkMode, searchResults, currentResultIndex, saveNow]);

  const createChildNode = (parentId: string) => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;

    const newNode: Node<MindMapNodeData> = {
      id: generateId(),
      type: 'mindmap',
      position: {
        x: parent.position.x + 250,
        y: parent.position.y + Math.random() * 50,
      },
      data: { label: 'New Node', lastModified: Date.now() },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [
      ...eds,
      {
        id: `${parentId}-${newNode.id}`,
        source: parentId,
        target: newNode.id,
        type: 'smoothstep',
      },
    ]);
    setSelectedNodeId(newNode.id);

    // Trigger edit mode for the new node
    setTimeout(() => {
      const event = new CustomEvent('triggerNodeEdit', {
        detail: { nodeId: newNode.id },
      });
      window.dispatchEvent(event);
    }, 100);
  };

  const createSiblingNode = (siblingId: string) => {
    const sibling = nodes.find((n) => n.id === siblingId);
    if (!sibling) return;

    // Find parent edge
    const parentEdge = edges.find((e) => e.target === siblingId);
    if (!parentEdge) {
      // Root node - create a new root sibling
      const newNode: Node<MindMapNodeData> = {
        id: generateId(),
        type: 'mindmap',
        position: {
          x: sibling.position.x,
          y: sibling.position.y + 100,
        },
        data: { label: 'New Node', lastModified: Date.now() },
      };
      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(newNode.id);

      // Trigger edit mode for the new node
      setTimeout(() => {
        const event = new CustomEvent('triggerNodeEdit', {
          detail: { nodeId: newNode.id },
        });
        window.dispatchEvent(event);
      }, 100);
      return;
    }

    const newNode: Node<MindMapNodeData> = {
      id: generateId(),
      type: 'mindmap',
      position: {
        x: sibling.position.x,
        y: sibling.position.y + 100,
      },
      data: { label: 'New Node', lastModified: Date.now() },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [
      ...eds,
      {
        id: `${parentEdge.source}-${newNode.id}`,
        source: parentEdge.source,
        target: newNode.id,
        type: 'smoothstep',
      },
    ]);
    setSelectedNodeId(newNode.id);

    // Trigger edit mode for the new node
    setTimeout(() => {
      const event = new CustomEvent('triggerNodeEdit', {
        detail: { nodeId: newNode.id },
      });
      window.dispatchEvent(event);
    }, 100);
  };

  const deleteNode = (nodeId: string) => {
    // Don't delete if it's the only node
    if (nodes.length === 1) return;

    // Find all descendants
    const descendants = new Set<string>([nodeId]);
    let added = true;

    while (added) {
      added = false;
      edges.forEach((edge) => {
        if (descendants.has(edge.source) && !descendants.has(edge.target)) {
          descendants.add(edge.target);
          added = true;
        }
      });
    }

    setNodes((nds) => nds.filter((n) => !descendants.has(n.id)));
    setEdges((eds) => eds.filter((e) => !descendants.has(e.source) && !descendants.has(e.target)));
    setSelectedNodeId(null);
  };

  const editNode = (nodeId: string) => {
    const nodeElement = document.querySelector(`[data-nodeid="${nodeId}"] .node-content`) as HTMLElement;
    if (nodeElement) {
      nodeElement.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(nodeElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const toggleCollapse = (nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              collapsed: !node.data.collapsed,
            },
          };
        }
        return node;
      })
    );
  };

  const handleRestoreFromHistory = (index: number) => {
    const slot = restoreFromHistory(index);
    if (slot) {
      setNodes(slot.nodes);
      setEdges(slot.edges);
      setShowSaveHistory(false);
    }
  };

  const handleConflictRestore = () => {
    if (conflictSlot) {
      setNodes(conflictSlot.nodes);
      setEdges(conflictSlot.edges);
      setConflictSlot(null);
    }
  };

  const handleJumpToHistory = (index: number, fromPast: boolean) => {
    const state = jumpToHistory(index, fromPast);
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  };

  const saveToFile = (format: 'json' | 'freemind' | 'opml' | 'markdown' | 'd2' | 'yaml' | 'pdf' | 'powerpoint' | 'presentation') => {
    const tree = flowToTree(nodes, edges);
    if (!tree) return;

    // Handle special export formats
    if (format === 'pdf') {
      exportToPDF(tree);
      return;
    }

    if (format === 'powerpoint') {
      exportToPowerPoint(tree);
      return;
    }

    if (format === 'presentation') {
      createPresentation(tree);
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = stringifyJSON(tree);
        filename = 'mindmap.json';
        mimeType = 'application/json';
        break;
      case 'freemind':
        content = toFreeMind(tree);
        filename = 'mindmap.mm';
        mimeType = 'application/xml';
        break;
      case 'opml':
        content = toOPML(tree);
        filename = 'mindmap.opml';
        mimeType = 'application/xml';
        break;
      case 'markdown':
        content = toMarkdown(tree);
        filename = 'mindmap.md';
        mimeType = 'text/markdown';
        break;
      case 'd2':
        content = toD2(tree);
        filename = 'mindmap.d2';
        mimeType = 'text/plain';
        break;
      case 'yaml':
        content = toYaml(tree);
        filename = 'mindmap.yaml';
        mimeType = 'text/yaml';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadFromFile = (format: 'json' | 'freemind' | 'opml' | 'markdown' | 'yaml') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept =
      format === 'json'
        ? '.json'
        : format === 'freemind'
        ? '.mm'
        : format === 'opml'
        ? '.opml'
        : format === 'yaml'
        ? '.yaml,.yml'
        : '.md';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      let tree: MindMapTree;

      try {
        switch (format) {
          case 'json':
            tree = parseJSON(text);
            break;
          case 'freemind':
            tree = parseFreeMind(text);
            break;
          case 'opml':
            tree = parseOPML(text);
            break;
          case 'markdown':
            tree = parseMarkdown(text);
            break;
          case 'yaml':
            tree = parseYaml(text);
            break;
        }

        const { nodes: newNodes, edges: newEdges } = treeToFlow(tree);
        setNodes(newNodes);
        setEdges(newEdges);
      } catch (error) {
        alert(`Error loading file: ${error}`);
      }
    };

    input.click();
  };

  const exportAsPNG = () => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // For simplicity, we'll create an SVG first and then draw it to canvas
    // This is a basic implementation - a more robust solution would use html2canvas
    const svgElement = document.querySelector('.react-flow__viewport') as SVGElement;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // Download the image
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'mindmap.png';
      a.click();
    };

    img.src = url;
  };

  const exportAsSVG = () => {
    const svgElement = document.querySelector('.react-flow__viewport') as SVGElement;
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    // Add namespaces
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // Add XML declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    // Create blob and download
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.svg';
    a.click();
  };

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
            handleNodeClickForCrossLink(node.id);
          } else if (event.shiftKey) {
            // Shift+click - Toggle node in multi-selection
            handleMultiSelectToggle(node.id, true);
          } else {
            // Regular click - Clear multi-selection and select single node
            if (selectedNodeIds.size > 0) {
              handleClearSelection();
            }
            setSelectedNodeId(node.id);
          }
        }}
        onPaneClick={() => {
          setSelectedNodeId(null);
          handleClearSelection();
          if (crossLinkMode) {
            setCrossLinkMode(false);
            setCrossLinkSource(null);
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
              availableIcons={Array.from(new Set(nodes.map(n => n.data.icon).filter((i): i is string => Boolean(i))))}
              availableClouds={Array.from(new Set(nodes.map(n => n.data.cloud?.color).filter((c): c is string => Boolean(c))))}
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
            <button onClick={() => downloadMarkdown(flowToTree(nodes, edges)!, 'notion.md')}>Notion/Obsidian</button>
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
            <strong>Shortcuts:</strong><br />
            Tab - Create child<br />
            Enter - Create sibling<br />
            Delete - Remove node<br />
            F2 - Edit text<br />
            Space - Toggle collapse<br />
            <strong>Multi-Select:</strong> Shift+Click<br />
            <strong>Select All:</strong> Ctrl+A<br />
            <strong>Zoom:</strong> Ctrl +/-/0<br />
            <strong>Notes:</strong> F3 / Ctrl+N<br />
            <strong>Stats:</strong> Ctrl+I<br />
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
        onSave={(notes) => {
          if (selectedNodeId) {
            handleUpdateMetadata({
              ...(selectedNode?.data.metadata || {}),
              notes: notes || undefined,
            });
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
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}

      {/* Bulk Operations Panel */}
      {showBulkOperations && selectedNodeIds.size > 1 && (
        <BulkOperationsPanel
          selectedCount={selectedNodeIds.size}
          onBulkDelete={handleBulkDelete}
          onBulkIconChange={handleBulkIconChange}
          onBulkCloudChange={handleBulkCloudChange}
          onBulkColorChange={handleBulkColorChange}
          availableIcons={Array.from(new Set(nodes.map(n => n.data.icon).filter((i): i is string => Boolean(i))))}
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
      <AIAssistantPanel
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onGenerateMindMap={handleAIGenerateMindMap}
        onSuggestIdeas={handleAISuggestIdeas}
        onSummarizeBranch={handleAISummarizeBranch}
        selectedNodeId={selectedNodeId}
      />

      {/* Comments Panel */}
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

      {/* Presence Indicator */}
      <PresenceIndicator users={onlineUsers} currentUser={currentUser} />

      {/* Webhook Integration Panel */}
      <WebhookIntegrationPanel
        visible={showWebhookPanel}
        onClose={() => setShowWebhookPanel(false)}
        tree={flowToTree(nodes, edges)}
        onWebhookData={(data) => {
          if (data.parentId) {
            createChildNode(data.parentId);
          }
        }}
      />

      {/* Calendar Export Panel */}
      <CalendarExportPanel
        visible={showCalendarPanel}
        onClose={() => setShowCalendarPanel(false)}
        tree={flowToTree(nodes, edges)}
      />

      {/* Email Integration Panel */}
      <EmailIntegrationPanel
        visible={showEmailPanel}
        onClose={() => setShowEmailPanel(false)}
        tree={flowToTree(nodes, edges)}
      />

      {/* Presentation Mode */}
      {showPresentation && (
        <PresentationMode
          visible={showPresentation}
          onClose={() => setShowPresentation(false)}
          tree={flowToTree(nodes, edges)}
        />
      )}

      {/* 3D View */}
      {show3DView && (
        <ThreeDView
          visible={show3DView}
          onClose={() => setShow3DView(false)}
          tree={flowToTree(nodes, edges)}
        />
      )}

      {/* Templates Panel */}
      <TemplatesPanel
        visible={showTemplatesPanel}
        onClose={() => setShowTemplatesPanel(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Theme Settings Panel */}
      <ThemeSettingsPanel
        visible={showThemeSettings}
        onClose={() => setShowThemeSettings(false)}
        onThemeChange={() => {
          // Theme change handled by the panel itself
        }}
      />
    </div>
  );
}

export default function MindMapCanvasWrapper(props: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapCanvas {...props} />
    </ReactFlowProvider>
  );
}
