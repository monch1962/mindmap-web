import { describe, it, expect } from 'vitest'
import { toD2, parseD2 } from './d2Format'
import type { MindMapTree } from '../../types'

describe('d2Format', () => {
  describe('toD2', () => {
    it('should generate D2 for single node', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('direction: right')
      expect(d2).toContain('Root: root')
    })

    it('should generate D2 with parent-child connections', () => {
      const tree: MindMapTree = {
        id: 'root-id',
        content: 'Root',
        children: [
          {
            id: 'child-id',
            content: 'Child',
            children: [],
          },
        ],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Root: root_id')
      expect(d2).toContain('root_id.Child: child_id')
    })

    it('should escape quotes in labels', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Node with "quotes"',
        children: [],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Node with \\"quotes\\"')
    })

    it('should handle hyphens in IDs', () => {
      const tree: MindMapTree = {
        id: 'node-with-hyphens',
        content: 'Node',
        children: [
          {
            id: 'child-with-hyphens',
            content: 'Child',
            children: [],
          },
        ],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('node_with_hyphens')
    })

    it('should generate D2 for multiple children', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          { id: 'child1', content: 'Child 1', children: [] },
          { id: 'child2', content: 'Child 2', children: [] },
        ],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Root: root')
      // Multiple children are wrapped in a container
      expect(d2).toContain('root: {')
      expect(d2).toContain('Child 1: child1')
      expect(d2).toContain('Child 2: child2')
      expect(d2).toContain('}')
    })

    it('should handle nested structure', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Child 1',
            children: [
              {
                id: 'grandchild1',
                content: 'Grandchild',
                children: [],
              },
            ],
          },
        ],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Root: root')
      // Single child connects directly
      expect(d2).toContain('root.Child 1: child1')
      // Single grandchild connects directly (no container)
      expect(d2).toContain('child1.Grandchild: grandchild1')
    })

    it('should include stroke color when style.color is set', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        style: { color: '#ff0000' },
        children: [],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Root: root {')
      expect(d2).toContain('  stroke: #ff0000')
      expect(d2).toContain('}')
    })

    it('should include fill color when style.backgroundColor is set', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        style: { backgroundColor: '#00ff00' },
        children: [],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Root: root {')
      expect(d2).toContain('  fill: #00ff00')
      expect(d2).toContain('}')
    })

    it('should include both stroke and fill when both colors are set', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        style: { color: '#ff0000', backgroundColor: '#00ff00' },
        children: [],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Root: root {')
      expect(d2).toContain('  stroke: #ff0000')
      expect(d2).toContain('  fill: #00ff00')
      expect(d2).toContain('}')
    })

    it('should include icon when set', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        icon: 'help',
        children: [],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Root: root {')
      expect(d2).toContain('  icon: help')
      expect(d2).toContain('}')
    })

    it('should include link when metadata.link is set', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Child',
            link: 'https://example.com',
            children: [],
          },
        ],
      }

      const d2 = toD2(tree)

      // Link is only included when node has a parent
      expect(d2).toContain('root.Child: child1')
      expect(d2).toContain('child1: {')
      expect(d2).toContain('  link: https://example.com')
      expect(d2).toContain('}')
    })

    it('should include tooltip when metadata.description is set', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Child',
            icon: 'help', // Need some style to create the block
            metadata: { description: 'This is a tooltip' },
            children: [],
          },
        ],
      }

      const d2 = toD2(tree)

      // Tooltip should be on child node with parent
      expect(d2).toContain('root.Child: child1')
      expect(d2).toContain('child1: {')
      expect(d2).toContain('  tooltip: This is a tooltip')
      expect(d2).toContain('}')
    })

    it('should handle complex tree with all properties', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Project',
        style: { color: '#ff0000', backgroundColor: '#ffffff' },
        icon: 'folder',
        children: [
          {
            id: 'child1',
            content: 'Backend',
            metadata: {
              description: 'Backend services',
            },
            link: 'https://backend.example.com',
            icon: 'server',
            children: [
              {
                id: 'grandchild1',
                content: 'API',
                style: { color: '#00ff00' },
                children: [],
              },
            ],
          },
        ],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('direction: right')
      expect(d2).toContain('Project: root {')
      expect(d2).toContain('  stroke: #ff0000')
      expect(d2).toContain('  fill: #ffffff')
      expect(d2).toContain('  icon: folder')
      expect(d2).toContain('root.Backend: child1')
      expect(d2).toContain('child1: {')
      expect(d2).toContain('  icon: server')
      expect(d2).toContain('  link: https://backend.example.com')
      expect(d2).toContain('  tooltip: Backend services')
      expect(d2).toContain('child1.API: grandchild1')
      expect(d2).toContain('grandchild1: {')
      expect(d2).toContain('  stroke: #00ff00')
    })

    it('should handle single child without container', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Only Child',
            children: [],
          },
        ],
      }

      const d2 = toD2(tree)

      // Single child should use direct connection
      expect(d2).toContain('root.Only Child: child1')
    })

    it('should handle multiple children with container', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          { id: 'child1', content: 'Child 1', children: [] },
          { id: 'child2', content: 'Child 2', children: [] },
        ],
      }

      const d2 = toD2(tree)

      // Multiple children should be in a container
      expect(d2).toContain('root: {')
      expect(d2).toContain('}')
    })

    it('should preserve order of children', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          { id: '1', content: 'First', children: [] },
          { id: '2', content: 'Second', children: [] },
          { id: '3', content: 'Third', children: [] },
        ],
      }

      const d2 = toD2(tree)

      const firstIndex = d2.indexOf('First')
      const secondIndex = d2.indexOf('Second')
      const thirdIndex = d2.indexOf('Third')

      expect(firstIndex).toBeLessThan(secondIndex)
      expect(secondIndex).toBeLessThan(thirdIndex)
    })

    it('should handle special characters in content', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Node with \\n newline and "quotes"',
        children: [],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Node with \\n newline')
      expect(d2).toContain('\\"quotes\\"')
    })

    it('should handle empty content', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: '',
        children: [],
      }

      const d2 = toD2(tree)

      expect(d2).toContain(': root')
    })
  })

  describe('parseD2', () => {
    it('should throw error when attempting to parse D2', () => {
      const d2 = 'direction: right\nRoot: root'

      expect(() => parseD2(d2)).toThrow(
        'D2 import is not yet supported. Please use JSON, FreeMind, OPML, or Markdown formats for importing.'
      )
    })

    it('should throw error for empty string', () => {
      expect(() => parseD2('')).toThrow(
        'D2 import is not yet supported. Please use JSON, FreeMind, OPML, or Markdown formats for importing.'
      )
    })

    it('should throw error for any D2 input', () => {
      const d2Inputs = ['Simple node', 'direction: right\nA -> B', 'A: {\n  shape: rectangle\n}']

      d2Inputs.forEach(input => {
        expect(() => parseD2(input)).toThrow(
          'D2 import is not yet supported. Please use JSON, FreeMind, OPML, or Markdown formats for importing.'
        )
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle very long content', () => {
      const longContent = 'A'.repeat(1000)
      const tree: MindMapTree = {
        id: 'root',
        content: longContent,
        children: [],
      }

      const d2 = toD2(tree)

      expect(d2).toContain(longContent)
    })

    it('should handle unicode characters', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: '中文 日本語 한국어',
        children: [],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('中文 日本語 한국어')
    })

    it('should handle deeply nested structure', () => {
      const tree: MindMapTree = {
        id: '1',
        content: 'Level 1',
        children: [
          {
            id: '2',
            content: 'Level 2',
            children: [
              {
                id: '3',
                content: 'Level 3',
                children: [
                  {
                    id: '4',
                    content: 'Level 4',
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Level 1: 1')
      // Single child creates direct connection (no container)
      expect(d2).toContain('1.Level 2: 2')
      expect(d2).toContain('2.Level 3: 3')
      expect(d2).toContain('3.Level 4: 4')
    })

    it('should handle node with only icon, no content styling', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        icon: 'help',
        children: [],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Root: root {')
      expect(d2).toContain('  icon: help')
      expect(d2).toContain('}')
    })

    it('should handle node with multiple styles', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        style: { color: '#ff0000', backgroundColor: '#00ff00', fontSize: 14, bold: true },
        children: [],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Root: root {')
      expect(d2).toContain('  stroke: #ff0000')
      expect(d2).toContain('  fill: #00ff00')
      // fontSize and fontWeight are not supported in D2 export
      expect(d2).toContain('}')
    })

    it('should handle tree with single child that has children', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Child',
            children: [
              { id: 'grandchild1', content: 'Grandchild 1', children: [] },
              { id: 'grandchild2', content: 'Grandchild 2', children: [] },
            ],
          },
        ],
      }

      const d2 = toD2(tree)

      expect(d2).toContain('Root: root')
      // Single child connects directly
      expect(d2).toContain('root.Child: child1')
      // Child with multiple children creates container
      expect(d2).toContain('child1: {')
      expect(d2).toContain('Grandchild 1: grandchild1')
      expect(d2).toContain('Grandchild 2: grandchild2')
      expect(d2).toContain('}')
    })
  })
})
