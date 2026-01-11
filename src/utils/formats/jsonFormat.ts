import type { MindMapTree } from '../../types';

/**
 * Parse JSON format to mind map tree
 */
export function parseJSON(jsonString: string): MindMapTree {
  try {
    const data = JSON.parse(jsonString);
    return data as MindMapTree;
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

/**
 * Stringify mind map tree to JSON format
 */
export function stringifyJSON(tree: MindMapTree): string {
  return JSON.stringify(tree, null, 2);
}
