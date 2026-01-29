import { useState, useEffect } from 'react'
import type { ThemeMode } from '../utils/theme'
import {
  colorSchemes,
  getThemeMode,
  setThemeMode,
  getColorScheme,
  setColorScheme,
  applyTheme,
  applyColorScheme,
  getCustomColorSchemes,
  saveCustomColorScheme,
  deleteCustomColorScheme,
  exportThemeSettings,
  importThemeSettings,
  createCustomColorScheme,
  watchSystemTheme,
  type ColorScheme,
} from '../utils/theme'

interface ThemeSettingsPanelProps {
  visible: boolean
  onClose: () => void
  onThemeChange?: () => void
}

export default function ThemeSettingsPanel({
  visible,
  onClose,
  onThemeChange,
}: ThemeSettingsPanelProps) {
  const [themeMode, setLocalThemeMode] = useState<ThemeMode>(getThemeMode())
  const [currentScheme, setCurrentScheme] = useState<ColorScheme>(getColorScheme())
  const [customSchemes, setCustomSchemes] = useState<ColorScheme[]>(getCustomColorSchemes())
  const [showCustomEditor, setShowCustomEditor] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (visible) {
      setLocalThemeMode(getThemeMode())
      setCurrentScheme(getColorScheme())
      setCustomSchemes(getCustomColorSchemes())
    }
  }, [visible])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const cleanup = watchSystemTheme(mode => {
      applyTheme(mode)
      onThemeChange?.()
    })

    return cleanup
  }, [onThemeChange])

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 3000)
  }

  const handleThemeModeChange = (mode: ThemeMode) => {
    setLocalThemeMode(mode)
    setThemeMode(mode)
    applyTheme(mode)
    onThemeChange?.()
  }

  const handleColorSchemeChange = (schemeId: string) => {
    const allSchemes = [...colorSchemes, ...customSchemes]
    const scheme = allSchemes.find(s => s.id === schemeId)
    if (scheme) {
      setCurrentScheme(scheme)
      setColorScheme(schemeId)
      applyColorScheme(scheme)
      onThemeChange?.()
    }
  }

  const handleDeleteCustomScheme = (schemeId: string) => {
    if (confirm('Are you sure you want to delete this color scheme?')) {
      deleteCustomColorScheme(schemeId)
      setCustomSchemes(getCustomColorSchemes())
      if (currentScheme.id === schemeId) {
        const defaultScheme = colorSchemes[0]
        setCurrentScheme(defaultScheme)
        setColorScheme(defaultScheme.id)
        applyColorScheme(defaultScheme)
      }
      showStatus('success', 'Color scheme deleted')
    }
  }

  const handleExport = () => {
    const json = exportThemeSettings()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'theme-settings.json'
    a.click()
    URL.revokeObjectURL(url)
    showStatus('success', 'Theme settings exported')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = event => {
          const json = event.target?.result as string
          if (importThemeSettings(json)) {
            setLocalThemeMode(getThemeMode())
            setCurrentScheme(getColorScheme())
            setCustomSchemes(getCustomColorSchemes())
            showStatus('success', 'Theme settings imported')
          } else {
            showStatus('error', 'Invalid theme settings file')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '450px',
        maxHeight: '80vh',
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🎨</span>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Theme Settings</h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
        {/* Status Message */}
        {statusMessage && (
          <div
            style={{
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '6px',
              background: statusMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: statusMessage.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: '13px',
            }}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Theme Mode */}
        <div style={{ marginBottom: '24px' }}>
          <h3
            style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}
          >
            Theme Mode
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['light', 'dark', 'auto'] as ThemeMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => handleThemeModeChange(mode)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: themeMode === mode ? '#667eea' : '#f3f4f6',
                  color: themeMode === mode ? 'white' : '#374151',
                  border: themeMode === mode ? '2px solid #667eea' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: themeMode === mode ? 1 : 0.7,
                }}
              >
                {mode === 'light' && '☀️ Light'}
                {mode === 'dark' && '🌙 Dark'}
                {mode === 'auto' && '🔄 Auto'}
              </button>
            ))}
          </div>
          {themeMode === 'auto' && (
            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
              Automatically switches based on your system preferences
            </p>
          )}
        </div>

        {/* Color Schemes */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: '#374151' }}>
              Color Scheme
            </h3>
            <button
              onClick={() => setShowCustomEditor(!showCustomEditor)}
              style={{
                padding: '6px 12px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
              }}
            >
              {showCustomEditor ? '−' : '+'} Custom
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {colorSchemes.map(scheme => (
              <ColorSchemeCard
                key={scheme.id}
                scheme={scheme}
                isSelected={currentScheme.id === scheme.id}
                onClick={() => handleColorSchemeChange(scheme.id)}
              />
            ))}

            {customSchemes.map(scheme => (
              <div key={scheme.id} style={{ position: 'relative' }}>
                <ColorSchemeCard
                  scheme={scheme}
                  isSelected={currentScheme.id === scheme.id}
                  onClick={() => handleColorSchemeChange(scheme.id)}
                />
                <button
                  onClick={() => handleDeleteCustomScheme(scheme.id)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '20px',
                    height: '20px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Delete custom scheme"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Scheme Editor */}
        {showCustomEditor && (
          <CustomSchemeEditor
            onSave={scheme => {
              saveCustomColorScheme(scheme)
              setCustomSchemes(getCustomColorSchemes())
              setShowCustomEditor(false)
              showStatus('success', 'Custom scheme created')
            }}
            onCancel={() => setShowCustomEditor(false)}
          />
        )}

        {/* Import/Export */}
        <div>
          <h3
            style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}
          >
            Share Settings
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleExport}
              style={{
                flex: 1,
                padding: '10px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
              }}
            >
              📥 Export
            </button>
            <button
              onClick={handleImport}
              style={{
                flex: 1,
                padding: '10px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
              }}
            >
              📤 Import
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Color Scheme Card Component
 */
function ColorSchemeCard({
  scheme,
  isSelected,
  onClick,
}: {
  scheme: ColorScheme
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px',
        background: isSelected ? '#eff6ff' : '#f9fafb',
        border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isSelected ? '#3b82f6' : '#d1d5db'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isSelected ? '#3b82f6' : '#e5e7eb'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: `linear-gradient(135deg, ${scheme.preview[0]} 0%, ${scheme.preview[1]} 100%)`,
          }}
        />
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#111827' }}>{scheme.name}</span>
      </div>
      <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>
        {scheme.description}
      </p>
    </div>
  )
}

