import type { MindMapNode, MindMapEdge, MindMapTree } from '../types';

/**
 * Converts a tree structure to React Flow nodes and edges
 */
export function treeToFlow(tree: MindMapTree): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  function traverse(node: MindMapTree, parentId: string | null = null, depth = 0) {
    // Create node
    nodes.push({
      id: node.id,
      type: 'mindmap',
      position: node.position || { x: depth * 250, y: nodes.length * 100 },
      data: {
        label: node.content,
        collapsed: node.collapsed,
        color: node.style?.color,
        fontSize: node.style?.fontSize,
        backgroundColor: node.style?.backgroundColor,
        bold: node.style?.bold,
        italic: node.style?.italic,
        fontName: node.style?.fontName,
        icon: node.icon,
        link: node.link,
        metadata: node.metadata,
      },
    });

    // Create edge to parent
    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'smoothstep',
        animated: false,
        style: node.edgeStyle?.color || node.edgeStyle?.width || node.edgeStyle?.style
          ? {
              stroke: node.edgeStyle.color,
              strokeWidth: node.edgeStyle.width,
              strokeDasharray: node.edgeStyle?.style === 'linear' ? '0' : undefined,
            }
          : undefined,
      });
    }

    // Recursively process children
    if (node.children && !node.collapsed) {
      node.children.forEach((child) => traverse(child, node.id, depth + 1));
    }
  }

  traverse(tree);
  return { nodes, edges };
}

/**
 * Converts React Flow nodes and edges to a tree structure
 */
export function flowToTree(nodes: MindMapNode[], edges: MindMapEdge[]): MindMapTree | null {
  if (nodes.length === 0) return null;

  // Build adjacency map
  const childrenMap = new Map<string, string[]>();
  const nodeMap = new Map<string, MindMapNode>();

  edges.forEach((edge) => {
    const children = childrenMap.get(edge.source) || [];
    children.push(edge.target);
    childrenMap.set(edge.source, children);
  });

  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
  });

  // Find root (node with no incoming edges)
  const targetIds = new Set(edges.map((e) => e.target));
  const rootNode = nodes.find((n) => !targetIds.has(n.id));

  if (!rootNode) return null;

  function buildTree(nodeId: string): MindMapTree {
    const node = nodeMap.get(nodeId)!;
    const childIds = childrenMap.get(nodeId) || [];

    // Find edge to this node to get edge style
    const edgeToThisNode = edges.find((e) => e.target === nodeId);

    return {
      id: node.id,
      content: node.data.label,
      position: node.position,
      collapsed: node.data.collapsed,
      style: {
        color: node.data.color,
        fontSize: node.data.fontSize,
        backgroundColor: node.data.backgroundColor,
        bold: node.data.bold,
        italic: node.data.italic,
        fontName: node.data.fontName,
      },
      metadata: node.data.metadata,
      icon: node.data.icon,
      link: node.data.link,
      edgeStyle: edgeToThisNode?.style
        ? {
            color: edgeToThisNode.style.stroke as string,
            width: edgeToThisNode.style.strokeWidth as number,
          }
        : undefined,
      children: childIds.map(buildTree),
    };
  }

  return buildTree(rootNode.id);
}

/**
 * Generates a unique ID
 */
export function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
