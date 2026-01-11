import { useState, useEffect, useRef } from 'react';
import type { NodeMetadata, FileAttachment } from '../types';

interface MetadataPanelProps {
  nodeId: string | null;
  nodeLabel: string;
  metadata?: NodeMetadata;
  onUpdateMetadata: (metadata: NodeMetadata) => void;
}

export default function MetadataPanel({
  nodeId,
  nodeLabel,
  metadata,
  onUpdateMetadata,
}: MetadataPanelProps) {
  const [url, setUrl] = useState(metadata?.url || '');
  const [description, setDescription] = useState(metadata?.description || '');
  const [notes, setNotes] = useState(metadata?.notes || '');
  const [tags, setTags] = useState(metadata?.tags?.join(', ') || '');
  const [attachments, setAttachments] = useState<FileAttachment[]>(metadata?.attachments || []);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(metadata?.url || '');
    setDescription(metadata?.description || '');
    setNotes(metadata?.notes || '');
    setTags(metadata?.tags?.join(', ') || '');
    setAttachments(metadata?.attachments || []);
  }, [metadata]);

  const handleSave = () => {
    const updatedMetadata: NodeMetadata = {};

    if (url.trim()) updatedMetadata.url = url.trim();
    if (description.trim()) updatedMetadata.description = description.trim();
    if (notes.trim()) updatedMetadata.notes = notes.trim();
    if (tags.trim()) {
      updatedMetadata.tags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (attachments.length > 0) updatedMetadata.attachments = attachments;

    onUpdateMetadata(updatedMetadata);
  };

  const handleClear = () => {
    setUrl('');
    setDescription('');
    setNotes('');
    setTags('');
    setAttachments([]);
    onUpdateMetadata({});
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newAttachment: FileAttachment = {
          id: `att_${Date.now()}`,
          name: file.name,
          type: 'image',
          mimeType: file.type,
          data: base64,
          size: file.size,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files, read as text
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const newAttachment: FileAttachment = {
          id: `att_${Date.now()}`,
          name: file.name,
          type: 'code',
          data: text,
          size: file.size,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsText(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddCode = () => {
    if (!codeInput.trim()) return;

    const newAttachment: FileAttachment = {
      id: `att_${Date.now()}`,
      name: `code.${codeLanguage}`,
      type: 'code',
      data: codeInput,
    };

    setAttachments((prev) => [...prev, newAttachment]);
    setCodeInput('');
    setShowCodeInput(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  if (!nodeId) {
    return (
      <div
        style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          width: '320px',
        }}
      >
        <div style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
          Select a node to edit metadata
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        width: '320px',
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
        Metadata
      </h3>

      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#6b7280' }}>
        Node: <strong>{nodeLabel}</strong>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* URL */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
            URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detailed notes..."
            rows={3}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Tags */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Attachments */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
            Attachments
          </label>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.go,.rs,.php,.rb,.swift,.kt,.scala,.rs,.html,.css,.json,.xml,.yaml,.yml,.md,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                flex: 1,
                padding: '6px 12px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              📎 Upload File
            </button>
            <button
              onClick={() => setShowCodeInput(!showCodeInput)}
              style={{
                flex: 1,
                padding: '6px 12px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              💻 Add Code
            </button>
          </div>

          {/* Code input */}
          {showCodeInput && (
            <div style={{ marginBottom: '8px' }}>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '4px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
                <option value="yaml">YAML</option>
                <option value="markdown">Markdown</option>
                <option value="text">Plain Text</option>
              </select>
              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Paste or type code here..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  marginBottom: '4px',
                }}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={handleAddCode}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowCodeInput(false);
                    setCodeInput('');
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Attachments list */}
          {attachments.length > 0 && (
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {attachments.map((att) => (
                <div
                  key={att.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    background: '#f9fafb',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {att.type === 'image' ? '🖼️ ' : '💻 '}
                      {att.name}
                    </div>
                    {att.type === 'image' && (
                      <img
                        src={att.data}
                        alt={att.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '60px',
                          marginTop: '4px',
                          borderRadius: '4px',
                        }}
                      />
                    )}
                    {att.type === 'code' && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#6b7280',
                          marginTop: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {att.data.slice(0, 50)}...
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveAttachment(att.id)}
                    style={{
                      padding: '4px 8px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      marginLeft: '4px',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
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
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
