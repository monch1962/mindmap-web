import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { MindMapNodeData } from '../types';

const MindMapNode = memo(({ data, selected }: NodeProps<MindMapNodeData>) => {
  const defaultStyle = {
    fontSize: data.fontSize || 14,
    color: data.color || '#333',
    fontWeight: data.bold ? 'bold' as const : 'normal' as const,
    fontStyle: data.italic ? 'italic' as const : 'normal' as const,
    fontFamily: data.fontName || 'inherit',
  };

  const hasMetadata = data.metadata && (
    data.metadata.url ||
    data.metadata.description ||
    data.metadata.notes ||
    (data.metadata.tags && data.metadata.tags.length > 0) ||
    (data.metadata.attachments && data.metadata.attachments.length > 0)
  );

  const hasLink = data.link || data.metadata?.url;

  // FreeMind icon mapping
  const iconMap: Record<string, string> = {
    'yes': '✅',
    'no': '❌',
    'help': '❓',
    'idea': '💡',
    'important': '⭐',
    'wizard': '🧙',
    'time': '⏰',
    'warning': '⚠️',
    'flag': '🚩',
    'clanbomber': '💣',
    'desktopnew': '🖥️',
    'kde': '🐧',
    'gnome': '🐭',
    'linux': '🐧',
    'button_ok': '🆗',
    'button_cancel': '🚫',
  };

  return (
    <div
      className={`mindmap-node ${selected ? 'selected' : ''}`}
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        border: '2px solid ' + (selected ? '#3b82f6' : '#e5e7eb'),
        background: data.backgroundColor || 'white',
        minWidth: '100px',
        maxWidth: '300px',
        boxShadow: selected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Input handle (for connections from parents) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#3b82f6', width: 8, height: 8 }}
      />

      {/* Icon (if present) */}
      {data.icon && iconMap[data.icon] && (
        <div
          style={{
            position: 'absolute',
            left: -10,
            top: -10,
            fontSize: '16px',
          }}
          title={`Icon: ${data.icon}`}
        >
          {iconMap[data.icon]}
        </div>
      )}

      {/* Node content */}
      <div
        contentEditable
        suppressContentEditableWarning
        style={{
          ...defaultStyle,
          outline: 'none',
          cursor: hasLink ? 'pointer' : 'text',
          textDecoration: hasLink ? 'underline' : 'none',
        }}
        className="node-content"
        title={hasLink ? data.link || data.metadata?.url : undefined}
      >
        {data.label}
      </div>

      {/* Metadata indicators */}
      {(hasMetadata || data.link || data.icon) && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            maxWidth: '80px',
          }}
        >
          {data.link && (
            <div
              style={{
                background: '#f59e0b',
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
              title={`Link: ${data.link}`}
            >
              🔗
            </div>
          )}
          {data.metadata?.url && !data.link && (
            <div
              style={{
                background: '#f59e0b',
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
              title="Has URL in metadata"
            >
              🔗
            </div>
          )}
          {(data.metadata?.description || data.metadata?.notes) && (
            <div
              style={{
                background: '#8b5cf6',
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
              title="Has notes/description"
            >
              📝
            </div>
          )}
          {data.metadata?.tags && data.metadata.tags.length > 0 && (
            <div
              style={{
                background: '#10b981',
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
              title={`${data.metadata.tags.length} tag(s)`}
            >
              🏷️
            </div>
          )}
          {data.metadata?.attachments && data.metadata.attachments.length > 0 && (
            <div
              style={{
                background: '#ec4899',
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
              title={`${data.metadata.attachments.length} attachment(s)`}
            >
              📎
            </div>
          )}
        </div>
      )}

      {/* Output handle (for connections to children) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#3b82f6', width: 8, height: 8 }}
      />

      {/* Collapse indicator */}
      {data.collapsed && (
        <div
          style={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#3b82f6',
            color: 'white',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          +
        </div>
      )}
    </div>
  );
});

MindMapNode.displayName = 'MindMapNode';

export default MindMapNode;
