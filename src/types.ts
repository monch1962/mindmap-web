import type { Node, Edge } from 'reactflow'

/**
 * File attachment metadata
 */
export interface FileAttachment {
  id: string
  name: string
  type: 'image' | 'code' | 'file'
  mimeType?: string
  data: string // Base64 encoded data or text content
  size?: number
}

/**
 * Metadata that can be attached to nodes
 */
export interface NodeMetadata {
  url?: string
  description?: string
  notes?: string
  tags?: string[]
  attachments?: FileAttachment[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any // Allow custom metadata fields
}

/**
 * Cloud - visual grouping for nodes (FreeMind-style)
 */
export interface Cloud {
  id: string
  nodeId: string // The root node of this cloud
  color?: string
  width?: number
  height?: number
}

/**
 * Mind map node data structure
 */
export interface MindMapNodeData {
  label: string
  collapsed?: boolean
  color?: string
  fontSize?: number
  backgroundColor?: string
  bold?: boolean
  italic?: boolean
  fontName?: string
  icon?: string
  link?: string
  metadata?: NodeMetadata
  cloud?: {
    color?: string
  }
  lastModified?: number
  // Task tracking
  checked?: boolean
  progress?: number // 0-100
  // Advanced features
  nodeType?: 'default' | 'checkbox' | 'progress' | 'image' | 'code' | 'math'
  imageData?: string // Base64 encoded image
  code?: string
  codeLanguage?: string
  math?: string // LaTeX formula
  isRoot?: boolean // Root node indicator
}

/**
 * Extended mind map node type
 */
export type MindMapNode = Node<MindMapNodeData>

/**
 * Extended mind map edge type
 */
export type MindMapEdge = Edge<{ isCrossLink?: boolean }>

/**
 * Tree structure for serialization and hierarchical operations
 */
export interface MindMapTree {
  id: string
  content: string
  children: MindMapTree[]
  position?: { x: number; y: number }
  collapsed?: boolean
  style?: {
    color?: string
    fontSize?: number
    backgroundColor?: string
    bold?: boolean
    italic?: boolean
    fontName?: string
  }
  metadata?: NodeMetadata
  // FreeMind-specific attributes
  link?: string
  created?: number // timestamp
  modified?: number // timestamp
  icon?: string // FreeMind icon type
  edgeStyle?: {
    color?: string
    width?: number
    style?: 'bezier' | 'linear' | 'sharp_linear' | 'sharp_bezier'
  }
  cloud?: {
    color?: string
  }
}

/**
 * Export format types
 */
export type ExportFormat = 'json' | 'freemind' | 'opml' | 'markdown' | 'd2' | 'svg' | 'png' | 'pdf'

/**
 * File import/export result
 */
export interface FileOperationResult {
  success: boolean
  message?: string
  data?: string
}

/**
 * User type for collaborative features
 */
export interface User {
  id: string
  name: string
  color: string
}

/**
 * Comment type for node comments
 */
export interface Comment {
  id: string
  nodeId: string
  author: string
  authorColor: string
  content: string
  timestamp: number
  resolved: boolean
}

/**
 * State needed for keyboard shortcuts hook
 */
export interface KeyboardShortcutState {
  selectedNodeId: string | null
  selectedNodeIds: Set<string>
  nodes: unknown[]
  edges: unknown[]
  showNotesPanel: boolean
  showSearch: boolean
  showSaveHistory: boolean
  showHistoryPanel: boolean
  showStatistics: boolean
  showShortcuts: boolean
  showAIAssistant: boolean
  showCommentsPanel: boolean
  showWebhookPanel: boolean
  showCalendarPanel: boolean
  showEmailPanel: boolean
  showPresentation: boolean
  show3DView: boolean
  showTemplatesPanel: boolean
  showThemeSettings: boolean
  showBulkOperations: boolean
  crossLinkMode: boolean
  searchResults: string[]
  currentResultIndex: number
  canUndo: boolean
  canRedo: boolean
}

/**
 * Callbacks needed for keyboard shortcuts hook
 */
export interface KeyboardShortcutCallbacks {
  zoomIn: () => void
  zoomOut: () => void
  fitView: () => void
  setShowNotesPanel: (value: boolean) => void
  setShowSearch: (value: boolean) => void
  setShowSaveHistory: (value: boolean) => void
  setShowHistoryPanel: (value: boolean) => void
  setShowStatistics: (value: boolean) => void
  setShowShortcuts: (value: boolean) => void
  setShowAIAssistant: (value: boolean) => void
  setShowCommentsPanel: (value: boolean) => void
  setShowWebhookPanel: (value: boolean) => void
  setShowCalendarPanel: (value: boolean) => void
  setShowEmailPanel: (value: boolean) => void
  setShowPresentation: (value: boolean) => void
  setShow3DView: (value: boolean) => void
  setShowTemplatesPanel: (value: boolean) => void
  setShowThemeSettings: (value: boolean) => void
  setCrossLinkMode: (value: boolean) => void
  setCrossLinkSource: (value: string | null) => void
  createChildNode: (nodeId: string) => void
  createSiblingNode: (nodeId: string) => void
  deleteNode: (nodeId: string) => void
  editNode: (nodeId: string) => void
  toggleCollapse: (nodeId: string) => void
  handleUndo: () => void
  handleRedo: () => void
  handleNextResult: () => void
  handlePreviousResult: () => void
  handleClearSelection: () => void
  handleBulkDelete: () => void
  handleSelectAll: () => void
  saveNow: () => void
  toggleDarkMode: () => void
  setCurrentTheme: (value: 'light' | 'dark') => void
  getEffectiveTheme: () => 'light' | 'dark'
}
