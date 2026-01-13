import { useState, useEffect } from 'react'

interface Shortcut {
  keys: string[]
  action: string
  category: string
  description?: string
}

const SHORTCUTS: Shortcut[] = [
  // Node Operations
  { keys: ['Tab'], action: 'Create child node', category: 'Node Operations' },
  { keys: ['Enter'], action: 'Create sibling node', category: 'Node Operations' },
  { keys: ['Delete', 'Backspace'], action: 'Delete selected node', category: 'Node Operations' },
  { keys: ['E'], action: 'Edit node text', category: 'Node Operations' },
  { keys: ['Space'], action: 'Toggle collapse state', category: 'Node Operations' },
  { keys: ['Shift', 'Click'], action: 'Multi-select nodes', category: 'Node Operations' },
  { keys: ['Ctrl', 'A'], action: 'Select all nodes', category: 'Node Operations' },

  // Navigation & View
  { keys: ['Ctrl', '+'], action: 'Zoom in', category: 'Navigation & View' },
  { keys: ['Ctrl', '-'], action: 'Zoom out', category: 'Navigation & View' },
  { keys: ['Ctrl', '0'], action: 'Fit view to all nodes', category: 'Navigation & View' },

  // Editing
  { keys: ['Ctrl', 'Z'], action: 'Undo', category: 'Editing' },
  { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo', category: 'Editing' },
  { keys: ['Ctrl', 'Y'], action: 'Redo', category: 'Editing' },
  { keys: ['Ctrl', 'S'], action: 'Manual save', category: 'Editing' },

  // Search & Navigation
  { keys: ['Ctrl', 'F'], action: 'Open search panel', category: 'Search & Navigation' },
  { keys: ['Ctrl', 'G'], action: 'Next search result', category: 'Search & Navigation' },
  {
    keys: ['Ctrl', 'Shift', 'G'],
    action: 'Previous search result',
    category: 'Search & Navigation',
  },

  // Panels
  { keys: ['Ctrl', 'N'], action: 'Toggle notes panel', category: 'Panels' },
  { keys: ['Ctrl', 'H'], action: 'Toggle save history', category: 'Panels' },
  { keys: ['Ctrl', 'Shift', 'H'], action: 'Toggle undo/redo history', category: 'Panels' },
  { keys: ['Ctrl', 'I'], action: 'Toggle statistics', category: 'Panels' },
  { keys: ['Ctrl', 'Shift', 'A'], action: 'Toggle AI Assistant', category: 'Panels' },
  { keys: ['Ctrl', 'Shift', 'C'], action: 'Toggle comments panel', category: 'Panels' },
  { keys: ['Escape'], action: 'Close panels', category: 'Panels' },
  { keys: ['?'], action: 'Show keyboard shortcuts', category: 'Panels' },
]

const CATEGORIES = Array.from(new Set(SHORTCUTS.map(s => s.category)))

interface KeyboardShortcutsModalProps {
  onClose: () => void
}

export default function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const filteredShortcuts = SHORTCUTS.filter(shortcut => {
    const matchesSearch =
      !searchQuery ||
      shortcut.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.keys.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = !selectedCategory || shortcut.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
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
        minWidth: isMobile ? '90vw' : '500px',
        maxWidth: isMobile ? '95vw' : '650px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
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
        <h2
          id="keyboard-shortcuts-title"
          style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}
        >
          ⌨️ Keyboard Shortcuts
        </h2>
        <button
          onClick={onClose}
          aria-label="Close keyboard shortcuts"
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

      {/* Search and Filter */}
      <div role="search" style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <label htmlFor="shortcuts-search" style={{ display: 'none' }}>
          Search shortcuts
        </label>
        <input
          id="shortcuts-search"
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search shortcuts..."
          aria-label="Search keyboard shortcuts"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            outline: 'none',
            marginBottom: '8px',
          }}
        />
        <div
          role="group"
          aria-label="Filter by category"
          style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}
        >
          <button
            onClick={() => setSelectedCategory(null)}
            aria-pressed={!selectedCategory}
            style={{
              padding: '4px 10px',
              background: !selectedCategory ? '#3b82f6' : '#f3f4f6',
              color: !selectedCategory ? 'white' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
            }}
          >
            All
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selectedCategory === category}
              style={{
                padding: '4px 10px',
                background: selectedCategory === category ? '#3b82f6' : '#f3f4f6',
                color: selectedCategory === category ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Shortcuts List */}
      <div
        role="region"
        aria-label="Keyboard shortcuts list"
        tabIndex={0}
        style={{ padding: '12px', overflowY: 'auto', flex: 1 }}
      >
        {filteredShortcuts.length === 0 ? (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: '24px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            No shortcuts found matching "{searchQuery}"
          </div>
        ) : (
          <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {CATEGORIES.filter(cat => !selectedCategory || cat === selectedCategory).map(
              category => (
                <div key={category} role="group" aria-label={category}>
                  <h3
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {category}
                  </h3>
                  <div
                    role="list"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    {filteredShortcuts
                      .filter(s => s.category === category)
                      .map((shortcut, index) => (
                        <div
                          key={index}
                          role="listitem"
                          style={{
                            padding: '8px 10px',
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px',
                          }}
                        >
                          <span style={{ color: '#374151' }}>{shortcut.action}</span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {shortcut.keys.map((key, i) => (
                              <span key={i}>
                                <kbd
                                  style={{
                                    padding: '2px 6px',
                                    background: 'white',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                    fontFamily: 'monospace',
                                    fontWeight: '500',
                                  }}
                                >
                                  {key}
                                </kbd>
                                {i < shortcut.keys.length - 1 && '+'}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '11px',
          color: '#6b7280',
          background: '#f9fafb',
          borderRadius: '0 0 8px 8px',
          textAlign: 'center',
        }}
      >
        Press{' '}
        <kbd
          style={{
            padding: '2px 4px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            fontSize: '10px',
          }}
        >
          ?
        </kbd>{' '}
        anytime to open this help
      </div>
    </div>
  )
}
