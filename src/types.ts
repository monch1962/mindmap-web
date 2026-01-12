import type { Node, Edge } from 'reactflow';

/**
 * File attachment metadata
 */
export interface FileAttachment {
  id: string;
  name: string;
  type: 'image' | 'code' | 'file';
  mimeType?: string;
  data: string; // Base64 encoded data or text content
  size?: number;
}

/**
 * Metadata that can be attached to nodes
 */
export interface NodeMetadata {
  url?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  attachments?: FileAttachment[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow custom metadata fields
}

/**
 * Cloud - visual grouping for nodes (FreeMind-style)
 */
export interface Cloud {
  id: string;
  nodeId: string; // The root node of this cloud
  color?: string;
  width?: number;
  height?: number;
}

/**
 * Mind map node data structure
 */
export interface MindMapNodeData {
  label: string;
  collapsed?: boolean;
  color?: string;
  fontSize?: number;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  fontName?: string;
  icon?: string;
  link?: string;
  metadata?: NodeMetadata;
  cloud?: {
    color?: string;
  };
  lastModified?: number;
  // Task tracking
  checked?: boolean;
  progress?: number; // 0-100
  // Advanced features
  nodeType?: 'default' | 'checkbox' | 'progress' | 'image' | 'code' | 'math';
  imageData?: string; // Base64 encoded image
  code?: string;
  codeLanguage?: string;
  math?: string; // LaTeX formula
  isRoot?: boolean; // Root node indicator
}

/**
 * Extended mind map node type
 */
export type MindMapNode = Node<MindMapNodeData>;

/**
 * Extended mind map edge type
 */
export type MindMapEdge = Edge<{ isCrossLink?: boolean }>;

/**
 * Tree structure for serialization and hierarchical operations
 */
export interface MindMapTree {
  id: string;
  content: string;
  children: MindMapTree[];
  position?: { x: number; y: number };
  collapsed?: boolean;
  style?: {
    color?: string;
    fontSize?: number;
    backgroundColor?: string;
    bold?: boolean;
    italic?: boolean;
    fontName?: string;
  };
  metadata?: NodeMetadata;
  // FreeMind-specific attributes
  link?: string;
  created?: number; // timestamp
  modified?: number; // timestamp
  icon?: string; // FreeMind icon type
  edgeStyle?: {
    color?: string;
    width?: number;
    style?: 'bezier' | 'linear' | 'sharp_linear' | 'sharp_bezier';
  };
  cloud?: {
    color?: string;
  };
}

/**
 * Export format types
 */
export type ExportFormat = 'json' | 'freemind' | 'opml' | 'markdown' | 'd2' | 'svg' | 'png' | 'pdf';

/**
 * File import/export result
 */
export interface FileOperationResult {
  success: boolean;
  message?: string;
  data?: string;
}
