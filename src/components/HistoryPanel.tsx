import { type HistoryState } from '../hooks/useUndoRedo';

interface HistoryPanelProps {
  history: Array<HistoryState & { isCurrent: boolean }>;
  canUndo: boolean;
  canRedo: boolean;
  onJump: (index: number, fromPast: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClose: () => void;
}

/**
 * Format timestamp as readable time
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export default function HistoryPanel({
  history,
  canUndo,
  canRedo,
  onJump,
  onUndo,
  onRedo,
  onClose,
}: HistoryPanelProps) {
  const pastLength = history.filter(h => !h.isCurrent).length;
  const currentIndex = history.findIndex(h => h.isCurrent);

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
        minWidth: '500px',
        maxWidth: '600px',
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
          History Timeline
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

      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            padding: '6px 12px',
            background: canUndo ? '#3b82f6' : '#f3f4f6',
            color: canUndo ? 'white' : '#9ca3af',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          Undo (Ctrl+Z)
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            padding: '6px 12px',
            background: canRedo ? '#3b82f6' : '#f3f4f6',
            color: canRedo ? 'white' : '#9ca3af',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: canRedo ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          Redo (Ctrl+Y)
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {history.length} steps
        </div>
      </div>

      <div style={{ padding: '8px', overflowY: 'auto', flex: 1 }}>
        {history.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            No history yet. Actions will appear here as you make changes.
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div
              style={{
                position: 'absolute',
                left: '20px',
                top: '0',
                bottom: '0',
                width: '2px',
                background: '#e5e7eb',
              }}
            />

            {history.map((item, index) => (
              <div
                key={item.timestamp}
                style={{
                  position: 'relative',
                  paddingLeft: '44px',
                  paddingBottom: index === history.length - 1 ? '0' : '12px',
                }}
              >
                {/* Timeline dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '4px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: item.isCurrent ? '#3b82f6' : '#f3f4f6',
                    border: '2px solid ' + (item.isCurrent ? '#3b82f6' : '#d1d5db'),
                    zIndex: 1,
                  }}
                />

                {/* Timeline item */}
                <div
                  style={{
                    padding: '10px 12px',
                    border: '1px solid ' + (item.isCurrent ? '#3b82f6' : '#e5e7eb'),
                    borderRadius: '6px',
                    background: item.isCurrent ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => {
                    if (!item.isCurrent) {
                      // Calculate if this is from past or future
                      const isFromPast = index < (currentIndex >= 0 ? currentIndex : history.length - 1);
                      const adjustedIndex = isFromPast ? index : index - (currentIndex >= 0 ? currentIndex + 1 : history.length);
                      onJump(adjustedIndex, isFromPast);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!item.isCurrent) {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.isCurrent) {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: item.isCurrent ? '600' : '500', marginBottom: '4px' }}>
                        {item.isCurrent && (
                          <span style={{ color: '#3b82f6', marginRight: '4px' }}>●</span>
                        )}
                        {item.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        {item.nodes.length} nodes · {formatTimestamp(item.timestamp)}
                      </div>
                    </div>
                    {!item.isCurrent && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#6b7280',
                          background: '#f3f4f6',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {index < (currentIndex >= 0 ? currentIndex : history.length - 1) ? 'Undo' : 'Redo'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '11px',
          color: '#6b7280',
          background: '#f9fafb',
          borderRadius: '0 0 8px 8px',
        }}
      >
        Click any item to jump to that point in history
      </div>
    </div>
  );
}
