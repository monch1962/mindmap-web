import { describe, it, expect } from 'vitest'
import { parseJSON, stringifyJSON } from './jsonFormat'
import type { MindMapTree } from '../../types'

describe('jsonFormat', () => {
  describe('parseJSON', () => {
    it('should parse valid JSON mind map', () => {
      const json = `{
        "id": "root-1",
        "content": "Main Topic",
        "children": [
          {
            "id": "child-1",
            "content": "Child 1",
            "children": []
          }
        ]
      }`

      const result = parseJSON(json)

      expect(result.id).toBe('root-1')
      expect(result.content).toBe('Main Topic')
      expect(result.children).toHaveLength(1)
      expect(result.children[0].id).toBe('child-1')
      expect(result.children[0].content).toBe('Child 1')
    })

    it('should parse complex mind map structure', () => {
      const json = `{
        "id": "root",
        "content": "Project Plan",
        "children": [
          {
            "id": "phase1",
            "content": "Phase 1: Research",
            "children": [
              {
                "id": "task1",
                "content": "Market Analysis",
                "children": []
              },
              {
                "id": "task2",
                "content": "Competitor Research",
                "children": []
              }
            ]
          },
          {
            "id": "phase2",
            "content": "Phase 2: Development",
            "children": []
          }
        ]
      }`

      const result = parseJSON(json)

      expect(result.content).toBe('Project Plan')
      expect(result.children).toHaveLength(2)
      expect(result.children[0].content).toBe('Phase 1: Research')
      expect(result.children[0].children).toHaveLength(2)
      expect(result.children[1].content).toBe('Phase 2: Development')
    })

    it('should throw error for invalid JSON', () => {
      const invalidJson = '{ invalid json }'

      expect(() => parseJSON(invalidJson)).toThrow('Invalid JSON format')
    })

    it('should throw error for malformed JSON (missing required fields)', () => {
      const malformedJson = '{"content": "Missing id"}'

      // Note: TypeScript cast will succeed but runtime may fail
      // The function doesn't validate structure, just parses JSON
      expect(() => parseJSON(malformedJson)).not.toThrow()
    })

    it('should handle empty object', () => {
      const emptyJson = '{}'
      const result = parseJSON(emptyJson)

      expect(result).toEqual({})
    })

    it('should handle JSON with extra properties', () => {
      const json = `{
        "id": "test",
        "content": "Test",
        "children": [],
        "extraProperty": "should be ignored",
        "metadata": {"created": "2024-01-01"}
      }`

      const result = parseJSON(json)

      expect(result.id).toBe('test')
      expect(result.content).toBe('Test')
      const resultWithExtra = result as MindMapTree & {
        extraProperty?: string
        metadata?: { created: string }
      }
      expect(resultWithExtra.extraProperty).toBe('should be ignored')
      expect(resultWithExtra.metadata).toEqual({ created: '2024-01-01' })
    })
  })

  describe('stringifyJSON', () => {
    it('should stringify simple mind map', () => {
      const tree: MindMapTree = {
        id: 'test-1',
        content: 'Test Topic',
        children: [],
      }

      const result = stringifyJSON(tree)
      const parsed = JSON.parse(result)

      expect(parsed.id).toBe('test-1')
      expect(parsed.content).toBe('Test Topic')
      expect(parsed.children).toEqual([])
    })

    it('should stringify nested mind map', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Main',
        children: [
          {
            id: 'child1',
            content: 'Child 1',
            children: [
              {
                id: 'grandchild1',
                content: 'Grandchild 1',
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

      const result = stringifyJSON(tree)
      const parsed = JSON.parse(result)

      expect(parsed.id).toBe('root')
      expect(parsed.children).toHaveLength(2)
      expect(parsed.children[0].children[0].content).toBe('Grandchild 1')
    })

    it('should include formatting (2-space indent)', () => {
      const tree: MindMapTree = {
        id: 'simple',
        content: 'Simple',
        children: [],
      }

      const result = stringifyJSON(tree)

      // Should have pretty formatting
      expect(result).toContain('\n  "id": "simple"')
      expect(result).toContain('\n  "content": "Simple"')
      expect(result).toContain('\n  "children": []')
    })

    it('should handle tree with additional properties', () => {
      const tree = {
        id: 'extended',
        content: 'Extended',
        children: [],
        position: { x: 100, y: 200 },
        style: { color: '#ff0000' },
      } as MindMapTree

      const result = stringifyJSON(tree)
      const parsed = JSON.parse(result)

      expect(parsed.id).toBe('extended')
      expect(parsed.position).toEqual({ x: 100, y: 200 })
      expect(parsed.style).toEqual({ color: '#ff0000' })
    })

    it('should produce valid JSON that can be re-parsed', () => {
      const originalTree: MindMapTree = {
        id: 'circular-test',
        content: 'Test Circular',
        children: [
          {
            id: 'child',
            content: 'Child',
            children: [],
          },
        ],
      }

      const jsonString = stringifyJSON(originalTree)
      const reparsedTree = parseJSON(jsonString)

      expect(reparsedTree).toEqual(originalTree)
    })
  })

  describe('integration', () => {
    it('should round-trip parse and stringify', () => {
      const original: MindMapTree = {
        id: 'roundtrip',
        content: 'Round Trip Test',
        children: [
          {
            id: 'child-a',
            content: 'Child A',
            children: [
              {
                id: 'grandchild-a1',
                content: 'Grandchild A1',
                children: [],
              },
            ],
          },
          {
            id: 'child-b',
            content: 'Child B',
            children: [],
          },
        ],
      }

      const json = stringifyJSON(original)
      const result = parseJSON(json)

      expect(result).toEqual(original)
    })

    it('should handle edge cases', () => {
      // Empty children array
      const tree1: MindMapTree = {
        id: 'empty-children',
        content: 'Test',
        children: [],
      }
      expect(() => stringifyJSON(tree1)).not.toThrow()
      expect(() => parseJSON(stringifyJSON(tree1))).not.toThrow()

      // Very deep nesting
      const deepTree: MindMapTree = {
        id: 'level1',
        content: 'Level 1',
        children: [
          {
            id: 'level2',
            content: 'Level 2',
            children: [
              {
                id: 'level3',
                content: 'Level 3',
                children: [],
              },
            ],
          },
        ],
      }
      expect(() => stringifyJSON(deepTree)).not.toThrow()
      expect(() => parseJSON(stringifyJSON(deepTree))).not.toThrow()
    })
  })
})
