import type { Node, Edge } from 'reactflow';
import type { MindMapNodeData } from '../types';

interface StatisticsPanelProps {
  nodes: Node<MindMapNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  onClose: () => void;
}

/**
 * Calculate tree depth and node counts by level
 */
function calculateTreeStats(nodes: Node<MindMapNodeData>[], edges: Edge[]) {
  // Find root nodes (nodes with no incoming edges)
  const childIds = new Set(edges.map(e => e.target));
  const rootNodes = nodes.filter(n => !childIds.has(n.id));

  if (rootNodes.length === 0) {
    return { maxDepth: 0, nodesByLevel: { 0: nodes.length } };
  }

  let maxDepth = 0;
  const nodesByLevel: Record<number, number> = {};

  // Calculate depth for each node using BFS from roots
  const depthMap = new Map<string, number>();

  for (const root of rootNodes) {
    depthMap.set(root.id, 0);
    nodesByLevel[0] = (nodesByLevel[0] || 0) + 1;
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of edges) {
      const parentDepth = depthMap.get(edge.source);
      if (parentDepth !== undefined && depthMap.get(edge.target) === undefined) {
        const newDepth = parentDepth + 1;
        depthMap.set(edge.target, newDepth);
        nodesByLevel[newDepth] = (nodesByLevel[newDepth] || 0) + 1;
        maxDepth = Math.max(maxDepth, newDepth);
        changed = true;
      }
    }
  }

  return { maxDepth, nodesByLevel };
}

/**
 * Get icon distribution
 */
function getIconDistribution(nodes: Node<MindMapNodeData>[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  for (const node of nodes) {
    if (node.data.icon) {
      distribution[node.data.icon] = (distribution[node.data.icon] || 0) + 1;
    }
  }
  return distribution;
}

/**
 * Get cloud color distribution
 */
function getCloudDistribution(nodes: Node<MindMapNodeData>[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  for (const node of nodes) {
    if (node.data.cloud?.color) {
      distribution[node.data.cloud.color] = (distribution[node.data.cloud.color] || 0) + 1;
    }
  }
  return distribution;
}

/**
 * Format number with commas
 */
function formatNumber(num: number): string {
  return num.toLocaleString();
}

export default function StatisticsPanel({
  nodes,
  edges,
  selectedNodeId,
  onClose,
}: StatisticsPanelProps) {
  const { maxDepth, nodesByLevel } = calculateTreeStats(nodes, edges);
  const iconDistribution = getIconDistribution(nodes);
  const cloudDistribution = getCloudDistribution(nodes);

  // Calculate character counts
  const totalCharacters = nodes.reduce((sum, node) => sum + node.data.label.length, 0);
  const totalWords = nodes.reduce((sum, node) => {
    return sum + node.data.label.split(/\s+/).filter(w => w.length > 0).length;
  }, 0);

  const selectedNode = selectedNodeId
    ? nodes.find(n => n.id === selectedNodeId)
    : null;

  const selectedChars = selectedNode?.data.label.length || 0;
  const selectedWords = selectedNode
    ? selectedNode.data.label.split(/\s+/).filter(w => w.length > 0).length
    : 0;

  // Count cross-links vs tree edges
  const treeEdges = edges.filter(e => !e.data?.isCrossLink).length;
  const crossLinks = edges.filter(e => e.data?.isCrossLink).length;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '450px',
        maxWidth: '550px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          Mind Map Statistics
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '4px 8px',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
        {/* Overview */}
        <div style={{ marginBottom: '20px' }}>
          <h3
            style={{
              margin: '0 0 10px 0',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#374151',
            }}
          >
            Overview
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <div
              style={{
                padding: '10px',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                Total Nodes
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
                {formatNumber(nodes.length)}
              </div>
            </div>
            <div
              style={{
                padding: '10px',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                Max Depth
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>
                {maxDepth} {maxDepth === 1 ? 'level' : 'levels'}
              </div>
            </div>
            <div
              style={{
                padding: '10px',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                Tree Edges
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                {formatNumber(treeEdges)}
              </div>
            </div>
            <div
              style={{
                padding: '10px',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                Cross-Links
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                {formatNumber(crossLinks)}
              </div>
            </div>
          </div>
        </div>

        {/* Content Statistics */}
        <div style={{ marginBottom: '20px' }}>
          <h3
            style={{
              margin: '0 0 10px 0',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#374151',
            }}
          >
            Content
          </h3>
          <div
            style={{
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Total characters:</span>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{formatNumber(totalCharacters)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Total words:</span>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{formatNumber(totalWords)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Avg characters per node:</span>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>
                {nodes.length > 0 ? (totalCharacters / nodes.length).toFixed(1) : '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Node */}
        {selectedNode && (
          <div style={{ marginBottom: '20px' }}>
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              Selected Node
            </h3>
            <div
              style={{
                padding: '12px',
                background: '#eff6ff',
                borderRadius: '6px',
                border: '1px solid #bfdbfe',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#1e40af' }}>
                "{selectedNode.data.label.substring(0, 30)}
                {selectedNode.data.label.length > 30 ? '...' : ''}"
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Characters:</span>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{selectedChars}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Words:</span>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{selectedWords}</span>
              </div>
            </div>
          </div>
        )}

        {/* Nodes by Level */}
        {Object.keys(nodesByLevel).length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              Nodes by Level
            </h3>
            <div
              style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {Object.entries(nodesByLevel)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([level, count]) => (
                  <div
                    key={level}
                    style={{
                      padding: '6px 10px',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  >
                    Level {level}: <strong>{count}</strong>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Icon Distribution */}
        {Object.keys(iconDistribution).length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              Icons Used
            </h3>
            <div
              style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {Object.entries(iconDistribution).map(([icon, count]) => (
                <div
                  key={icon}
                  style={{
                    padding: '6px 10px',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{icon}</span>
                  <strong>×{count}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cloud Distribution */}
        {Object.keys(cloudDistribution).length > 0 && (
          <div>
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              Clouds Used
            </h3>
            <div
              style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {Object.entries(cloudDistribution).map(([color, count]) => (
                <div
                  key={color}
                  style={{
                    padding: '6px 10px',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: color,
                      border: '1px solid #d1d5db',
                    }}
                  />
                  <strong>×{count}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
