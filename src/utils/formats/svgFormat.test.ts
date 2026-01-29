import { describe, it, expect } from 'vitest'
import { toSVG, parseSVG } from './svgFormat'
import type { MindMapTree } from '../../types'

describe('svgFormat', () => {
  describe('toSVG', () => {
    it('should generate SVG for single node', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root Topic',
        children: [],
      }

      const svg = toSVG(tree)

      expect(svg).toContain('<svg')
      expect(svg).toContain('Root Topic')
      expect(svg).toContain('</svg>')
    })

    it('should generate SVG for nested structure', () => {
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

      const svg = toSVG(tree)

      expect(svg).toContain('<svg')
      expect(svg).toContain('Root')
      expect(svg).toContain('Child 1')
      expect(svg).toContain('Child 2')
      expect(svg).toContain('Grandchild')
      expect(svg).toContain('</svg>')
    })

    it('should include node styling in SVG', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Styled Node',
        children: [],
        style: {
          color: '#ff0000',
          fontSize: 16,
          backgroundColor: '#0000ff',
          bold: true,
          italic: false,
        },
      }

      const svg = toSVG(tree)

      expect(svg).toContain('Styled Node')
      expect(svg).toContain('#ff0000')
      expect(svg).toContain('font-size="16"')
      expect(svg).toContain('#0000ff')
      expect(svg).toContain('font-weight="bold"')
    })

    it('should handle node with link', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Node with Link',
        children: [],
        link: 'https://example.com',
      }

      const svg = toSVG(tree)

      expect(svg).toContain('Node with Link')
      expect(svg).toContain('https://example.com')
    })

    it('should handle node with icon', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Node with Icon',
        children: [],
        icon: 'smiley',
      }

      const svg = toSVG(tree)

      expect(svg).toContain('Node with Icon')
      expect(svg).toContain('smiley')
    })

    it('should handle node with cloud', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Node with Cloud',
        children: [],
        cloud: {
          color: '#00ff00',
        },
      }

      const svg = toSVG(tree)

      expect(svg).toContain('Node with Cloud')
      expect(svg).toContain('#00ff00')
    })

    it('should handle edge styling', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: 'child',
            content: 'Child',
            children: [],
            edgeStyle: {
              color: '#ff00ff',
              width: 3,
              style: 'bezier',
            },
          },
        ],
      }

      const svg = toSVG(tree)

      expect(svg).toContain('#ff00ff')
      expect(svg).toContain('stroke-width="3"')
    })

    it('should handle collapsed nodes', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        collapsed: true,
        children: [
          {
            id: 'child',
            content: 'Hidden Child',
            children: [],
          },
        ],
      }

      const svg = toSVG(tree)

      expect(svg).toContain('Root')
      expect(svg).not.toContain('Hidden Child')
    })

    it('should generate valid SVG structure', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Test',
        children: [],
      }

      const svg = toSVG(tree)

      // Check for basic SVG structure
      expect(svg).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/)
      expect(svg).toContain('<svg')
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
      expect(svg).toContain('</svg>')
    })

    it('should include viewBox attribute', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Test',
        children: [],
      }

      const svg = toSVG(tree)

      expect(svg).toContain('viewBox="')
      expect(svg).toMatch(/viewBox="0 0 \d+ \d+"/)
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

      const svg = toSVG(tree)

      expect(svg).toContain('Level 1')
      expect(svg).toContain('Level 2')
      expect(svg).toContain('Level 3')
      expect(svg).toContain('Level 4')
    })

    it('should handle multiple children at same level', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          { id: '1', content: 'Child 1', children: [] },
          { id: '2', content: 'Child 2', children: [] },
          { id: '3', content: 'Child 3', children: [] },
          { id: '4', content: 'Child 4', children: [] },
        ],
      }

      const svg = toSVG(tree)

      expect(svg).toContain('Child 1')
      expect(svg).toContain('Child 2')
      expect(svg).toContain('Child 3')
      expect(svg).toContain('Child 4')
    })
  })

  describe('parseSVG', () => {
    it('should throw error for SVG import (not yet supported)', () => {
      const svg = '<svg></svg>'

      expect(() => parseSVG(svg)).toThrow(
        'SVG import is not yet supported. Please use JSON, FreeMind, OPML, or Markdown formats for importing.'
      )
    })

    it('should throw error for empty SVG', () => {
      const svg = ''

      expect(() => parseSVG(svg)).toThrow(
        'SVG import is not yet supported. Please use JSON, FreeMind, OPML, or Markdown formats for importing.'
      )
    })
  })

  describe('Round-trip conversion', () => {
    it('should maintain basic structure through SVG generation', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Test Project',
        children: [
          {
            id: 'backend',
            content: 'Backend',
            children: [
              { id: 'api', content: 'API', children: [] },
              { id: 'db', content: 'Database', children: [] },
            ],
          },
          {
            id: 'frontend',
            content: 'Frontend',
            children: [
              { id: 'react', content: 'React', children: [] },
              { id: 'css', content: 'CSS', children: [] },
            ],
          },
        ],
      }

      const svg = toSVG(tree)

      expect(svg).toContain('Test Project')
      expect(svg).toContain('Backend')
      expect(svg).toContain('Frontend')
      expect(svg).toContain('API')
      expect(svg).toContain('Database')
      expect(svg).toContain('React')
      expect(svg).toContain('CSS')
    })
  })

  describe('Edge cases', () => {
    it('should handle special characters in node content', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Node with <special> & "characters"',
        children: [],
      }

      const svg = toSVG(tree)

      expect(svg).toContain('Node with &lt;special&gt; &amp; &quot;characters&quot;')
    })

    it('should handle empty content', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: '',
        children: [],
      }

      const svg = toSVG(tree)

      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')
    })

    it('should handle very long node content', () => {
      const longContent = 'A'.repeat(100)
      const tree: MindMapTree = {
        id: 'root',
        content: longContent,
        children: [],
      }

      const svg = toSVG(tree)

      expect(svg).toContain(longContent)
    })

    it('should handle unicode characters', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: '中文 日本語 한국어',
        children: [],
      }

      const svg = toSVG(tree)

      expect(svg).toContain('中文 日本語 한국어')
    })
  })
})
