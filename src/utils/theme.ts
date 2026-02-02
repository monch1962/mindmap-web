/**
 * Theme management utilities
 * Supports light/dark modes and custom color schemes
 */

export type ThemeMode = 'light' | 'dark' | 'auto'

export interface ColorScheme {
  id: string
  name: string
  description: string
  preview: string[]
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    nodeBackground: string
    nodeBorder: string
    edge: string
  }
}

/**
 * Predefined color schemes
 */
export const colorSchemes: ColorScheme[] = [
  {
    id: 'default',
    name: 'Classic Blue',
    description: 'Traditional blue gradient theme',
    preview: ['#667eea', '#764ba2'],
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#d1d5db',
      nodeBackground: '#ffffff',
      nodeBorder: '#d1d5db',
      edge: '#9ca3af',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calm blue and teal tones',
    preview: ['#0ea5e9', '#14b8a6'],
    colors: {
      primary: '#0ea5e9',
      secondary: '#14b8a6',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      textSecondary: '#075985',
      border: '#bae6fd',
      nodeBackground: '#ffffff',
      nodeBorder: '#7dd3fc',
      edge: '#38bdf8',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green palette',
    preview: ['#22c55e', '#16a34a'],
    colors: {
      primary: '#22c55e',
      secondary: '#16a34a',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: '#14532d',
      textSecondary: '#166534',
      border: '#bbf7d0',
      nodeBackground: '#ffffff',
      nodeBorder: '#86efac',
      edge: '#4ade80',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and coral',
    preview: ['#f97316', '#ef4444'],
    colors: {
      primary: '#f97316',
      secondary: '#ef4444',
      background: '#fff7ed',
      surface: '#ffedd5',
      text: '#7c2d12',
      textSecondary: '#9a3412',
      border: '#fed7aa',
      nodeBackground: '#ffffff',
      nodeBorder: '#fdba74',
      edge: '#fb923c',
    },
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Elegant purple tones',
    preview: ['#a855f7', '#7c3aed'],
    colors: {
      primary: '#a855f7',
      secondary: '#7c3aed',
      background: '#faf5ff',
      surface: '#f3e8ff',
      text: '#581c87',
      textSecondary: '#6b21a8',
      border: '#e9d5ff',
      nodeBackground: '#ffffff',
      nodeBorder: '#c4b5fd',
      edge: '#a78bfa',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Dark theme for night work',
    preview: ['#1f2937', '#111827'],
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
      nodeBackground: '#1f2937',
      nodeBorder: '#4b5563',
      edge: '#6b7280',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Deep blue dark theme',
    preview: ['#1e3a8a', '#172554'],
    colors: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
      nodeBackground: '#1e293b',
      nodeBorder: '#475569',
      edge: '#64748b',
    },
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    description: 'Soft pink and rose tones',
    preview: ['#fb7185', '#f43f5e'],
    colors: {
      primary: '#fb7185',
      secondary: '#f43f5e',
      background: '#fff1f2',
      surface: '#ffe4e6',
      text: '#881337',
      textSecondary: '#9f1239',
      border: '#fecdd3',
      nodeBackground: '#ffffff',
      nodeBorder: '#fda4af',
      edge: '#fb7185',
    },
  },
  {
    id: 'amber',
    name: 'Golden Hour',
    description: 'Warm amber and yellow',
    preview: ['#f59e0b', '#d97706'],
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      background: '#fffbeb',
      surface: '#fef3c7',
      text: '#78350f',
      textSecondary: '#92400e',
      border: '#fde68a',
      nodeBackground: '#ffffff',
      nodeBorder: '#fcd34d',
      edge: '#fbbf24',
    },
  },
  {
    id: 'slate',
    name: 'Slate Gray',
    description: 'Professional gray tones',
    preview: ['#64748b', '#475569'],
    colors: {
      primary: '#64748b',
      secondary: '#475569',
      background: '#f8fafc',
      surface: '#f1f5f9',
      text: '#0f172a',
      textSecondary: '#334155',
      border: '#e2e8f0',
      nodeBackground: '#ffffff',
      nodeBorder: '#cbd5e1',
      edge: '#94a3b8',
    },
  },
]

/**
 * Get current theme mode
 */
export function getThemeMode(): ThemeMode {
  const saved = localStorage.getItem('theme_mode')
  if (saved === 'light' || saved === 'dark' || saved === 'auto') {
    return saved
  }
  return 'auto'
}

/**
 * Set theme mode
 */
export function setThemeMode(mode: ThemeMode): void {
  localStorage.setItem('theme_mode', mode)
  applyTheme(mode)
}

/**
 * Toggle between light and dark mode
 */
export function toggleDarkMode(): void {
  const current = getThemeMode()
  const newMode: ThemeMode = current === 'dark' ? 'light' : 'dark'
  setThemeMode(newMode)
}

/**
 * Get current effective theme (resolves 'auto' to actual mode)
 */
export function getEffectiveTheme(): 'light' | 'dark' {
  const mode = getThemeMode()
  if (mode === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

/**
 * Get current color scheme
 */
export function getColorScheme(): ColorScheme {
  const saved = localStorage.getItem('color_scheme')
  return colorSchemes.find(s => s.id === saved) || colorSchemes[0]
}

/**
 * Set color scheme
 */
export function setColorScheme(schemeId: string): void {
  const scheme = colorSchemes.find(s => s.id === schemeId)
  if (scheme) {
    localStorage.setItem('color_scheme', schemeId)
    applyColorScheme(scheme)
  }
}

/**
 * Apply theme to document
 */
export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement

  if (mode === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    root.setAttribute('data-theme', mode)
  }
}

/**
 * Apply color scheme to CSS variables
 */
export function applyColorScheme(scheme: ColorScheme): void {
  const root = document.documentElement
  const colors = scheme.colors

  root.style.setProperty('--color-primary', colors.primary)
  root.style.setProperty('--color-secondary', colors.secondary)
  root.style.setProperty('--color-background', colors.background)
  root.style.setProperty('--color-surface', colors.surface)
  root.style.setProperty('--color-text', colors.text)
  root.style.setProperty('--color-text-secondary', colors.textSecondary)
  root.style.setProperty('--color-border', colors.border)
  root.style.setProperty('--color-node-background', colors.nodeBackground)
  root.style.setProperty('--color-node-border', colors.nodeBorder)
  root.style.setProperty('--color-edge', colors.edge)
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): void {
  const mode = getThemeMode()
  const scheme = getColorScheme()

  applyTheme(mode)
  applyColorScheme(scheme)
}

/**
 * Listen for system theme changes
 */
export function watchSystemTheme(callback: (mode: 'light' | 'dark') => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handler = (e: MediaQueryListEvent) => {
    if (getThemeMode() === 'auto') {
      callback(e.matches ? 'dark' : 'light')
    }
  }

  mediaQuery.addEventListener('change', handler)

  return () => {
    mediaQuery.removeEventListener('change', handler)
  }
}

/**
 * Create custom color scheme
 */
export function createCustomColorScheme(
  name: string,
  colors: Partial<ColorScheme['colors']>
): ColorScheme {
  const defaultScheme = colorSchemes[0]

  return {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description: 'Custom color scheme',
    preview: [
      colors.primary || defaultScheme.colors.primary,
      colors.secondary || defaultScheme.colors.secondary,
    ],
    colors: {
      ...defaultScheme.colors,
      ...colors,
    },
  }
}

/**
 * Save custom color scheme
 */
export function saveCustomColorScheme(scheme: ColorScheme): void {
  const customSchemes = getCustomColorSchemes()
  customSchemes.push(scheme)
  localStorage.setItem('custom_color_schemes', JSON.stringify(customSchemes))
}

/**
 * Get custom color schemes
 */
export function getCustomColorSchemes(): ColorScheme[] {
  try {
    const saved = localStorage.getItem('custom_color_schemes')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

/**
 * Delete custom color scheme
 */
export function deleteCustomColorScheme(schemeId: string): void {
  const customSchemes = getCustomColorSchemes()
  const filtered = customSchemes.filter(s => s.id !== schemeId)
  localStorage.setItem('custom_color_schemes', JSON.stringify(filtered))
}

/**
 * Export theme settings
 */
export function exportThemeSettings(): string {
  const settings = {
    mode: getThemeMode(),
    colorScheme: getColorScheme().id,
    customSchemes: getCustomColorSchemes(),
  }

  return JSON.stringify(settings, null, 2)
}

/**
 * Import theme settings
 */
export function importThemeSettings(json: string): boolean {
  try {
    const settings = JSON.parse(json)

    if (settings.mode) {
      setThemeMode(settings.mode)
    }

    if (settings.colorScheme) {
      setColorScheme(settings.colorScheme)
    }

    if (settings.customSchemes && Array.isArray(settings.customSchemes)) {
      localStorage.setItem('custom_color_schemes', JSON.stringify(settings.customSchemes))
    }

    return true
  } catch {
    return false
  }
}
