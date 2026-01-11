import type { MindMapTree } from '../../types';
import { generateId } from '../mindmapConverter';

/**
 * Parse OPML format to mind map tree
 * OPML uses <outline> elements with nested outlines for hierarchy
 */
export function parseOPML(opmlString: string): MindMapTree {
  const parser = new DOMParser();
  const doc = parser.parseFromString(opmlString, 'text/xml');

  const bodyElement = doc.querySelector('body');
  if (!bodyElement) {
    throw new Error('Invalid OPML format: no body element found');
  }

  const rootOutline = bodyElement.querySelector(':scope > outline');
  if (!rootOutline) {
    // Create a default root if no outlines exist
    return {
      id: generateId(),
      content: 'Root',
      children: [],
    };
  }

  return parseOutline(rootOutline);
}

function parseOutline(element: Element): MindMapTree {
  const children: MindMapTree[] = [];
  const childOutlines = element.querySelectorAll(':scope > outline');

  childOutlines.forEach((child) => {
    children.push(parseOutline(child));
  });

  return {
    id: generateId(),
    content: element.getAttribute('text') ||
             element.getAttribute('title') ||
             element.getAttribute('TEXT') ||
             'Untitled',
    children,
  };
}

/**
 * Convert mind map tree to OPML format
 */
export function toOPML(tree: MindMapTree): string {
  function buildOutline(node: MindMapTree, depth = 1): string {
    const indent = '  '.repeat(depth);
    const text = node.content.replace(/"/g, '&quot;');
    let xml = `${indent}<outline text="${text}"`;

    if (node.children.length > 0) {
      xml += '>\n';
      node.children.forEach((child) => {
        xml += buildOutline(child, depth + 1);
      });
      xml += `${indent}</outline>\n`;
    } else {
      xml += '/>\n';
    }

    return xml;
  }

  const outlines = tree.children.map((child) => buildOutline(child));

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Mind Map</title>
  </head>
  <body>
${outlines.join('')}
  </body>
</opml>`;
}
