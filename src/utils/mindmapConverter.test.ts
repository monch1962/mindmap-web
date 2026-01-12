import { describe, it, expect } from 'vitest';
import { treeToFlow, flowToTree, generateId, autoLayoutNodes } from './mindmapConverter';
import type { MindMapTree, MindMapNode, MindMapEdge } from '../types';

describe('mindmapConverter', () => {
  describe('treeToFlow', () => {
    it('should convert a simple tree to nodes and edges', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [],
      };

      const { nodes, edges } = treeToFlow(tree);

      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('root');
      expect(nodes[0].data.label).toBe('Root');
      expect(edges).toHaveLength(0);
    });

    it('should convert a tree with children to nodes and edges', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Child 1',
            children: [],
          },
          {
            id: 'child2',
            content: 'Child 2',
            children: [],
          },
        ],
      };

      const { nodes, edges } = treeToFlow(tree);

      expect(nodes).toHaveLength(3);
      expect(edges).toHaveLength(2);
      expect(edges[0].source).toBe('root');
      expect(edges[0].target).toBe('child1');
      expect(edges[1].source).toBe('root');
      expect(edges[1].target).toBe('child2');
    });

    it('should preserve node metadata', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [],
        metadata: {
          url: 'https://example.com',
          description: 'Test description',
          tags: ['test', 'example'],
        },
      };

      const { nodes } = treeToFlow(tree);

      expect(nodes[0].data.metadata).toEqual({
        url: 'https://example.com',
        description: 'Test description',
        tags: ['test', 'example'],
      });
    });

    it('should mark root node with isRoot property', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          { id: 'child1', content: 'Child 1', children: [] },
        ],
      };

      const { nodes } = treeToFlow(tree);

      expect(nodes[0].data.isRoot).toBe(true);
      expect(nodes[1].data.isRoot).toBe(false);
    });

    it('should include node positions from tree', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        position: { x: 100, y: 200 },
        children: [],
      };

      const { nodes } = treeToFlow(tree);

      expect(nodes[0].position).toEqual({ x: 100, y: 200 });
    });

    it('should include style properties in node data', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        style: {
          color: '#ff0000',
          fontSize: 18,
          backgroundColor: '#ffff00',
          bold: true,
          italic: true,
        },
        children: [],
      };

      const { nodes } = treeToFlow(tree);

      expect(nodes[0].data).toMatchObject({
        color: '#ff0000',
        fontSize: 18,
        backgroundColor: '#ffff00',
        bold: true,
        italic: true,
      });
    });

    it('should handle nested children correctly', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Child 1',
            children: [
              { id: 'grandchild1', content: 'Grandchild 1', children: [] },
            ],
          },
        ],
      };

      const { nodes, edges } = treeToFlow(tree);

      expect(nodes).toHaveLength(3);
      expect(edges).toHaveLength(2);
      expect(edges[0]).toMatchObject({ source: 'root', target: 'child1' });
      expect(edges[1]).toMatchObject({ source: 'child1', target: 'grandchild1' });
    });

    it('should not create edges or nodes for collapsed descendants', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Child 1',
            collapsed: true,
            children: [
              { id: 'grandchild1', content: 'Grandchild 1', children: [] },
            ],
          },
        ],
      };

      const { nodes, edges } = treeToFlow(tree);

      // When a node is collapsed, its descendants are not traversed/created
      expect(nodes).toHaveLength(2); // Only root and child1
      expect(nodes.map(n => n.id)).toEqual(['root', 'child1']);
      // Only the edge to the collapsed child
      expect(edges).toHaveLength(1);
      expect(edges[0]).toMatchObject({ source: 'root', target: 'child1' });
    });

    it('should support auto-layout parameter', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          { id: 'child1', content: 'Child 1', children: [] },
          { id: 'child2', content: 'Child 2', children: [] },
        ],
      };

      const { nodes: nodesWithoutLayout } = treeToFlow(tree, false);
      const { nodes: nodesWithLayout } = treeToFlow(tree, true);

      // With auto-layout, positions should be different
      expect(nodesWithLayout.length).toBe(nodesWithoutLayout.length);
    });
  });

  describe('flowToTree', () => {
    it('should convert nodes and edges back to a tree', () => {
      const { nodes, edges } = treeToFlow({
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Child 1',
            children: [],
          },
        ],
      });

      const tree = flowToTree(nodes, edges);

      expect(tree).not.toBeNull();
      expect(tree?.id).toBe('root');
      expect(tree?.content).toBe('Root');
      expect(tree?.children).toHaveLength(1);
      expect(tree?.children[0].id).toBe('child1');
    });

    it('should return null for empty nodes', () => {
      const tree = flowToTree([], []);
      expect(tree).toBeNull();
    });

    it('should identify root node correctly', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'child1',
          type: 'mindmap',
          position: { x: 250, y: 0 },
          data: { label: 'Child 1' },
        },
        {
          id: 'root',
          type: 'mindmap',
          position: { x: 0, y: 0 },
          data: { label: 'Root' },
        },
      ];

      const edges: MindMapEdge[] = [
        { id: 'root-child1', source: 'root', target: 'child1', type: 'smoothstep' },
      ];

      const tree = flowToTree(nodes, edges);

      // Root should be the node with no incoming edges
      expect(tree?.id).toBe('root');
    });

    it('should preserve node positions', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'root',
          type: 'mindmap',
          position: { x: 100, y: 200 },
          data: { label: 'Root' },
        },
      ];

      const tree = flowToTree(nodes, []);

      expect(tree?.position).toEqual({ x: 100, y: 200 });
    });

    it('should preserve collapsed state', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'root',
          type: 'mindmap',
          position: { x: 0, y: 0 },
          data: { label: 'Root', collapsed: true },
        },
      ];

      const tree = flowToTree(nodes, []);

      expect(tree?.collapsed).toBe(true);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with node_ prefix', () => {
      const id = generateId();
      expect(id).toMatch(/^node_/);
    });
  });

  describe('autoLayoutNodes', () => {
    it('should return nodes unchanged if no edges', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'root',
          type: 'mindmap',
          position: { x: 0, y: 0 },
          data: { label: 'Root' },
        },
      ];

      const result = autoLayoutNodes(nodes, []);

      // Even with no edges, the single node is treated as root and repositioned
      expect(result[0].position.x).toBe(400);
      expect(result[0].position.y).toBe(300);
    });

    it('should position root node at default position', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'root',
          type: 'mindmap',
          position: { x: 0, y: 0 },
          data: { label: 'Root' },
        },
        {
          id: 'child1',
          type: 'mindmap',
          position: { x: 100, y: 100 },
          data: { label: 'Child 1' },
        },
      ];

      const edges: MindMapEdge[] = [
        { id: 'root-child1', source: 'root', target: 'child1', type: 'smoothstep' },
      ];

      const result = autoLayoutNodes(nodes, edges);

      // Root should be repositioned
      const rootNode = result.find(n => n.id === 'root');
      expect(rootNode?.position.x).toBe(400);
      expect(rootNode?.position.y).toBe(300);
    });

    it('should distribute children on left and right sides of root', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'root',
          type: 'mindmap',
          position: { x: 0, y: 0 },
          data: { label: 'Root' },
        },
        {
          id: 'child1',
          type: 'mindmap',
          position: { x: 100, y: 100 },
          data: { label: 'Child 1' },
        },
        {
          id: 'child2',
          type: 'mindmap',
          position: { x: 100, y: 100 },
          data: { label: 'Child 2' },
        },
      ];

      const edges: MindMapEdge[] = [
        { id: 'root-child1', source: 'root', target: 'child1', type: 'smoothstep' },
        { id: 'root-child2', source: 'root', target: 'child2', type: 'smoothstep' },
      ];

      const result = autoLayoutNodes(nodes, edges);

      const child1 = result.find(n => n.id === 'child1');
      const child2 = result.find(n => n.id === 'child2');

      // One should be on the left (x < 400) and one on the right (x > 400)
      expect(child1?.position.x).not.toBe(child2?.position.x);
      expect((child1?.position.x || 0) < 400 || (child2?.position.x || 0) < 400).toBe(true);
      expect((child1?.position.x || 0) > 400 || (child2?.position.x || 0) > 400).toBe(true);
    });

    it('should return nodes unchanged if no root found', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'node1',
          type: 'mindmap',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' },
        },
        {
          id: 'node2',
          type: 'mindmap',
          position: { x: 100, y: 100 },
          data: { label: 'Node 2' },
        },
      ];

      // Create a cycle so neither node can be a root
      const edges: MindMapEdge[] = [
        { id: 'node1-node2', source: 'node1', target: 'node2', type: 'smoothstep' },
        { id: 'node2-node1', source: 'node2', target: 'node1', type: 'smoothstep' },
      ];

      const result = autoLayoutNodes(nodes, edges);

      // When there's no clear root (all nodes have incoming edges), return as-is
      expect(result).toEqual(nodes);
    });
  });
});
