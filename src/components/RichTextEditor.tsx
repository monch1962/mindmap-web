import { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: (newContent: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  onSave,
  onCancel,
  placeholder = 'Enter text...',
}: RichTextEditorProps) {
  const [text, setText] = useState(content);
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    setText(content);
  }, [content]);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      setText(editorRef.current.innerHTML);
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setShowLinkModal(false);
      setLinkUrl('');
      handleInput();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave(text);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
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
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('bold');
          }}
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
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('italic');
          }}
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
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('underline');
          }}
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
        <div style={{ width: '1px', background: '#d1d5db', margin: '2px 4px' }} />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('foreColor', '#ef4444');
          }}
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
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('foreColor', '#3b82f6');
          }}
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
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('foreColor', '#10b981');
          }}
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
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('foreColor', '#f59e0b');
          }}
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
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('removeFormat');
          }}
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
        <div style={{ width: '1px', background: '#d1d5db', margin: '2px 4px' }} />
        <button
          type="button"
          onClick={() => setShowLinkModal(true)}
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
        dangerouslySetInnerHTML={{ __html: text }}
      />

      {/* Link Modal */}
      {showLinkModal && (
        <div
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
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleLink();
              } else if (e.key === 'Escape') {
                setShowLinkModal(false);
                setLinkUrl('');
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
  );
}
