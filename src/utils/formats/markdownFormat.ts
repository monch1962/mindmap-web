import type { MindMapTree } from '../../types';
import { generateId } from '../mindmapConverter';

/**
 * Parse indented Markdown format to mind map tree
 * Each level of indentation (2 spaces or 1 tab) creates a child node
 */
export function parseMarkdown(markdown: string): MindMapTree {
  const lines = markdown.split('\n').filter((line) => line.trim() !== '');

  if (lines.length === 0) {
    return {
      id: generateId(),
      content: 'Root',
      children: [],
    };
  }

  // Parse into hierarchical structure
  const root: MindMapTree = {
    id: generateId(),
    content: lines[0].trim(),
    children: [],
  };

  const stack: { node: MindMapTree; indent: number }[] = [
    { node: root, indent: -1 },
  ];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const indent = getIndentLevel(line);
    const content = line.trim();

    const newNode: MindMapTree = {
      id: generateId(),
      content,
      children: [],
    };

    // Find the parent level
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    parent.children.push(newNode);
    stack.push({ node: newNode, indent });
  }

  return root;
}

function getIndentLevel(line: string): number {
  let i = 0;
  while (i < line.length && (line[i] === ' ' || line[i] === '\t')) {
    i++;
  }
  // Count tabs as 2 spaces
  return Math.floor(i / 2);
}

/**
 * Convert mind map tree to indented Markdown format
 */
export function toMarkdown(tree: MindMapTree): string {
  function buildLines(node: MindMapTree, depth = 0): string[] {
    const indent = '  '.repeat(depth);
    const lines: string[] = [`${indent}${node.content}`];

    node.children.forEach((child) => {
      lines.push(...buildLines(child, depth + 1));
    });

    return lines;
  }

  return buildLines(tree).join('\n');
}