/**
 * Custom Scheme Editor Component
 */
function CustomSchemeEditor({
  onSave,
  onCancel,
}: {
  onSave: (scheme: ColorScheme) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [colors, setColors] = useState({
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#ffffff',
    text: '#111827',
  })

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a name for your color scheme')
      return
    }

    const scheme = createCustomColorScheme(name, colors)
    onSave(scheme)
  }

  return (
    <div
      style={{
        padding: '16px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '16px',
      }}
    >
      <h4 style={{ margin: 0, marginBottom: '12px', fontSize: '13px', fontWeight: 'bold' }}>
        Create Custom Scheme
      </h4>

      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Scheme name..."
        style={{
          width: '100%',
          padding: '8px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '13px',
          marginBottom: '12px',
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        {Object.entries(colors).map(([key, value]) => (
          <div key={key}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#374151',
              }}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input
                type="color"
                value={value}
                onChange={e => setColors({ ...colors, [key]: e.target.value })}
                style={{
                  width: '40px',
                  height: '32px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
              <input
                type="text"
                value={value}
                onChange={e => setColors({ ...colors, [key]: e.target.value })}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div
        style={{
          padding: '12px',
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          color: colors.text,
          border: `1px solid ${colors.secondary}`,
          borderRadius: '4px',
          marginBottom: '12px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 'bold',
        }}
      >
        Preview Text
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: '8px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '8px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
