import type { MindMapTree } from '../../types';

/**
 * Convert mind map tree to D2 format
 * D2 is a modern diagram scripting language
 */
export function toD2(tree: MindMapTree): string {
  const lines: string[] = [];

  // Set layout direction
  lines.push('direction: right');
  lines.push('');

  function buildNode(node: MindMapTree, parentId?: string) {
    // Escape special characters in D2
    const safeLabel = node.content.replace(/"/g, '\\"');
    const safeId = node.id.replace(/-/g, '_');

    // Build node with label
    if (parentId) {
      const safeParentId = parentId.replace(/-/g, '_');
      lines.push(`${safeParentId}.${safeLabel}: ${safeId}`);

      // Add style if present
      const styles: string[] = [];
      if (node.style?.color) {
        styles.push(`stroke: ${node.style.color}`);
      }
      if (node.style?.backgroundColor) {
        styles.push(`fill: ${node.style.backgroundColor}`);
      }
      if (node.icon) {
        styles.push(`icon: ${node.icon}`);
      }
      if (node.link) {
        styles.push(`link: ${node.link}`);
      }
      if (styles.length > 0) {
        lines.push(`${safeId}: {`);
        styles.forEach(style => lines.push(`  ${style}`));
        if (node.metadata?.description) {
          lines.push(`  tooltip: ${node.metadata.description.replace(/"/g, '\\"')}`);
        }
        lines.push(`}`);
      }
    } else {
      // Root node
      const styles: string[] = [];
      if (node.style?.color) {
        styles.push(`stroke: ${node.style.color}`);
      }
      if (node.style?.backgroundColor) {
        styles.push(`fill: ${node.style.backgroundColor}`);
      }
      if (node.icon) {
        styles.push(`icon: ${node.icon}`);
      }

      if (styles.length > 0) {
        lines.push(`${safeLabel}: ${safeId} {`);
        styles.forEach(style => lines.push(`  ${style}`));
        lines.push(`}`);
      } else {
        lines.push(`${safeLabel}: ${safeId}`);
      }
    }

    // Add children as nested
    if (node.children && node.children.length > 0) {
      if (node.children.length === 1) {
        // Single child - direct connection
        buildNode(node.children[0], node.id);
      } else {
        // Multiple children - create a container
        lines.push(`${safeId}: {`);
        node.children.forEach((child) => {
          buildNode(child, undefined);
        });
        lines.push(`}`);
      }
    }
  }

  buildNode(tree);

  return lines.join('\n');
}

/**
 * Parse D2 format to mind map tree (basic support)
 * This is a simplified parser that handles basic D2 syntax
 */
export function parseD2(_d2String: string): MindMapTree {
  // This is a simplified parser - full D2 parsing would require a proper tokenizer
  // For now, we'll do a best-effort parse of simple D2 structures

  throw new Error('D2 import is not yet supported. Please use JSON, FreeMind, OPML, or Markdown formats for importing.');
}
