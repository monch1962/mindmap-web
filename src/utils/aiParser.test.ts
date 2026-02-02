import { describe, it, expect } from 'vitest'
import {
  parseAITextToMindMap,
  parseBulletPointsToMindMap,
  createMindMapFromSuggestions,
} from './aiParser'
import type { MindMapTree } from '../types'

describe('aiParser', () => {
  describe('parseAITextToMindMap', () => {
    it('should parse simple hierarchy with indentation', () => {
      const text = `Root Topic
  Child 1
    Grandchild 1.1
  Child 2
    Grandchild 2.1
    Grandchild 2.2`

      const result = parseAITextToMindMap(text)

      expect(result.content).toBe('Root Topic')
      expect(result.children).toHaveLength(2)
      expect(result.children[0].content).toBe('Child 1')
      expect(result.children[0].children[0].content).toBe('Grandchild 1.1')
      expect(result.children[1].content).toBe('Child 2')
      expect(result.children[1].children).toHaveLength(2)
    })

    it('should handle tabs as indentation', () => {
      const text = `Root Topic
\tChild 1
\t\tGrandchild 1.1
\tChild 2`

      const result = parseAITextToMindMap(text)

      expect(result.content).toBe('Root Topic')
      expect(result.children).toHaveLength(2)
      expect(result.children[0].content).toBe('Child 1')
      expect(result.children[0].children[0].content).toBe('Grandchild 1.1')
      expect(result.children[1].content).toBe('Child 2')
    })

    it('should throw error for empty text', () => {
      expect(() => parseAITextToMindMap('')).toThrow('Empty mind map')
      expect(() => parseAITextToMindMap('\n\n   \n')).toThrow('Empty mind map')
    })

    it('should handle single line input', () => {
      const result = parseAITextToMindMap('Single Topic')

      expect(result.content).toBe('Single Topic')
      expect(result.children).toHaveLength(0)
    })

    it('should skip empty lines', () => {
      const text = `Root Topic

  Child 1

    Grandchild 1.1

  Child 2`

      const result = parseAITextToMindMap(text)

      expect(result.content).toBe('Root Topic')
      expect(result.children).toHaveLength(2)
      expect(result.children[0].content).toBe('Child 1')
      expect(result.children[0].children[0].content).toBe('Grandchild 1.1')
      expect(result.children[1].content).toBe('Child 2')
    })

    it('should handle malformed indentation (orphan nodes)', () => {
      const text = `Root Topic
    Orphan Node (too much indent)
  Child 1`

      const result = parseAITextToMindMap(text)

      expect(result.content).toBe('Root Topic')
      expect(result.children).toHaveLength(2)
      // Orphan node should become child of root
      expect(result.children[0].content).toBe('Orphan Node (too much indent)')
      expect(result.children[1].content).toBe('Child 1')
    })
  })

  describe('parseBulletPointsToMindMap', () => {
    it('should parse bullet points', () => {
      const text = `- Item 1
* Item 2
+ Item 3
- Item 4`

      const result = parseBulletPointsToMindMap(text, 'Root')

      expect(result.content).toBe('Root')
      expect(result.children).toHaveLength(4)
      expect(result.children[0].content).toBe('Item 1')
      expect(result.children[1].content).toBe('Item 2')
      expect(result.children[2].content).toBe('Item 3')
      expect(result.children[3].content).toBe('Item 4')
    })

    it('should parse numbered lists', () => {
      const text = `1. First item
2. Second item
3. Third item`

      const result = parseBulletPointsToMindMap(text, 'Root')

      expect(result.content).toBe('Root')
      expect(result.children).toHaveLength(3)
      expect(result.children[0].content).toBe('First item')
      expect(result.children[1].content).toBe('Second item')
      expect(result.children[2].content).toBe('Third item')
    })

    it('should skip non-bullet lines', () => {
      const text = `- Item 1
Not a bullet
* Item 2
Regular text
1. Numbered item`

      const result = parseBulletPointsToMindMap(text, 'Root')

      expect(result.content).toBe('Root')
      expect(result.children).toHaveLength(3)
      expect(result.children[0].content).toBe('Item 1')
      expect(result.children[1].content).toBe('Item 2')
      expect(result.children[2].content).toBe('Numbered item')
    })

    it('should handle empty input', () => {
      const result = parseBulletPointsToMindMap('', 'Root')

      expect(result.content).toBe('Root')
      expect(result.children).toHaveLength(0)
    })

    it('should handle mixed bullet styles', () => {
      const text = `- Dash bullet
* Star bullet
+ Plus bullet
1. Numbered
2. Another number`

      const result = parseBulletPointsToMindMap(text, 'Mixed Root')

      expect(result.content).toBe('Mixed Root')
      expect(result.children).toHaveLength(5)
    })
  })

  describe('createMindMapFromSuggestions', () => {
    it('should create mind map from suggestions array', () => {
      const suggestions = ['Idea 1', 'Idea 2', 'Idea 3']
      const result = createMindMapFromSuggestions('Brainstorm', suggestions)

      expect(result.content).toBe('Brainstorm')
      expect(result.children).toHaveLength(3)
      expect(result.children[0].content).toBe('Idea 1')
      expect(result.children[1].content).toBe('Idea 2')
      expect(result.children[2].content).toBe('Idea 3')
    })

    it('should handle empty suggestions', () => {
      const result = createMindMapFromSuggestions('Empty', [])

      expect(result.content).toBe('Empty')
      expect(result.children).toHaveLength(0)
    })

    it('should generate unique IDs for all nodes', () => {
      const suggestions = ['Suggestion 1', 'Suggestion 2']
      const result = createMindMapFromSuggestions('Root', suggestions)

      const ids = new Set<string>()
      ids.add(result.id)
      result.children.forEach(child => ids.add(child.id))

      expect(ids.size).toBe(3) // Root + 2 children
    })
  })

  describe('integration', () => {
    it('should generate valid mind map tree structure', () => {
      const text = `Main Topic
  Subtopic A
    Detail A1
    Detail A2
  Subtopic B
    Detail B1`

      const result = parseAITextToMindMap(text)

      // Validate tree structure
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('content')
      expect(result).toHaveProperty('children')
      expect(Array.isArray(result.children)).toBe(true)

      // Validate all nodes have required properties
      const validateNode = (node: MindMapTree) => {
        expect(node.id).toBeDefined()
        expect(typeof node.id).toBe('string')
        expect(node.content).toBeDefined()
        expect(typeof node.content).toBe('string')
        expect(Array.isArray(node.children)).toBe(true)
        node.children.forEach(validateNode)
      }

      validateNode(result)
    })
  })
})
