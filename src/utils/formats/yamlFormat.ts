import yaml from 'js-yaml';
import type { MindMapTree } from '../../types';

interface YamlNode {
  content?: string;
  label?: string;
  notes?: string;
  link?: string;
  icon?: string;
  cloud?: { color?: string };
  children?: YamlNode[];
}

/**
 * Convert mind map tree to YAML format
 */
export function toYaml(tree: MindMapTree): string {
  // Convert tree to nested object structure
  const toObject = (node: MindMapTree): YamlNode => {
    const obj: YamlNode = {
      content: node.content,
    };

    if (node.children && node.children.length > 0) {
      obj.children = node.children.map(toObject);
    }

    if (node.metadata) {
      if (node.metadata.notes) {
        obj.notes = node.metadata.notes;
      }
      if (node.metadata.link) {
        obj.link = node.metadata.link;
      }
    }

    if (node.icon) {
      obj.icon = node.icon;
    }

    if (node.cloud) {
      obj.cloud = node.cloud;
    }

    return obj;
  };

  const obj = toObject(tree);
  return yaml.dump(obj, {
    indent: 2,
    lineWidth: -1, // Don't wrap lines
    noRefs: true, // Don't use references
  });
}

/**
 * Parse YAML to mind map tree
 */
export function parseYaml(yamlString: string): MindMapTree {
  const obj = yaml.load(yamlString) as YamlNode | null | undefined;

  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid YAML format');
  }

  // Convert object to tree structure
  const fromObject = (obj: YamlNode): MindMapTree => {
    const node: MindMapTree = {
      id: String(Date.now() + Math.random()),
      content: obj.content || obj.label || 'Root',
      children: [],
    };

    if (obj.children && Array.isArray(obj.children)) {
      node.children = obj.children.map(fromObject);
    }

    if (obj.notes || obj.link) {
      node.metadata = {};
      if (obj.notes) {
        node.metadata.notes = obj.notes;
      }
      if (obj.link) {
        node.metadata.link = obj.link;
      }
    }

    if (obj.icon) {
      node.icon = obj.icon;
    }

    if (obj.cloud) {
      node.cloud = obj.cloud;
    }

    return node;
  };

  return fromObject(obj);
}
