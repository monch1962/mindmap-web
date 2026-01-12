interface MobileToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onAddNode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleNotes: () => void;
  onToggleSearch: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
}

export default function MobileToolbar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onAddNode,
  onUndo,
  onRedo,
  onToggleNotes,
  onToggleSearch,
  canUndo,
  canRedo,
  hasSelection,
}: MobileToolbarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #d1d5db',
        padding: '8px 12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Zoom Controls */}
      <button
        onClick={onZoomOut}
        style={mobileButtonStyle}
        aria-label="Zoom out"
      >
        −
      </button>
      <button
        onClick={onFitView}
        style={mobileButtonStyle}
        aria-label="Fit view"
      >
        ⤢
      </button>
      <button
        onClick={onZoomIn}
        style={mobileButtonStyle}
        aria-label="Zoom in"
      >
        +
      </button>

      {/* Add Node */}
      <button
        onClick={onAddNode}
        style={mobileButtonStyle}
        aria-label="Add node"
      >
        +
      </button>

      {/* More Options Menu */}
      <button
        onClick={onToggleSearch}
        style={mobileButtonStyle}
        aria-label="Search"
      >
        🔍
      </button>

      {/* Undo/Redo Row */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        style={{
          ...mobileButtonStyle,
          opacity: canUndo ? 1 : 0.3,
        }}
        aria-label="Undo"
      >
        ↶
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        style={{
          ...mobileButtonStyle,
          opacity: canRedo ? 1 : 0.3,
        }}
        aria-label="Redo"
      >
        ↷
      </button>

      {/* Notes */}
      {hasSelection && (
        <button
          onClick={onToggleNotes}
          style={mobileButtonStyle}
          aria-label="Toggle notes"
        >
          📝
        </button>
      )}

      {/* Spacer for alignment */}
      <div style={{ gridColumn: hasSelection ? 'span 2' : 'span 3' }}></div>
    </div>
  );
}

const mobileButtonStyle: React.CSSProperties = {
  padding: '12px',
  background: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '18px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  minWidth: '44px',
  touchAction: 'manipulation',
};
