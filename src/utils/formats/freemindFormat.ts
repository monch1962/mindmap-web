import type { MindMapTree } from '../../types';
import { generateId } from '../mindmapConverter';

/**
 * Parse FreeMind XML format to mind map tree
 * FreeMind uses a simple XML structure with nested <node> elements
 */
export function parseFreeMind(xmlString: string): MindMapTree {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const rootElement = doc.querySelector('map > node');
  if (!rootElement) {
    throw new Error('Invalid FreeMind format: no root node found');
  }

  return parseNode(rootElement);
}

function parseNode(element: Element): MindMapTree {
  const children: MindMapTree[] = [];
  const childNodes = element.children;

  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i];
    if (child.tagName === 'node') {
      children.push(parseNode(child));
    }
  }

  return {
    id: generateId(),
    content: element.getAttribute('TEXT') || 'Untitled',
    children,
    style: {
      color: element.getAttribute('COLOR') || undefined,
    },
    collapsed: element.getAttribute('FOLDED') === 'true',
  };
}

/**
 * Convert mind map tree to FreeMind XML format
 */
export function toFreeMind(tree: MindMapTree): string {
  function buildNode(node: MindMapTree, depth = 0): string {
    const indent = '  '.repeat(depth);
    const attrs = [
      `TEXT="${escapeXml(node.content)}"`,
      node.style?.color ? `COLOR="${node.style.color}"` : '',
      node.collapsed ? 'FOLDED="true"' : '',
    ].filter(Boolean).join(' ');

    let xml = `${indent}<node ${attrs}>\n`;

    if (node.children.length > 0) {
      node.children.forEach((child) => {
        xml += buildNode(child, depth + 1);
      });
    }

    xml += `${indent}</node>\n`;
    return xml;
  }

  const nodeXml = buildNode(tree, 1);
  return `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
${nodeXml}</map>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
