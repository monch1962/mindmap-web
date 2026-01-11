import { describe, it, expect } from 'vitest';
import { treeToFlow, flowToTree, generateId } from './mindmapConverter';
import type { MindMapTree } from '../types';

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

    it('should preserve metadata', () => {
      const { nodes, edges } = treeToFlow({
        id: 'root',
        content: 'Root',
        children: [],
        metadata: {
          url: 'https://example.com',
        },
      });

      const tree = flowToTree(nodes, edges);

      expect(tree?.metadata).toEqual({
        url: 'https://example.com',
      });
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
});
