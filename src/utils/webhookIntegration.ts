/**
 * Webhook integration for Zapier, Make, and other automation platforms
 * Allows external services to create/modify mind maps
 */

import type { MindMapTree } from '../types';

export interface WebhookPayload {
  action: 'create' | 'update' | 'add_node';
  data: {
    parentId?: string;
    content: string;
    metadata?: Record<string, any>;
  };
  source: 'zapier' | 'make' | 'ifft' | 'custom';
  timestamp: number;
}

export interface WebhookConfig {
  enabled: boolean;
  webhookUrl: string;
  apiKey: string;
  lastTriggered?: number;
}

/**
 * Generate a webhook endpoint URL for the user
 */
export function generateWebhookEndpoint(apiKey: string): string {
  // In a real implementation, this would be your server's endpoint
  // For client-side only, we return a webhook URL that users can configure
  const baseUrl = window.location.origin;
  return `${baseUrl}/api/webhook/${apiKey}`;
}

/**
 * Register webhook configuration
 */
export function registerWebhook(config: WebhookConfig): void {
  localStorage.setItem('mindmap_webhook_config', JSON.stringify(config));
}

/**
 * Get webhook configuration
 */
export function getWebhookConfig(): WebhookConfig | null {
  const config = localStorage.getItem('mindmap_webhook_config');
  if (config) {
    try {
      return JSON.parse(config);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Trigger webhook with mind map data
 * Used to send updates to external services
 */
export async function triggerWebhook(
  webhookUrl: string,
  apiKey: string,
  tree: MindMapTree,
  action: 'created' | 'updated' | 'node_added' | 'node_deleted'
): Promise<boolean> {
  try {
    const payload = {
      action,
      data: {
        tree,
        timestamp: Date.now(),
        url: window.location.href,
      },
      apiKey,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error('Webhook trigger failed:', error);
    return false;
  }
}

/**
 * Process incoming webhook data from Zapier/Make
 * This would be called by your backend endpoint
 */
export function processWebhookPayload(payload: WebhookPayload): {
  nodeId: string;
  content: string;
  parentId?: string;
  metadata?: Record<string, any>;
} {
  return {
    nodeId: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content: payload.data.content,
    parentId: payload.data.parentId,
    metadata: {
      ...payload.data.metadata,
      source: payload.source,
      webhookTimestamp: payload.timestamp,
    },
  };
}

/**
 * Create a Zapier-compatible webhook payload
 */
export function createZapierPayload(
  tree: MindMapTree,
  action: 'create' | 'update' | 'add_node'
): WebhookPayload {
  return {
    action,
    data: {
      content: tree.content,
      metadata: {
        nodeCount: countNodes(tree),
        depth: getTreeDepth(tree),
      },
    },
    source: 'zapier',
    timestamp: Date.now(),
  };
}

/**
 * Create a Make (Integromat) compatible webhook payload
 */
export function createMakePayload(
  tree: MindMapTree,
  action: 'create' | 'update' | 'add_node'
): WebhookPayload {
  return {
    action,
    data: {
      content: tree.content,
      metadata: {
        nodeCount: countNodes(tree),
        depth: getTreeDepth(tree),
        lastModified: Date.now(),
      },
    },
    source: 'make',
    timestamp: Date.now(),
  };
}

/**
 * Helper: Count total nodes in tree
 */
function countNodes(tree: MindMapTree): number {
  let count = 1;
  if (tree.children) {
    tree.children.forEach(child => {
      count += countNodes(child);
    });
  }
  return count;
}

/**
 * Helper: Get tree depth
 */
function getTreeDepth(tree: MindMapTree): number {
  if (!tree.children || tree.children.length === 0) {
    return 1;
  }
  return 1 + Math.max(...tree.children.map(child => getTreeDepth(child)));
}

/**
 * Generate sample webhook payload for testing
 */
export function generateTestPayload(): WebhookPayload {
  return {
    action: 'add_node',
    data: {
      content: 'New idea from Zapier',
      metadata: {
        source: 'Trello',
        cardId: '12345',
        list: 'Ideas',
      },
    },
    source: 'zapier',
    timestamp: Date.now(),
  };
}

/**
 * Validate webhook payload
 */
export function validateWebhookPayload(payload: any): payload is WebhookPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.action === 'string' &&
    typeof payload.data === 'object' &&
    typeof payload.data.content === 'string' &&
    typeof payload.source === 'string' &&
    typeof payload.timestamp === 'number' &&
    ['create', 'update', 'add_node'].includes(payload.action)
  );
}
