import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';
import type { EdgeProps } from 'reactflow';

const CrossLinkEdge = memo(({
  id: _id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#f59e0b',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        }}
      />
      {data?.isCrossLink && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: 10,
              background: '#f59e0b',
              color: 'white',
              padding: '2px 6px',
              borderRadius: 4,
              pointerEvents: 'all',
              cursor: 'pointer',
            }}
            className="edge-label"
          >
            ↗
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

CrossLinkEdge.displayName = 'CrossLinkEdge';

export default CrossLinkEdge;
