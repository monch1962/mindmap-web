import { describe, it, expect } from 'vitest'
import { parseYaml, toYaml } from './yamlFormat'
import type { MindMapTree } from '../../types'

describe('yamlFormat', () => {
  describe('parseYaml', () => {
    it('should parse simple YAML structure', () => {
      const yaml = `
content: Root
`

      const tree = parseYaml(yaml)

      expect(tree).toHaveProperty('id')
      expect(tree.content).toBe('Root')
      expect(tree.children).toEqual([])
    })

    it('should parse YAML with nested children', () => {
      const yaml = `
content: Root
children:
  - content: Child 1
  - content: Child 2
`

      const tree = parseYaml(yaml)

      expect(tree.content).toBe('Root')
      expect(tree.children).toHaveLength(2)
      expect(tree.children[0].content).toBe('Child 1')
      expect(tree.children[1].content).toBe('Child 2')
    })

    it('should parse deeply nested structure', () => {
      const yaml = `
content: Root
children:
  - content: Child 1
    children:
      - content: Grandchild 1.1
  - content: Child 2
`

      const tree = parseYaml(yaml)

      expect(tree.content).toBe('Root')
      expect(tree.children[0].content).toBe('Child 1')
      expect(tree.children[0].children[0].content).toBe('Grandchild 1.1')
      expect(tree.children[1].content).toBe('Child 2')
    })

    it('should parse YAML with label instead of content', () => {
      const yaml = `
label: Root Label
`

      const tree = parseYaml(yaml)

      expect(tree.content).toBe('Root Label')
    })

    it('should parse YAML with notes metadata', () => {
      const yaml = `
content: Root
notes: These are notes
`

      const tree = parseYaml(yaml)

      expect(tree.content).toBe('Root')
      expect(tree.metadata?.notes).toBe('These are notes')
    })

    it('should parse YAML with link metadata', () => {
      const yaml = `
content: Root
link: https://example.com
`

      const tree = parseYaml(yaml)

      expect(tree.content).toBe('Root')
      expect(tree.metadata?.link).toBe('https://example.com')
    })

    it('should parse YAML with both notes and link', () => {
      const yaml = `
content: Root
notes: Important notes
link: https://example.com
`

      const tree = parseYaml(yaml)

      expect(tree.metadata?.notes).toBe('Important notes')
      expect(tree.metadata?.link).toBe('https://example.com')
    })

    it('should parse YAML with icon', () => {
      const yaml = `
content: Root
icon: help
`

      const tree = parseYaml(yaml)

      expect(tree.content).toBe('Root')
      expect(tree.icon).toBe('help')
    })

    it('should parse YAML with cloud', () => {
      const yaml = `
content: Root
cloud:
  color: "#ff0000"
`

      const tree = parseYaml(yaml)

      expect(tree.content).toBe('Root')
      expect(tree.cloud?.color).toBe('#ff0000')
    })

    it('should parse YAML with all properties', () => {
      const yaml = `
content: Root
notes: My notes
link: https://example.com
icon: yes
cloud:
  color: "#00ff00"
children:
  - content: Child
    notes: Child notes
`

      const tree = parseYaml(yaml)

      expect(tree.content).toBe('Root')
      expect(tree.metadata?.notes).toBe('My notes')
      expect(tree.metadata?.link).toBe('https://example.com')
      expect(tree.icon).toBe('yes')
      expect(tree.cloud?.color).toBe('#00ff00')
      expect(tree.children[0].content).toBe('Child')
      expect(tree.children[0].metadata?.notes).toBe('Child notes')
    })

    it('should handle empty YAML', () => {
      const yaml = ``

      expect(() => parseYaml(yaml)).toThrow('Invalid YAML format')
    })

    it('should handle YAML with only comments', () => {
      const yaml = `
# This is a comment
# Another comment
`

      expect(() => parseYaml(yaml)).toThrow('Invalid YAML format')
    })

    it('should prefer content over label', () => {
      const yaml = `
content: Content Value
label: Label Value
`

      const tree = parseYaml(yaml)

      expect(tree.content).toBe('Content Value')
    })

    it('should handle complex nested structure', () => {
      const yaml = `
content: Project
children:
  - content: Backend
    children:
      - content: API
        notes: REST API endpoints
      - content: Database
        icon: database
  - content: Frontend
    children:
      - content: React
      - content: CSS
        link: https://css-tricks.com
  - content: Testing
    children:
      - content: Unit Tests
        cloud:
          color: "#00ff00"
      - content: Integration Tests
`

      const tree = parseYaml(yaml)

      expect(tree.content).toBe('Project')
      expect(tree.children).toHaveLength(3)

      expect(tree.children[0].content).toBe('Backend')
      expect(tree.children[0].children[0].content).toBe('API')
      expect(tree.children[0].children[0].metadata?.notes).toBe('REST API endpoints')
      expect(tree.children[0].children[1].content).toBe('Database')
      expect(tree.children[0].children[1].icon).toBe('database')

      expect(tree.children[1].content).toBe('Frontend')
      expect(tree.children[1].children[0].content).toBe('React')
      expect(tree.children[1].children[1].content).toBe('CSS')
      expect(tree.children[1].children[1].metadata?.link).toBe('https://css-tricks.com')

      expect(tree.children[2].content).toBe('Testing')
      expect(tree.children[2].children[0].content).toBe('Unit Tests')
      expect(tree.children[2].children[0].cloud?.color).toBe('#00ff00')
      expect(tree.children[2].children[1].content).toBe('Integration Tests')
    })

    it('should handle YAML with null values', () => {
      const yaml = `
content: Root
children:
  - content: Child
    notes: null
`

      const tree = parseYaml(yaml)

      expect(tree.content).toBe('Root')
      expect(tree.children[0].content).toBe('Child')
      expect(tree.children[0].metadata).toBeUndefined()
    })

    it('should handle YAML with empty children array', () => {
      const yaml = `
content: Root
children: []
`

      const tree = parseYaml(yaml)

      expect(tree.content).toBe('Root')
      expect(tree.children).toEqual([])
    })
  })

  describe('toYaml', () => {
    it('should generate YAML for simple tree', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [],
      }

      const yaml = toYaml(tree)

      expect(yaml).toContain('content: Root')
    })

    it('should generate YAML with children', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          { id: 'child1', content: 'Child 1', children: [] },
          { id: 'child2', content: 'Child 2', children: [] },
        ],
      }

      const yaml = toYaml(tree)

      expect(yaml).toContain('content: Root')
      expect(yaml).toContain('children:')
      expect(yaml).toContain('- content: Child 1')
      expect(yaml).toContain('- content: Child 2')
    })

    it('should include notes in YAML', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        metadata: {
          notes: 'Important notes',
        },
        children: [],
      }

      const yaml = toYaml(tree)

      expect(yaml).toContain('content: Root')
      expect(yaml).toContain('notes: Important notes')
    })

    it('should include link in YAML', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        metadata: {
          link: 'https://example.com',
        },
        children: [],
      }

      const yaml = toYaml(tree)

      expect(yaml).toContain('link: https://example.com')
    })

    it('should include icon in YAML', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        icon: 'help',
        children: [],
      }

      const yaml = toYaml(tree)

      expect(yaml).toContain('icon: help')
    })

    it('should include cloud in YAML', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        cloud: {
          color: '#ff0000',
        },
        children: [],
      }

      const yaml = toYaml(tree)

      expect(yaml).toContain('cloud:')
      // YAML uses single quotes for color values
      expect(yaml).toContain("color: '#ff0000'")
    })

    it('should handle nested children properly', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Child 1',
            children: [{ id: 'grandchild1', content: 'Grandchild', children: [] }],
          },
        ],
      }

      const yaml = toYaml(tree)

      expect(yaml).toContain('content: Root')
      expect(yaml).toContain('- content: Child 1')
      expect(yaml).toContain('children:')
      expect(yaml).toContain('- content: Grandchild')
    })

    it('should use 2 space indentation', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child1',
            content: 'Child',
            children: [{ id: 'grandchild1', content: 'Grandchild', children: [] }],
          },
        ],
      }

      const yaml = toYaml(tree)
      const lines = yaml.split('\n')

      // Find content lines
      const rootLine = lines.find(l => l.trim() === 'content: Root' && !l.startsWith('  '))
      const childLine = lines.find(l => l.trim() === '- content: Child' && l.startsWith('  '))
      const grandchildLine = lines.find(
        l => l.trim() === '- content: Grandchild' && l.startsWith('    ')
      )

      expect(rootLine).toBeDefined()
      expect(childLine).toBeDefined()
      expect(grandchildLine).toBeDefined()
    })

    it('should not wrap long lines', () => {
      const longContent = 'A'.repeat(200)
      const tree: MindMapTree = {
        id: 'root',
        content: longContent,
        children: [],
      }

      const yaml = toYaml(tree)

      expect(yaml).toContain(`content: ${longContent}`)
    })

    it('should handle special characters', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Content with "quotes" and \'apostrophes\'',
        metadata: {
          notes: 'Notes: with special chars: *&^%$#@!',
        },
        children: [],
      }

      const yaml = toYaml(tree)

      expect(yaml).toContain('content: Content with "quotes"')
      // YAML wraps strings with special chars in single quotes (no escaping inside single quotes)
      expect(yaml).toContain("notes: 'Notes: with special chars: *&^%$#@!'")
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

      const yaml = toYaml(tree)

      const firstIndex = yaml.indexOf('- content: First')
      const secondIndex = yaml.indexOf('- content: Second')
      const thirdIndex = yaml.indexOf('- content: Third')

      expect(firstIndex).toBeLessThan(secondIndex)
      expect(secondIndex).toBeLessThan(thirdIndex)
    })
  })

  describe('Round-trip conversion', () => {
    it('should maintain simple structure', () => {
      const originalYaml = `
content: Root
children:
  - content: Child 1
  - content: Child 2
`

      const tree = parseYaml(originalYaml)
      const generatedYaml = toYaml(tree)

      // Structure should be preserved
      expect(generatedYaml).toContain('content: Root')
      expect(generatedYaml).toContain('- content: Child 1')
      expect(generatedYaml).toContain('- content: Child 2')
    })

    it('should maintain complex structure', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Project',
        children: [
          {
            id: 'child1',
            content: 'Backend',
            metadata: {
              notes: 'API endpoints',
              link: 'https://api.example.com',
            },
            icon: 'database',
            children: [
              {
                id: 'grandchild1',
                content: 'API',
                children: [],
              },
            ],
          },
          {
            id: 'child2',
            content: 'Frontend',
            cloud: { color: '#00ff00' },
            children: [],
          },
        ],
      }

      const yaml = toYaml(tree)
      const parsedTree = parseYaml(yaml)

      expect(parsedTree.content).toBe(tree.content)
      expect(parsedTree.children[0].content).toBe(tree.children[0].content)
      expect(parsedTree.children[0].metadata?.notes).toBe(tree.children[0].metadata?.notes)
      expect(parsedTree.children[0].metadata?.link).toBe(tree.children[0].metadata?.link)
      expect(parsedTree.children[0].icon).toBe(tree.children[0].icon)
      expect(parsedTree.children[0].children[0].content).toBe(tree.children[0].children[0].content)
      expect(parsedTree.children[1].cloud?.color).toBe(tree.children[1].cloud?.color)
    })

    it('should handle unicode characters', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: '中文',
        children: [
          { id: 'child1', content: '日本語', children: [] },
          { id: 'child2', content: '한국어', children: [] },
        ],
      }

      const yaml = toYaml(tree)
      const parsedTree = parseYaml(yaml)

      expect(parsedTree.content).toBe('中文')
      expect(parsedTree.children[0].content).toBe('日本語')
      expect(parsedTree.children[1].content).toBe('한국어')
    })
  })
})
