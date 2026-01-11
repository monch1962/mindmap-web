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

  describe('Extended FreeMind attributes', () => {
    it('should parse LINK attribute', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Root" LINK="https://example.com"/>
</map>`;

      const tree = parseFreeMind(xml);
      expect(tree.link).toBe('https://example.com');
    });

    it('should parse BACKGROUND_COLOR attribute', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Root" BACKGROUND_COLOR="#ffff00"/>
</map>`;

      const tree = parseFreeMind(xml);
      expect(tree.style?.backgroundColor).toBe('#ffff00');
    });

    it('should parse CREATED and MODIFIED timestamps', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Root" CREATED="1234567890000" MODIFIED="1234567891000"/>
</map>`;

      const tree = parseFreeMind(xml);
      expect(tree.created).toBe(1234567890000);
      expect(tree.modified).toBe(1234567891000);
    });

    it('should parse ICON attribute', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Root">
    <icon BUILTIN="yes"/>
  </node>
</map>`;

      const tree = parseFreeMind(xml);
      expect(tree.icon).toBe('yes');
    });

    it('should parse EDGE styling attributes', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Root">
    <edge COLOR="#00ff00" WIDTH="2" STYLE="linear"/>
  </node>
</map>`;

      const tree = parseFreeMind(xml);
      expect(tree.edgeStyle?.color).toBe('#00ff00');
      expect(tree.edgeStyle?.width).toBe(2);
      expect(tree.edgeStyle?.style).toBe('linear');
    });

    it('should parse FONT attributes', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Root">
    <font NAME="Arial" SIZE="14" BOLD="true" ITALIC="false"/>
  </node>
</map>`;

      const tree = parseFreeMind(xml);
      expect(tree.style?.fontName).toBe('Arial');
      expect(tree.style?.fontSize).toBe(14);
      expect(tree.style?.bold).toBe(true);
      expect(tree.style?.italic).toBe(false);
    });

    it('should export LINK attribute', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [],
        link: 'https://example.com',
      };

      const xml = toFreeMind(tree);
      expect(xml).toContain('LINK="https://example.com"');
    });

    it('should export BACKGROUND_COLOR attribute', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [],
        style: { backgroundColor: '#ffff00' },
      };

      const xml = toFreeMind(tree);
      expect(xml).toContain('BACKGROUND_COLOR="#ffff00"');
    });

    it('should export CREATED and MODIFIED timestamps', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [],
        created: 1234567890000,
        modified: 1234567891000,
      };

      const xml = toFreeMind(tree);
      expect(xml).toContain('CREATED="1234567890000"');
      expect(xml).toContain('MODIFIED="1234567891000"');
    });

    it('should export ICON attribute', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [],
        icon: 'yes',
      };

      const xml = toFreeMind(tree);
      expect(xml).toContain('<icon BUILTIN="yes"/>');
    });

    it('should export EDGE styling attributes', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [],
        edgeStyle: { color: '#00ff00', width: 2, style: 'linear' },
      };

      const xml = toFreeMind(tree);
      expect(xml).toContain('<edge COLOR="#00ff00" WIDTH="2" STYLE="linear"/>');
    });

    it('should export FONT attributes', () => {
      const tree: MindMapTree = {
        id: 'root',
        content: 'Root',
        children: [],
        style: { fontName: 'Arial', fontSize: 14, bold: true, italic: false },
      };

      const xml = toFreeMind(tree);
      expect(xml).toContain('<font NAME="Arial" SIZE="14" BOLD="true" ITALIC="false"/>');
    });
  });
});
