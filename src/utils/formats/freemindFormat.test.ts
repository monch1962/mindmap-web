import { describe, it, expect } from 'vitest';
import { parseFreeMind, toFreeMind } from './freemindFormat';
import type { MindMapTree } from '../../types';

describe('freemindFormat', () => {
  describe('parseFreeMind', () => {
    it('should parse a simple FreeMind XML', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Root">
    <node TEXT="Child 1"/>
    <node TEXT="Child 2"/>
  </node>
</map>`;

      const tree = parseFreeMind(xml);

      expect(tree.content).toBe('Root');
      expect(tree.children).toHaveLength(2);
      expect(tree.children[0].content).toBe('Child 1');
      expect(tree.children[1].content).toBe('Child 2');
    });

    it('should parse nested nodes', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Root">
    <node TEXT="Child 1">
      <node TEXT="Grandchild 1"/>
    </node>
  </node>
</map>`;

      const tree = parseFreeMind(xml);

      expect(tree.children[0].children).toHaveLength(1);
      expect(tree.children[0].children[0].content).toBe('Grandchild 1');
    });

    it('should parse node attributes (color, folded)', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Root" COLOR="#ff0000" FOLDED="true">
    <node TEXT="Child"/>
  </node>
</map>`;

      const tree = parseFreeMind(xml);

      expect(tree.style?.color).toBe('#ff0000');
      expect(tree.collapsed).toBe(true);
    });

    it('should throw error for invalid XML', () => {
      const xml = `<invalid>XML</invalid>`;

      expect(() => parseFreeMind(xml)).toThrow('Invalid FreeMind format');
    });

    it('should handle empty children', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Root"/>
</map>`;

      const tree = parseFreeMind(xml);

      expect(tree.children).toHaveLength(0);
    });
  });

  describe('toFreeMind', () => {
    it('should convert a simple tree to FreeMind XML', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          { id: '1', content: 'Child 1', children: [] },
          { id: '2', content: 'Child 2', children: [] },
        ],
      };

      const xml = toFreeMind(tree);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<map version="1.0.1">');
      expect(xml).toContain('TEXT="Root"');
      expect(xml).toContain('TEXT="Child 1"');
      expect(xml).toContain('TEXT="Child 2"');
      expect(xml).toContain('</map>');
    });

    it('should include style attributes', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [],
        style: { color: '#ff0000' },
        collapsed: true,
      };

      const xml = toFreeMind(tree);

      expect(xml).toContain('COLOR="#ff0000"');
      expect(xml).toContain('FOLDED="true"');
    });

    it('should handle special characters in content', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root with <special> & "characters"',
        children: [],
      };

      const xml = toFreeMind(tree);

      expect(xml).toContain('Root with &lt;special&gt; &amp; &quot;characters&quot;');
    });

    it('should convert nested structures', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [
          {
            id: '1',
            content: 'Child',
            children: [{ id: '2', content: 'Grandchild', children: [] }],
          },
        ],
      };

      const xml = toFreeMind(tree);

      // Check nesting structure
      const rootIndex = xml.indexOf('TEXT="Root"');
      const childIndex = xml.indexOf('TEXT="Child"');
      const grandchildIndex = xml.indexOf('TEXT="Grandchild"');

      expect(rootIndex).toBeLessThan(childIndex);
      expect(childIndex).toBeLessThan(grandchildIndex);
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve data through parse and convert', () => {
      const originalXml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Root" COLOR="#00ff00">
    <node TEXT="Child 1"/>
    <node TEXT="Child 2">
      <node TEXT="Grandchild"/>
    </node>
  </node>
</map>`;

      const tree = parseFreeMind(originalXml);
      const convertedXml = toFreeMind(tree);

      // Parse again to compare
      const finalTree = parseFreeMind(convertedXml);

      expect(finalTree.content).toBe(tree.content);
      expect(finalTree.style?.color).toBe(tree.style?.color);
      expect(finalTree.children).toHaveLength(tree.children.length);
      expect(finalTree.children[0].content).toBe(tree.children[0].content);
      expect(finalTree.children[1].children[0].content).toBe(tree.children[1].children[0].content);
    });
  });
});
