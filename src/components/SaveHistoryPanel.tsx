import { type SaveSlot } from '../hooks/useAutoSave'

interface SaveHistoryPanelProps {
  saveHistory: SaveSlot[]
  onRestore: (index: number) => void
  onDelete: (index: number) => void
  onClose: () => void
}

export default function SaveHistoryPanel({
  saveHistory,
  onRestore,
  onDelete,
  onClose,
}: SaveHistoryPanelProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-history-title"
      aria-label="Save history"
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
        minWidth: '400px',
        maxWidth: '500px',
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
        <h2 id="save-history-title" style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          Save History
        </h2>
        <button
          onClick={onClose}
          aria-label="Close save history panel"
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
        role="list"
        aria-label="Auto-save slots"
        style={{ padding: '8px', maxHeight: '400px', overflowY: 'auto' }}
      >
        {saveHistory.length === 0 ? (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: '24px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            No save history yet. Auto-saves will appear here.
          </div>
        ) : (
          saveHistory.map((slot, index) => (
            <div
              key={slot.timestamp}
              role="listitem"
              aria-label={`${slot.label}, ${slot.nodes.length} nodes`}
              style={{
                padding: '12px',
                marginBottom: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: '#f9fafb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                  {slot.label}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{slot.nodes.length} nodes</div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => onRestore(index)}
                  aria-label={`Restore ${slot.label}`}
                  style={{
                    padding: '6px 12px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  Restore
                </button>
                <button
                  onClick={() => onDelete(index)}
                  aria-label={`Delete ${slot.label}`}
                  style={{
                    padding: '6px 12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        role="status"
        aria-live="polite"
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center',
        }}
      >
        Last {saveHistory.length} auto-save{saveHistory.length !== 1 ? 's' : ''} stored
      </div>
    </div>
  )
}
