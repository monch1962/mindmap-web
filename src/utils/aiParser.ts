import type { MindMapTree } from '../types';
import { generateId } from './mindmapConverter';

/**
 * Parse text-based mind map from AI response
 * Supports indentation-based hierarchy
 */
export function parseAITextToMindMap(text: string): MindMapTree {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error('Empty mind map');
  }

  // Parse hierarchy based on indentation
  const root: any = {
    id: generateId(),
    label: lines[0].trim(),
    children: [],
  };

  const stack: Array<{ node: any; level: number }> = [{ node: root, level: 0 }];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const indent = line.search(/\S/);
    const label = line.trim();

    if (!label) continue;

    const newNode = {
      id: generateId(),
      label,
      children: [],
    };

    // Find the parent (last node with lower indentation)
    while (stack.length > 0 && stack[stack.length - 1].level >= indent) {
      stack.pop();
    }

    if (stack.length === 0) {
      // Should not happen if input is well-formed
      root.children.push(newNode);
      stack.push({ node: newNode, level: indent });
    } else {
      const parent = stack[stack.length - 1].node;
      parent.children.push(newNode);
      stack.push({ node: newNode, level: indent });
    }
  }

  return root;
}

/**
 * Parse bullet-point lists into mind map
 */
export function parseBulletPointsToMindMap(text: string, rootLabel: string): MindMapTree {
  const lines = text.split('\n').filter(line => line.trim());
  const root: MindMapTree = {
    id: generateId(),
    content: rootLabel,
    children: [],
  };

  lines.forEach(line => {
    const trimmed = line.trim();

    // Check for bullet points or numbered lists
    if (/^[-*+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^[-*+\d.]+\s/, '');
      root.children.push({
        id: generateId(),
        content,
        children: [],
      });
    }
  });

  return root;
}

/**
 * Generate mind map from AI suggestions
 */
export function createMindMapFromSuggestions(
  rootLabel: string,
  suggestions: string[]
): MindMapTree {
  return {
    id: generateId(),
    content: rootLabel,
    children: suggestions.map(suggestion => ({
      id: generateId(),
      content: suggestion,
      children: [],
    })),
  };
}
