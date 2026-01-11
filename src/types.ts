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
  [key: string]: any; // Allow custom metadata fields
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
}

/**
 * Extended mind map node type
 */
export type MindMapNode = Node<MindMapNodeData>;

/**
 * Extended mind map edge type
 */
export type MindMapEdge = Edge;

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
