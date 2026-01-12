import type { MindMapNode, MindMapEdge, MindMapTree } from '../types';

/**
 * Auto-layout nodes in a hierarchical tree structure
 * Uses a left/right balanced layout to prevent edge overlap
 */
export function autoLayoutNodes(
  nodes: MindMapNode[],
  edges: MindMapEdge[],
): MindMapNode[] {
  // Build adjacency map and tree structure
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

  if (!rootNode) return nodes;

  // Layout constants
  const LEVEL_WIDTH = 300; // Horizontal spacing between levels
  const NODE_HEIGHT = 80; // Vertical spacing between nodes
  const ROOT_X = 400; // Center X position for root
  const ROOT_Y = 300; // Center Y position for root

  const positionedNodes = new Map<string, { x: number; y: number }>();

  // Calculate subtree height for each node
  function getSubtreeHeight(nodeId: string): number {
    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) return NODE_HEIGHT;

    let totalHeight = 0;
    children.forEach((childId) => {
      totalHeight += getSubtreeHeight(childId);
    });

    return totalHeight;
  }

  // Layout nodes with left/right balancing
  function layoutNode(
    nodeId: string,
    x: number,
    yStart: number,
    side: 'left' | 'right' | 'root',
  ): number {
    // Position current node
    positionedNodes.set(nodeId, { x, y: yStart });

    // Get children
    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) return NODE_HEIGHT;

    // Calculate total height needed for all children
    const totalHeight = children.reduce((sum, childId) => sum + getSubtreeHeight(childId), 0);

    // Split children between left and right sides
    const leftChildren = side === 'root'
      ? children.filter((_, i) => i < children.length / 2)
      : [];
    const rightChildren = side === 'root'
      ? children.filter((_, i) => i >= children.length / 2)
      : children;
    const currentSideChildren = side === 'root' ? [] : children;

    let currentY = yStart - totalHeight / 2; // Start from top of available space

    // Layout left children (for root node)
    if (leftChildren.length > 0) {
      const leftTotalHeight = leftChildren.reduce((sum, id) => sum + getSubtreeHeight(id), 0);
      let leftY = yStart - leftTotalHeight / 2;

      leftChildren.forEach((childId) => {
        const childHeight = layoutNode(
          childId,
          x - LEVEL_WIDTH,
          leftY,
          'left'
        );
        leftY += childHeight;
      });
    }

    // Layout right children (for root node)
    if (rightChildren.length > 0) {
      const rightTotalHeight = rightChildren.reduce((sum, id) => sum + getSubtreeHeight(id), 0);
      let rightY = yStart - rightTotalHeight / 2;

      rightChildren.forEach((childId) => {
        const childHeight = layoutNode(
          childId,
          x + LEVEL_WIDTH,
          rightY,
          'right'
        );
        rightY += childHeight;
      });
    }

    // Layout children on current side (for non-root nodes)
    if (currentSideChildren.length > 0) {
      const direction = side === 'left' ? -1 : 1;
      currentSideChildren.forEach((childId) => {
        const childHeight = layoutNode(
          childId,
          x + direction * LEVEL_WIDTH,
          currentY,
          side
        );
        currentY += childHeight;
      });
    }

    return totalHeight;
  }

  // Start layout from root
  layoutNode(rootNode.id, ROOT_X, ROOT_Y, 'root');

  // Apply new positions to nodes
  return nodes.map((node) => {
    const newPos = positionedNodes.get(node.id);
    return {
      ...node,
      position: newPos || node.position,
    };
  });
}

/**
 * Converts a tree structure to React Flow nodes and edges
 */
export function treeToFlow(tree: MindMapTree, autoLayout = false): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
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
        cloud: node.cloud,
        isRoot: parentId === null, // Mark root node
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

  // Apply auto-layout if requested
  if (autoLayout) {
    return { nodes: autoLayoutNodes(nodes, edges), edges };
  }

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
      cloud: node.data.cloud,
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
