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

  // Parse child elements like <icon>, <edge>, <font>, <cloud>
  let icon: string | undefined;
  let edgeStyle: MindMapTree['edgeStyle'] | undefined;
  let fontName: string | undefined;
  let fontSize: number | undefined;
  let bold: boolean | undefined;
  let italic: boolean | undefined;
  let cloud: MindMapTree['cloud'] | undefined;

  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i];
    if (child.tagName === 'icon') {
      icon = child.getAttribute('BUILTIN') || undefined;
    } else if (child.tagName === 'edge') {
      edgeStyle = {
        color: child.getAttribute('COLOR') || undefined,
        width: child.getAttribute('WIDTH') ? parseInt(child.getAttribute('WIDTH')!, 10) : undefined,
        style: (child.getAttribute('STYLE') as 'bezier' | 'linear' | 'sharp_linear' | 'sharp_bezier' | null) || undefined,
      };
    } else if (child.tagName === 'font') {
      fontName = child.getAttribute('NAME') || undefined;
      fontSize = child.getAttribute('SIZE') ? parseInt(child.getAttribute('SIZE')!, 10) : undefined;
      bold = child.getAttribute('BOLD') === 'true';
      italic = child.getAttribute('ITALIC') === 'true';
    } else if (child.tagName === 'cloud') {
      cloud = {
        color: child.getAttribute('COLOR') || undefined,
      };
    }
  }

  return {
    id: generateId(),
    content: element.getAttribute('TEXT') || 'Untitled',
    children,
    style: {
      color: element.getAttribute('COLOR') || undefined,
      backgroundColor: element.getAttribute('BACKGROUND_COLOR') || undefined,
      fontName,
      fontSize,
      bold,
      italic,
    },
    collapsed: element.getAttribute('FOLDED') === 'true',
    link: element.getAttribute('LINK') || undefined,
    created: element.getAttribute('CREATED') ? parseInt(element.getAttribute('CREATED')!, 10) : undefined,
    modified: element.getAttribute('MODIFIED') ? parseInt(element.getAttribute('MODIFIED')!, 10) : undefined,
    icon,
    edgeStyle,
    cloud,
  };
}

/**
 * Convert mind map tree to FreeMind XML format
 */
export function toFreeMind(tree: MindMapTree): string {
  function buildNode(node: MindMapTree, depth = 0): string {
    const indent = '  '.repeat(depth);

    // Build node attributes
    const attrs = [
      `TEXT="${escapeXml(node.content)}"`,
      node.style?.color ? `COLOR="${node.style.color}"` : '',
      node.style?.backgroundColor ? `BACKGROUND_COLOR="${node.style.backgroundColor}"` : '',
      node.collapsed ? 'FOLDED="true"' : '',
      node.link ? `LINK="${escapeXml(node.link)}"` : '',
      node.created ? `CREATED="${node.created}"` : '',
      node.modified ? `MODIFIED="${node.modified}"` : '',
    ].filter(Boolean).join(' ');

    let xml = `${indent}<node ${attrs}>\n`;

    // Add icon element
    if (node.icon) {
      xml += `${indent}  <icon BUILTIN="${escapeXml(node.icon)}"/>\n`;
    }

    // Add edge element
    if (node.edgeStyle) {
      const edgeAttrs = [
        node.edgeStyle.color ? `COLOR="${node.edgeStyle.color}"` : '',
        node.edgeStyle.width ? `WIDTH="${node.edgeStyle.width}"` : '',
        node.edgeStyle.style ? `STYLE="${node.edgeStyle.style}"` : '',
      ].filter(Boolean).join(' ');
      if (edgeAttrs) {
        xml += `${indent}  <edge ${edgeAttrs}/>\n`;
      }
    }

    // Add font element
    if (node.style?.fontName || node.style?.fontSize !== undefined || node.style?.bold !== undefined || node.style?.italic !== undefined) {
      const fontAttrs = [
        node.style.fontName ? `NAME="${escapeXml(node.style.fontName)}"` : '',
        node.style.fontSize !== undefined ? `SIZE="${node.style.fontSize}"` : '',
        node.style.bold !== undefined ? `BOLD="${node.style.bold}"` : '',
        node.style.italic !== undefined ? `ITALIC="${node.style.italic}"` : '',
      ].filter(Boolean).join(' ');
      if (fontAttrs) {
        xml += `${indent}  <font ${fontAttrs}/>\n`;
      }
    }

    // Add cloud element
    if (node.cloud) {
      const cloudAttrs = [
        node.cloud.color ? `COLOR="${node.cloud.color}"` : '',
      ].filter(Boolean).join(' ');
      xml += `${indent}  <cloud ${cloudAttrs}/>\n`;
    }

    // Add child nodes
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
