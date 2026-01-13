import { memo } from 'react';
import type { Node } from 'reactflow';
import type { MindMapNodeData } from '../types';

interface CloudBackgroundProps {
  nodes: Node<MindMapNodeData>[];
}

/**
 * Renders cloud backgrounds behind nodes that have cloud data
 * Clouds are visual groupings similar to FreeMind's cloud feature
 */
const CloudBackground = memo(({ nodes }: CloudBackgroundProps) => {
  // Find all nodes with clouds
  const cloudNodes = nodes.filter((n) => n.data.cloud);

  if (cloudNodes.length === 0) return null;

  return (
    <svg
      role="presentation"
      aria-label="Cloud backgrounds visualizing node groupings"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {cloudNodes.map((node) => {
        const cloudColor = node.data.cloud?.color || '#f0f9ff';
        const x = node.position.x - 20;
        const y = node.position.y - 20;

        return (
          <ellipse
            key={node.id}
            cx={x + 100}
            cy={y + 30}
            rx={150}
            ry={60}
            fill={cloudColor}
            stroke={cloudColor}
            strokeWidth="2"
            opacity="0.3"
            style={{
              filter: 'blur(2px)',
            }}
            aria-label={`Cloud background for ${node.data.label || node.id}`}
          />
        );
      })}
    </svg>
  );
});

CloudBackground.displayName = 'CloudBackground';

export default CloudBackground;
