import { describe, it, expect } from 'vitest'
import { parseMarkdown, toMarkdown } from './markdownFormat'
import type { MindMapTree } from '../../types'

describe('markdownFormat', () => {
  describe('parseMarkdown', () => {
    it('should parse single line markdown', () => {
      const markdown = 'Root Topic'

      const tree = parseMarkdown(markdown)

      expect(tree).toHaveProperty('id')
      expect(tree.content).toBe('Root Topic')
      expect(tree.children).toEqual([])
    })

    it('should parse nested structure with 2-space indentation', () => {
      const markdown = `Root
  Child 1
  Child 2
    Grandchild 2.1
  Child 3`

      const tree = parseMarkdown(markdown)

      expect(tree.content).toBe('Root')
      expect(tree.children).toHaveLength(3)
      expect(tree.children[0].content).toBe('Child 1')
      expect(tree.children[1].content).toBe('Child 2')
      expect(tree.children[2].content).toBe('Child 3')
      expect(tree.children[1].children[0].content).toBe('Grandchild 2.1')
    })

    it('should parse nested structure with tabs', () => {
      const markdown = `Root
\tChild 1
\t\tGrandchild 1.1
\tChild 2`

      const tree = parseMarkdown(markdown)

      expect(tree.content).toBe('Root')
      expect(tree.children).toHaveLength(2)
      expect(tree.children[0].children[0].content).toBe('Grandchild 1.1')
    })

    it('should parse mixed spaces and tabs', () => {
      const markdown = `Root
  Child 1
\tChild 2`

      const tree = parseMarkdown(markdown)

      expect(tree.content).toBe('Root')
      expect(tree.children).toHaveLength(2)
    })

    it('should handle empty lines', () => {
      const markdown = `Root

  Child 1


  Child 2`

      const tree = parseMarkdown(markdown)

      expect(tree.content).toBe('Root')
      expect(tree.children).toHaveLength(2)
    })

    it('should handle markdown with only whitespace', () => {
      const markdown = '   \n  \n   '

      const tree = parseMarkdown(markdown)

      expect(tree.content).toBe('Root')
      expect(tree.children).toEqual([])
    })

    it('should handle empty string', () => {
      const markdown = ''

      const tree = parseMarkdown(markdown)

      expect(tree.content).toBe('Root')
      expect(tree.children).toEqual([])
    })

    it('should parse deeply nested structure', () => {
      const markdown = `Level 1
  Level 2
    Level 3
      Level 4
        Level 5`

      const tree = parseMarkdown(markdown)

      expect(tree.content).toBe('Level 1')
      expect(tree.children[0].content).toBe('Level 2')
      expect(tree.children[0].children[0].content).toBe('Level 3')
      expect(tree.children[0].children[0].children[0].content).toBe('Level 4')
      expect(tree.children[0].children[0].children[0].children[0].content).toBe('Level 5')
    })

    it('should handle inconsistent indentation', () => {
      const markdown = `Root
    Child 1 (4 spaces)
  Child 2 (2 spaces)
       Child 2.1 (7 spaces)`

      const tree = parseMarkdown(markdown)

      expect(tree.content).toBe('Root')
      expect(tree.children).toHaveLength(2)
      // Child with 4 spaces should be child of root (indent level 2)
      expect(tree.children[0].content).toBe('Child 1 (4 spaces)')
      // Child with 2 spaces should also be child of root (indent level 1)
      expect(tree.children[1].content).toBe('Child 2 (2 spaces)')
      // Child with 7 spaces should be child of previous (indent level 3)
      expect(tree.children[1].children[0].content).toBe('Child 2.1 (7 spaces)')
    })

    it('should handle nodes with same content at different levels', () => {
      const markdown = `Topic
  Topic
    Topic`

      const tree = parseMarkdown(markdown)

      expect(tree.content).toBe('Topic')
      expect(tree.children[0].content).toBe('Topic')
      expect(tree.children[0].children[0].content).toBe('Topic')
    })

    it('should trim whitespace from content', () => {
      const markdown = `Root
  Child with spaces
  Another child`

      const tree = parseMarkdown(markdown)

      expect(tree.children[0].content).toBe('Child with spaces')
      expect(tree.children[1].content).toBe('Another child')
    })

    it('should handle complex hierarchy', () => {
      const markdown = `Project
  Backend
    API
    Database
  Frontend
    React
    CSS
  Testing
    Unit tests
    Integration tests`

      const tree = parseMarkdown(markdown)

      expect(tree.content).toBe('Project')
      expect(tree.children).toHaveLength(3)

      expect(tree.children[0].content).toBe('Backend')
      expect(tree.children[0].children[0].content).toBe('API')
      expect(tree.children[0].children[1].content).toBe('Database')

      expect(tree.children[1].content).toBe('Frontend')
      expect(tree.children[1].children[0].content).toBe('React')
      expect(tree.children[1].children[1].content).toBe('CSS')

      expect(tree.children[2].content).toBe('Testing')
      expect(tree.children[2].children[0].content).toBe('Unit tests')
      expect(tree.children[2].children[1].content).toBe('Integration tests')
    })
  })

  describe('toMarkdown', () => {
    it('should generate markdown for single node', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root Topic',
        children: [],
      }

      const markdown = toMarkdown(tree)

      expect(markdown).toBe('Root Topic')
    })

    it('should generate indented markdown for nested structure', () => {
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
          {
            id: 'child2',
            content: 'Child 2',
            children: [],
          },
        ],
      }

      const markdown = toMarkdown(tree)

      expect(markdown).toBe('Root\n  Child 1\n    Grandchild\n  Child 2')
    })

    it('should use 2 spaces per indentation level', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Level 1',
            children: [
              {
                id: 'grandchild1',
                content: 'Level 2',
                children: [
                  {
                    id: 'greatgrandchild1',
                    content: 'Level 3',
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      }

      const markdown = toMarkdown(tree)
      const lines = markdown.split('\n')

      expect(lines[0]).toBe('Root')
      expect(lines[1]).toBe('  Level 1') // 2 spaces
      expect(lines[2]).toBe('    Level 2') // 4 spaces
      expect(lines[3]).toBe('      Level 3') // 6 spaces
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

      const markdown = toMarkdown(tree)

      const firstIndex = markdown.indexOf('First')
      const secondIndex = markdown.indexOf('Second')
      const thirdIndex = markdown.indexOf('Third')

      expect(firstIndex).toBeGreaterThanOrEqual(0)
      expect(secondIndex).toBeGreaterThanOrEqual(0)
      expect(thirdIndex).toBeGreaterThanOrEqual(0)
      expect(firstIndex).toBeLessThan(secondIndex)
      expect(secondIndex).toBeLessThan(thirdIndex)
    })

    it('should handle deep nesting', () => {
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

      const markdown = toMarkdown(tree)

      expect(markdown).toBe('Level 1\n  Level 2\n    Level 3\n      Level 4')
    })

    it('should handle leaf nodes at different depths', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Child with no grandchildren',
            children: [],
          },
          {
            id: 'child2',
            content: 'Child with grandchildren',
            children: [{ id: 'grandchild1', content: 'Grandchild', children: [] }],
          },
        ],
      }

      const markdown = toMarkdown(tree)

      expect(markdown).toBe(
        'Root\n  Child with no grandchildren\n  Child with grandchildren\n    Grandchild'
      )
    })

    it('should preserve special characters', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root with *special* & <characters>',
        children: [{ id: 'child1', content: 'Child with "quotes"', children: [] }],
      }

      const markdown = toMarkdown(tree)

      expect(markdown).toContain('Root with *special* & <characters>')
      expect(markdown).toContain('Child with "quotes"')
    })
  })

  describe('Round-trip conversion', () => {
    it('should maintain structure through parse and generate', () => {
      const originalMarkdown = `Project
  Backend
    API
    Database
  Frontend
    React
    CSS
  Testing
    Unit tests
    Integration tests`

      const tree = parseMarkdown(originalMarkdown)
      const generatedMarkdown = toMarkdown(tree)

      expect(generatedMarkdown).toBe(originalMarkdown)
    })

    it('should handle simple hierarchy', () => {
      const markdown = 'Root\n  Child 1\n  Child 2\n    Grandchild 2.1\n  Child 3'

      const tree = parseMarkdown(markdown)
      const generatedMarkdown = toMarkdown(tree)

      expect(generatedMarkdown).toBe(markdown)
    })

    it('should handle single node', () => {
      const markdown = 'Single Node'

      const tree = parseMarkdown(markdown)
      const generatedMarkdown = toMarkdown(tree)

      expect(generatedMarkdown).toBe(markdown)
    })

    it('should preserve complex nesting', () => {
      const markdown = `A
  B
    C
      D
    E
  F
    G
      H
          I`

      const tree = parseMarkdown(markdown)
      const generatedMarkdown = toMarkdown(tree)

      // Note: Indentation is normalized to sequential levels
      const expected = `A
  B
    C
      D
    E
  F
    G
      H
        I`
      expect(generatedMarkdown).toBe(expected)
    })

    it('should handle tabs in input', () => {
      const markdown = `Root
\tChild 1
\t\tGrandchild 1.1
\tChild 2`

      const tree = parseMarkdown(markdown)
      const generatedMarkdown = toMarkdown(tree)

      // Generated markdown uses spaces, but structure should be preserved
      const lines = generatedMarkdown.split('\n')
      expect(lines[0]).toBe('Root')
      expect(lines[1]).toMatch(/^ {2}Child 1/) // 2 spaces
      expect(lines[2]).toMatch(/^ {4}Grandchild 1.1/) // 4 spaces
      expect(lines[3]).toMatch(/^ {2}Child 2/) // 2 spaces
    })
  })

  describe('Edge cases', () => {
    it('should handle unicode characters', () => {
      const markdown = '中文\n  日本語\n    한국어'

      const tree = parseMarkdown(markdown)
      const generatedMarkdown = toMarkdown(tree)

      expect(generatedMarkdown).toBe(markdown)
    })

    it('should handle very long lines', () => {
      const longContent = 'A'.repeat(1000)
      const markdown = `${longContent}\n  Child`

      const tree = parseMarkdown(markdown)
      const generatedMarkdown = toMarkdown(tree)

      expect(generatedMarkdown).toBe(markdown)
    })

    it('should handle mixed line endings', () => {
      const markdown = 'Root\r\n  Child\r\n    Grandchild'

      const tree = parseMarkdown(markdown)
      const generatedMarkdown = toMarkdown(tree)

      // Should normalize to \n
      expect(generatedMarkdown).toBe('Root\n  Child\n    Grandchild')
    })
  })
})
