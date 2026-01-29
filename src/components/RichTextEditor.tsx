import { useState, useRef, useEffect } from 'react'
import { sanitizeHtml } from '../utils/sanitize'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  onSave: (newContent: string) => void
  onCancel: () => void
  placeholder?: string
}

export default function RichTextEditor({
  content,
  onChange,
  onSave,
  onCancel,
  placeholder = 'Enter text...',
}: RichTextEditorProps) {
  const [text, setText] = useState(content)
  const editorRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  // Sync local state with props when content changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Sanitize content on initialization
    const sanitizedContent = sanitizeHtml(content)

    if (editorRef.current) {
      // Only set innerHTML if content has actually changed
      if (!initializedRef.current || editorRef.current.innerHTML !== sanitizedContent) {
        editorRef.current.innerHTML = sanitizedContent
        initializedRef.current = true
      }
      setText(sanitizedContent)
    }
  }, [content])
  /* eslint-enable react-hooks/set-state-in-effect */

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      const sanitized = sanitizeHtml(html)
      setText(sanitized)
      onChange(sanitized)
    }
  }

  const handleLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl)
      setShowLinkModal(false)
      setLinkUrl('')
      // Sanitize after adding link
      setTimeout(handleInput, 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSave(text)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div
      role="region"
      aria-label="Rich text editor"
      style={{
        position: 'absolute',
        zIndex: 1000,
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: '300px',
        maxWidth: '500px',
      }}
    >
      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Text formatting toolbar"
        style={{
          display: 'flex',
          gap: '2px',
          padding: '4px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
          borderRadius: '6px 6px 0 0',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault()
            execCommand('bold')
          }}
          aria-label="Make text bold (Ctrl+B)"
          style={{
            padding: '4px 8px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault()
            execCommand('italic')
          }}
          aria-label="Make text italic (Ctrl+I)"
          style={{
            padding: '4px 8px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontStyle: 'italic',
          }}
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault()
            execCommand('underline')
          }}
          aria-label="Underline text (Ctrl+U)"
          style={{
            padding: '4px 8px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: 'underline',
          }}
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <div
          role="separator"
          aria-orientation="vertical"
          style={{ width: '1px', background: '#d1d5db', margin: '2px 4px' }}
        />
        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault()
            execCommand('foreColor', '#ef4444')
          }}
          aria-label="Apply red color to text"
          style={{
            padding: '4px 8px',
            background: '#fef2f2',
            color: '#ef4444',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
          title="Red text"
        >
          A
        </button>
        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault()
            execCommand('foreColor', '#3b82f6')
          }}
          aria-label="Apply blue color to text"
          style={{
            padding: '4px 8px',
            background: '#eff6ff',
            color: '#3b82f6',
            border: '1px solid #bfdbfe',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
          title="Blue text"
        >
          A
        </button>
        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault()
            execCommand('foreColor', '#10b981')
          }}
          aria-label="Apply green color to text"
          style={{
            padding: '4px 8px',
            background: '#ecfdf5',
            color: '#10b981',
            border: '1px solid #a7f3d0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
          title="Green text"
        >
          A
        </button>
        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault()
            execCommand('foreColor', '#f59e0b')
          }}
          aria-label="Apply orange color to text"
          style={{
            padding: '4px 8px',
            background: '#fffbeb',
            color: '#f59e0b',
            border: '1px solid #fde68a',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
          title="Orange text"
        >
          A
        </button>
        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault()
            execCommand('removeFormat')
          }}
          aria-label="Clear text formatting"
          style={{
            padding: '4px 8px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
          }}
          title="Clear formatting"
        >
          Clear
        </button>
        <div
          role="separator"
          aria-orientation="vertical"
          style={{ width: '1px', background: '#d1d5db', margin: '2px 4px' }}
        />
        <button
          type="button"
          onClick={() => setShowLinkModal(true)}
          aria-label="Insert link"
          aria-haspopup="dialog"
          style={{
            padding: '4px 8px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
          }}
          title="Insert link"
        >
          🔗 Link
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        role="textbox"
        aria-label="Text editor"
        aria-multiline="true"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning
        style={{
          padding: '8px 12px',
          minHeight: '60px',
          outline: 'none',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
        data-placeholder={placeholder}
      />

      {/* Link Modal */}
      {showLinkModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="link-modal-title"
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            marginTop: '4px',
            padding: '8px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1001,
            display: 'flex',
            gap: '4px',
          }}
        >
          <label htmlFor="link-url-input" style={{ display: 'none' }}>
            Enter link URL
          </label>
          <input
            id="link-url-input"
            type="text"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            aria-label="Enter link URL"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleLink()
              } else if (e.key === 'Escape') {
                setShowLinkModal(false)
                setLinkUrl('')
              }
            }}
            style={{
              flex: 1,
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
              outline: 'none',
            }}
            autoFocus
          />
          <button
            onClick={handleLink}
            aria-label="Add link to text"
            style={{
              padding: '4px 8px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Add
          </button>
        </div>
      )}

      {/* Footer */}
      <div
        role="status"
        aria-live="polite"
        style={{
          padding: '6px 12px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#6b7280',
        }}
      >
        <span>Enter to save, Escape to cancel</span>
      </div>
    </div>
  )
}
