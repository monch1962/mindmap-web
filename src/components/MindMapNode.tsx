import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { MindMapNodeData } from '../types';
import { getIconEmoji } from '../utils/icons';
import { sanitizeHtml } from '../utils/sanitize';
import RichTextEditor from './RichTextEditor';

const MindMapNode = memo(({ data, selected, id }: NodeProps<MindMapNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localChecked, setLocalChecked] = useState(data.checked || false);
  const contentRef = useRef<HTMLDivElement>(null);

  const isRoot = data.isRoot || false;

  const defaultStyle = {
    fontSize: data.fontSize || (isRoot ? 18 : 14),
    color: data.color || (isRoot ? '#1e40af' : '#333'),
    fontWeight: data.bold ? 'bold' as const : (isRoot ? 'bold' as const : 'normal' as const),
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
  const iconEmoji = data.icon ? getIconEmoji(data.icon) : null;

  // Check if label contains HTML (rich text)
  const isRichText = data.label.includes('<') && data.label.includes('>');

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = (newContent: string) => {
    // Trigger update via a custom event that the canvas will handle
    const event = new CustomEvent('nodeLabelChange', {
      detail: { nodeId: id, label: newContent },
    });
    window.dispatchEvent(event);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleToggleCheckbox = () => {
    const newChecked = !localChecked;
    setLocalChecked(newChecked);
    const event = new CustomEvent('nodeCheckboxChange', {
      detail: { nodeId: id, checked: newChecked },
    });
    window.dispatchEvent(event);
  };

  const handleCollapseAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent('collapseAllDescendants', {
      detail: { nodeId: id },
    });
    window.dispatchEvent(event);
  };

  const handleExpandAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent('expandAllDescendants', {
      detail: { nodeId: id },
    });
    window.dispatchEvent(event);
  };

  // Listen for E key to edit and triggerNodeEdit event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use E key instead of F2 for better cross-platform compatibility
      if (e.key === 'e' && selected && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsEditing(true);
      }
    };

    const handleTriggerEdit = (e: Event) => {
      const customEvent = e as CustomEvent;
      if ((customEvent.detail as any)?.nodeId === id) {
        setIsEditing(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('triggerNodeEdit', handleTriggerEdit);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('triggerNodeEdit', handleTriggerEdit);
    };
  }, [selected, id]);

  return (
    <div
      className={`mindmap-node ${selected ? 'selected' : ''} ${isRoot ? 'root-node' : ''}`}
      style={{
        padding: isRoot ? '16px 20px' : '12px 16px',
        borderRadius: isRoot ? '12px' : '8px',
        border: '2px solid ' + (selected ? '#3b82f6' : (isRoot ? '#3b82f6' : '#e5e7eb')),
        background: data.backgroundColor || (isRoot ? '#eff6ff' : 'white'),
        minWidth: isRoot ? '150px' : '100px',
        maxWidth: isRoot ? '400px' : '300px',
        boxShadow: selected
          ? '0 4px 12px rgba(59, 130, 246, 0.3)'
          : (isRoot ? '0 6px 16px rgba(59, 130, 246, 0.25)' : '0 2px 8px rgba(0,0,0,0.1)'),
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Input handle (for connections from parents) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#3b82f6', width: 8, height: 8 }}
      />

      {/* Icon (if present) */}
      {iconEmoji && (
        <div
          style={{
            position: 'absolute',
            left: -10,
            top: -10,
            fontSize: '16px',
          }}
          title={`Icon: ${data.icon}`}
        >
          {iconEmoji}
        </div>
      )}

      {/* Rich Text Editor */}
      {isEditing && (
        <div style={{ position: 'absolute', zIndex: 1000, top: '-140px', left: 0 }}>
          <RichTextEditor
            content={data.label}
            onChange={() => {}}
            onSave={handleSave}
            onCancel={handleCancel}
            placeholder="Enter node text..."
          />
        </div>
      )}

      {/* Node content */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* Checkbox for task nodes */}
        {(data.nodeType === 'checkbox' || data.checked !== undefined) && (
          <input
            type="checkbox"
            checked={localChecked}
            onChange={handleToggleCheckbox}
            onClick={(e) => e.stopPropagation()}
            style={{
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              flexShrink: 0,
            }}
          />
        )}

        {/* Label */}
        <div
          ref={contentRef}
          contentEditable={!isRichText}
          suppressContentEditableWarning
          onInput={(e) => {
            if (isRichText) return; // RichTextEditor handles its own input
            const content = e.currentTarget.innerHTML;
            // Sanitize and dispatch change event
            const sanitizedContent = isRichText ? content : content; // Don't sanitize plain text yet
            const event = new CustomEvent('nodeLabelChange', {
              detail: { nodeId: id, content: sanitizedContent },
            });
            window.dispatchEvent(event);
          }}
          style={{
            ...defaultStyle,
            outline: 'none',
            cursor: hasLink ? 'pointer' : 'text',
            textDecoration: hasLink ? 'underline' : 'none',
            textDecorationLine: localChecked ? 'line-through' : undefined,
            opacity: localChecked ? 0.6 : 1,
            flex: 1,
          }}
          className="node-content"
          title={hasLink ? data.link || data.metadata?.url : undefined}
          dangerouslySetInnerHTML={isRichText ? { __html: sanitizeHtml(data.label) } : undefined}
        >
          {!isRichText && data.label}
        </div>

        {/* Progress bar */}
        {data.nodeType === 'progress' && data.progress !== undefined && (
          <div
            style={{
              width: '60px',
              height: '6px',
              background: '#e5e7eb',
              borderRadius: '3px',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: `${data.progress}%`,
                height: '100%',
                background: data.progress >= 100 ? '#10b981' : '#3b82f6',
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        )}
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

      {/* Collapse/Expand All buttons - visible on hover/select */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            right: -50,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 1000,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Expand all clicked for node:', id);
              handleExpandAll(e);
            }}
            title="Expand all descendants"
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              flexShrink: 0,
            }}
            type="button"
          >
            +
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Collapse all clicked for node:', id);
              handleCollapseAll(e);
            }}
            title="Collapse all descendants"
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              flexShrink: 0,
            }}
            type="button"
          >
            -
          </button>
        </div>
      )}

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
