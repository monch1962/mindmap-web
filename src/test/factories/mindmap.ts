// Factory functions for creating test mind map data
import type {
  MindMapTree,
  MindMapNode,
  MindMapNodeData,
  NodeMetadata,
  FileAttachment,
} from '../../types'
import { generateId } from '../../utils/mindmapConverter'

/**
 * Create a test mind map tree
 */
export const createMindMapTree = (overrides?: Partial<MindMapTree>): MindMapTree => {
  const id = overrides?.id || `mindmap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  return {
    id,
    content: 'Central Topic',
    children: [],
    position: { x: 0, y: 0 },
    collapsed: false,
    style: {
      color: '#000000',
      fontSize: 16,
      backgroundColor: '#ffffff',
      bold: false,
      italic: false,
      fontName: 'Arial',
    },
    metadata: {
      description: 'Test mind map description',
      tags: ['test', 'sample'],
      notes: 'This is a test mind map',
    },
    link: 'https://example.com',
    created: Date.now(),
    modified: Date.now(),
    icon: 'smiley',
    edgeStyle: {
      color: '#cccccc',
      width: 2,
      style: 'bezier',
    },
    cloud: {
      color: '#e6f3ff',
    },
    ...overrides,
  }
}

/**
 * Create a test mind map node
 */
export const createMindMapNode = (overrides?: Partial<MindMapNode>): MindMapNode => {
  const id = overrides?.id || generateId()

  return {
    id,
    type: 'mindmap',
    position: { x: 0, y: 0 },
    data: createNodeData(),
    ...overrides,
  }
}

/**
 * Create test node data
 */
export const createNodeData = (overrides?: Partial<MindMapNodeData>): MindMapNodeData => ({
  label: 'Test Node',
  collapsed: false,
  color: '#000000',
  fontSize: 14,
  backgroundColor: '#ffffff',
  bold: false,
  italic: false,
  fontName: 'Arial',
  icon: 'idea',
  link: 'https://example.com',
  metadata: createNodeMetadata(),
  cloud: {
    color: '#e6f3ff',
  },
  lastModified: Date.now(),
  checked: false,
  progress: 0,
  nodeType: 'default',
  isRoot: false,
  ...overrides,
})

/**
 * Create test node metadata
 */
export const createNodeMetadata = (overrides?: Partial<NodeMetadata>): NodeMetadata => ({
  url: 'https://example.com',
  description: 'Test node description',
  notes: 'Test notes for the node',
  tags: ['important', 'todo'],
  attachments: [createFileAttachment()],
  customField: 'custom value',
  ...overrides,
})

/**
 * Create test file attachment
 */
export const createFileAttachment = (overrides?: Partial<FileAttachment>): FileAttachment => ({
  id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: 'test-file.txt',
  type: 'file',
  mimeType: 'text/plain',
  data: 'VGhpcyBpcyBhIHRlc3QgZmlsZQ==', // Base64 encoded "This is a test file"
  size: 1024,
  ...overrides,
})

/**
 * Create a hierarchical mind map tree with children
 */
export const createHierarchicalMindMap = (depth = 3, breadth = 2): MindMapTree => {
  const root = createMindMapTree({ content: 'Root Topic' })

  const addChildren = (parent: MindMapTree, currentDepth: number) => {
    if (currentDepth >= depth) return

    for (let i = 0; i < breadth; i++) {
      const child = createMindMapTree({
        content: `Child ${currentDepth}.${i + 1}`,
        position: { x: (i + 1) * 200, y: currentDepth * 100 },
      })

      addChildren(child, currentDepth + 1)
      parent.children.push(child)
    }
  }

  addChildren(root, 1)
  return root
}

/**
 * Create a list of mind map nodes for testing
 */
export const createNodeList = (count = 5): MindMapNode[] => {
  const nodes: MindMapNode[] = []

  // Create root node
  nodes.push(
    createMindMapNode({
      id: 'root',
      position: { x: 0, y: 0 },
      data: createNodeData({ label: 'Central Topic', isRoot: true }),
    })
  )

  // Create child nodes
  for (let i = 0; i < count - 1; i++) {
    nodes.push(
      createMindMapNode({
        id: `node-${i + 1}`,
        position: { x: (i + 1) * 150, y: 100 },
        data: createNodeData({ label: `Child Node ${i + 1}` }),
      })
    )
  }

  return nodes
}

/**
 * Create test edges between nodes
 */
export const createEdges = (nodeIds: string[]) => {
  const edges = []

  // Connect all child nodes to root
  for (let i = 1; i < nodeIds.length; i++) {
    edges.push({
      id: `edge-${i}`,
      source: 'root',
      target: nodeIds[i],
      type: 'default',
    })
  }

  return edges
}
