import { useState } from 'react';
import { templates, getTemplatesByCategory, type Template } from '../utils/mindmapTemplates';
import type { MindMapTree } from '../types';

interface TemplatesPanelProps {
  visible: boolean;
  onClose: () => void;
  onApplyTemplate: (tree: ReturnType<Template['tree']>) => void;
}

export default function TemplatesPanel({ visible, onClose, onApplyTemplate }: TemplatesPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  if (!visible) return null;

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📚' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'personal', name: 'Personal', icon: '👤' },
    { id: 'project-management', name: 'Project Management', icon: '📋' },
    { id: 'brainstorming', name: 'Brainstorming', icon: '💡' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : getTemplatesByCategory(selectedCategory as Template['category']);

  const searchedTemplates = searchQuery
    ? filteredTemplates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredTemplates;

  const handleApplyTemplate = (template: Template) => {
    const tree = template.tree();
    onApplyTemplate(tree);
    onClose();
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '1200px',
        height: '80vh',
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '16px 16px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>📋</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              Mind Map Templates
            </h2>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
              Start with a pre-built template for faster mind mapping
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
          }}
        >
          ×
        </button>
      </div>

      {/* Search and Categories */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 16px',
                background: selectedCategory === cat.id ? '#667eea' : '#f3f4f6',
                color: selectedCategory === cat.id ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {searchedTemplates.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px',
              color: '#6b7280',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontSize: '16px', margin: 0 }}>No templates found</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Try a different search term or category</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {searchedTemplates.map((template) => (
              <div
                key={template.id}
                style={{
                  padding: '20px',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  >
                    {template.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                      {template.name}
                    </h3>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        padding: '2px 8px',
                        background: '#eff6ff',
                        color: '#3b82f6',
                        fontSize: '11px',
                        borderRadius: '4px',
                        fontWeight: '500',
                      }}
                    >
                      {template.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.5', marginBottom: '16px' }}>
                  {template.description}
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyTemplate(template);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#5a67d8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#667eea';
                    }}
                  >
                    Use Template
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewTemplate(template);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                    }}
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f9fafb',
          borderRadius: '0 0 16px 16px',
          fontSize: '13px',
          color: '#6b7280',
        }}
      >
        <div>
          Showing <strong>{searchedTemplates.length}</strong> of <strong>{templates.length}</strong> templates
        </div>
        <div>Press <kbd style={{ padding: '2px 6px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px' }}>Esc</kbd> to close</div>
      </div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <div
          onClick={() => setSelectedTemplate(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '700px',
              maxHeight: '80vh',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>{selectedTemplate.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedTemplate.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px 8px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <TreePreview tree={selectedTemplate.tree()} />
            </div>

            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                onClick={() => setSelectedTemplate(null)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleApplyTemplate(selectedTemplate);
                  setSelectedTemplate(null);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tree preview component
 */
function TreePreview({ tree, level = 0 }: { tree: MindMapTree; level?: number }) {
  const indent = level * 20;

  return (
    <div style={{ marginLeft: `${indent}px`, marginBottom: '8px' }}>
      <div
        style={{
          padding: '8px 12px',
          background: level === 0 ? '#667eea' : '#f3f4f6',
          color: level === 0 ? 'white' : '#111827',
          borderRadius: '6px',
          fontSize: level === 0 ? '14px' : '13px',
          fontWeight: level === 0 ? 'bold' : 'normal',
          marginBottom: '4px',
        }}
      >
        {tree.content}
      </div>
      {tree.children && tree.children.length > 0 && (
        <div style={{ marginLeft: '16px' }}>
          {tree.children.map((child: MindMapTree) => (
            <TreePreview key={child.id} tree={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
