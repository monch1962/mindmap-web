import { useState } from 'react';
import { FREE_MIND_ICONS, ICON_CATEGORIES } from '../utils/icons';

interface IconPickerProps {
  onSelect: (iconId: string | null) => void;
  onClose: () => void;
  currentIcon?: string;
}

export default function IconPicker({ onSelect, onClose, currentIcon }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredIcons = search
    ? FREE_MIND_ICONS.filter(icon =>
        icon.name.toLowerCase().includes(search.toLowerCase()) ||
        icon.id.toLowerCase().includes(search.toLowerCase())
      )
    : selectedCategory
    ? ICON_CATEGORIES.find(cat => cat.id === selectedCategory)?.icons || []
    : FREE_MIND_ICONS;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Choose Icon</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 8px',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search icons..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedCategory(null);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearch('');
            }}
            style={{
              padding: '6px 12px',
              background: selectedCategory === null ? '#3b82f6' : '#f3f4f6',
              color: selectedCategory === null ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: selectedCategory === null ? 'bold' : 'normal',
            }}
          >
            All ({FREE_MIND_ICONS.length})
          </button>
          {ICON_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSearch('');
              }}
              style={{
                padding: '6px 12px',
                background: selectedCategory === category.id ? '#3b82f6' : '#f3f4f6',
                color: selectedCategory === category.id ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
              }}
            >
              {category.name} ({category.icons.length})
            </button>
          ))}
        </div>
      </div>

      {/* Icons grid */}
      <div
        style={{
          padding: '16px',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
            gap: '8px',
          }}
        >
          {/* Remove icon option */}
          <button
            onClick={() => onSelect(null)}
            style={{
              padding: '8px',
              border: currentIcon === null ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              borderRadius: '8px',
              background: currentIcon === null ? '#eff6ff' : 'white',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '50px',
            }}
            title="Remove icon"
          >
            ❌
          </button>

          {/* Icon options */}
          {filteredIcons.map((icon) => (
            <button
              key={icon.id}
              onClick={() => onSelect(icon.id)}
              style={{
                padding: '8px',
                border: currentIcon === icon.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '8px',
                background: currentIcon === icon.id ? '#eff6ff' : 'white',
                cursor: 'pointer',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50px',
                transition: 'all 0.2s ease',
              }}
              title={`${icon.name} (${icon.id})`}
            >
              {icon.emoji}
            </button>
          ))}
        </div>

        {filteredIcons.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280',
            }}
          >
            No icons found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
