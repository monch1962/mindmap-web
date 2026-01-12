import { useState, useEffect } from 'react';

interface BulkOperationsPanelProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkIconChange: (icon: string | null) => void;
  onBulkCloudChange: (cloud: { color: string } | null) => void;
  onBulkColorChange: (color: string) => void;
  availableIcons: string[];
  onClearSelection: () => void;
  onClose: () => void;
}

const ICONS = [
  'star', 'flag', 'heart', 'check', 'warning',
  'idea', 'question', 'thumbs-up', 'thumbs-down', 'bookmark'
];

const CLOUD_COLORS = [
  { name: 'Red', value: '#fecaca' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Purple', value: '#e9d5ff' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Gray', value: '#e5e7eb' },
];

const NODE_COLORS = [
  { name: 'White', value: 'white' },
  { name: 'Light Red', value: '#fecaca' },
  { name: 'Light Blue', value: '#bfdbfe' },
  { name: 'Light Green', value: '#bbf7d0' },
  { name: 'Light Yellow', value: '#fef08a' },
  { name: 'Light Purple', value: '#e9d5ff' },
];

export default function BulkOperationsPanel({
  selectedCount,
  onBulkDelete,
  onBulkIconChange,
  onBulkCloudChange,
  onBulkColorChange,
  availableIcons,
  onClearSelection,
  onClose,
}: BulkOperationsPanelProps) {
  const [showIcons, setShowIcons] = useState(false);
  const [showClouds, setShowClouds] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isMobile ? '70px' : '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: isMobile ? '90vw' : '400px',
        maxWidth: isMobile ? '95vw' : '600px',
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
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
          📦 Bulk Operations ({selectedCount} nodes selected)
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

      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {/* Bulk Delete */}
          <button
            onClick={onBulkDelete}
            style={{
              padding: '6px 12px',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
            }}
            title="Delete all selected nodes"
          >
            🗑️ Delete All
          </button>

          {/* Bulk Icon Change */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowIcons(!showIcons);
                setShowClouds(false);
                setShowColors(false);
              }}
              style={{
                padding: '6px 12px',
                background: showIcons ? '#3b82f6' : '#f3f4f6',
                color: showIcons ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              🏷️ Set Icon
            </button>

            {/* Icon Dropdown */}
            {showIcons && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '4px',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  padding: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '4px',
                  minWidth: '200px',
                }}
              >
                <button
                  onClick={() => {
                    onBulkIconChange(null);
                    setShowIcons(false);
                  }}
                  style={{
                    padding: '4px 8px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    gridColumn: '1 / -1',
                  }}
                >
                  Clear Icons
                </button>
                {ICONS.map((icon) => {
                  const hasIcon = availableIcons.includes(icon);
                  return (
                    <button
                      key={icon}
                      onClick={() => {
                        onBulkIconChange(icon);
                        setShowIcons(false);
                      }}
                      style={{
                        padding: '4px',
                        background: hasIcon ? '#eff6ff' : 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                      title={icon}
                    >
                      {getIconEmoji(icon)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bulk Cloud Change */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowClouds(!showClouds);
                setShowIcons(false);
                setShowColors(false);
              }}
              style={{
                padding: '6px 12px',
                background: showClouds ? '#3b82f6' : '#f3f4f6',
                color: showClouds ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              ☁️ Set Cloud
            </button>

            {/* Cloud Dropdown */}
            {showClouds && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '4px',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '150px',
                }}
              >
                <button
                  onClick={() => {
                    onBulkCloudChange(null);
                    setShowClouds(false);
                  }}
                  style={{
                    padding: '4px 8px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Clear Clouds
                </button>
                {CLOUD_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      onBulkCloudChange({ color: color.value });
                      setShowClouds(false);
                    }}
                    style={{
                      padding: '4px 8px',
                      background: color.value,
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      textAlign: 'left',
                    }}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bulk Color Change */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowColors(!showColors);
                setShowIcons(false);
                setShowClouds(false);
              }}
              style={{
                padding: '6px 12px',
                background: showColors ? '#3b82f6' : '#f3f4f6',
                color: showColors ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              🎨 Set Color
            </button>

            {/* Color Dropdown */}
            {showColors && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '4px',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '150px',
                }}
              >
                {NODE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      onBulkColorChange(color.value);
                      setShowColors(false);
                    }}
                    style={{
                      padding: '4px 8px',
                      background: color.value,
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      textAlign: 'left',
                    }}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            style={{
              padding: '6px 12px',
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            ✖️ Clear Selection
          </button>
        </div>

        <div
          style={{
            fontSize: '11px',
            color: '#6b7280',
            textAlign: 'center',
            paddingTop: '8px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          Tip: Use Shift+Click to add/remove nodes from selection • Ctrl+A to select all
        </div>
      </div>
    </div>
  );
}

// Helper function to get icon emoji
function getIconEmoji(iconName: string): string {
  const iconMap: Record<string, string> = {
    'star': '⭐',
    'flag': '🚩',
    'heart': '❤️',
    'check': '✅',
    'warning': '⚠️',
    'idea': '💡',
    'question': '❓',
    'thumbs-up': '👍',
    'thumbs-down': '👎',
    'bookmark': '🔖',
  };
  return iconMap[iconName] || '📌';
}
