import { useState, useEffect } from 'react'
import BasePanel from './common/BasePanel'
import type { PanelProps } from '../types/common'

interface NotesPanelProps extends PanelProps {
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
    <BasePanel
      visible={visible}
      onClose={onClose}
      title="Notes"
      ariaLabel="Notes panel"
      position="right"
      size="md"
      customStyles={{
        width: '350px',
        maxHeight: '70vh',
      }}
    >
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
    </BasePanel>
  )
}
