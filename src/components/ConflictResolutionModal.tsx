import { type SaveSlot } from '../hooks/useAutoSave';

interface ConflictResolutionModalProps {
  saveSlot: SaveSlot | null;
  onRestore: () => void;
  onDismiss: () => void;
}

export default function ConflictResolutionModal({
  saveSlot,
  onRestore,
  onDismiss,
}: ConflictResolutionModalProps) {
  if (!saveSlot) return null;

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
        minWidth: '400px',
        maxWidth: '500px',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          Recover Auto-Saved Version?
        </h2>
      </div>

      <div style={{ padding: '16px' }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.5' }}>
          We found an auto-saved version of your mind map from{' '}
          <strong>{saveSlot.label}</strong>.
        </p>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.5' }}>
          Would you like to restore it, or start with a blank canvas?
        </p>
        <div
          style={{
            padding: '12px',
            background: '#f3f4f6',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#6b7280',
          }}
        >
          <div style={{ marginBottom: '4px' }}>
            <strong>Auto-saved version:</strong> {saveSlot.nodes.length} nodes
          </div>
          <div>Restoring will replace your current blank canvas.</div>
        </div>
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
        }}
      >
        <button
          onClick={onDismiss}
          style={{
            padding: '8px 16px',
            background: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          Start Fresh
        </button>
        <button
          onClick={onRestore}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          Restore Auto-Save
        </button>
      </div>
    </div>
  );
}
