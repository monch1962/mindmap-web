import { useState, useEffect } from 'react'

interface NotesPanelProps {
  visible: boolean
  onClose: () => void
  notes: string
  onSave: (notes: string) => void
}

export default function NotesPanel({ visible, onClose, notes, onSave }: NotesPanelProps) {
  const [content, setContent] = useState(notes)

  useEffect(() => {
    setContent(notes)
  }, [notes])

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-panel-title"
      aria-label="Notes panel"
      style={{
        position: 'fixed',
        right: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '350px',
        maxHeight: '70vh',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 id="notes-panel-title" style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          Notes
        </h3>
        <button
          onClick={onClose}
          aria-label="Close notes panel"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '0 4px',
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <textarea
        id="notes-content"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Enter detailed notes here..."
        aria-label="Notes content"
        aria-multiline="true"
        style={{
          flex: 1,
          padding: '12px',
          border: 'none',
          resize: 'none',
          fontSize: '14px',
          fontFamily: 'inherit',
          outline: 'none',
          minWidth: '0',
          borderRadius: '0 0 8px 8px',
        }}
      />

      {/* Footer */}
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
          onClick={() => {
            onSave(content)
            onClose()
          }}
          aria-label="Save and close notes"
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
          Save
        </button>
      </div>
    </div>
  )
}
