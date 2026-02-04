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
      secondary: '#8b5cf6', // Brighter purple for better luminance difference
      background: '#ffffff',
      surface: '#f3f4f6', // Darkened from #f9fafb to increase contrast with background
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#6b7280',
      nodeBackground: '#ffffff',
      nodeBorder: '#6b7280',
      edge: '#4b5563',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calm blue and teal tones',
    preview: ['#0ea5e9', '#14b8a6'],
    colors: {
      primary: '#0284c7',
      secondary: '#0ea5e9', // Brighter blue for better luminance difference
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      textSecondary: '#075985',
      border: '#0284c7',
      nodeBackground: '#ffffff',
      nodeBorder: '#0369a1',
      edge: '#075985',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green palette',
    preview: ['#22c55e', '#16a34a'],
    colors: {
      primary: '#16a34a',
      secondary: '#22c55e', // Brighter green for better luminance difference
      background: '#f0fdf4',
      surface: '#d1fae5', // Darkened from #dcfce7 to increase contrast with background
      text: '#14532d',
      textSecondary: '#166534',
      border: '#16a34a',
      nodeBackground: '#ffffff',
      nodeBorder: '#15803d',
      edge: '#166534',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and coral',
    preview: ['#f97316', '#ef4444'],
    colors: {
      primary: '#ea580c',
      secondary: '#f97316', // Brighter orange for better luminance difference
      background: '#fff7ed',
      surface: '#ffedd5',
      text: '#7c2d12',
      textSecondary: '#9a3412',
      border: '#ea580c',
      nodeBackground: '#ffffff',
      nodeBorder: '#c2410c',
      edge: '#9a3412',
    },
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Elegant purple tones',
    preview: ['#a855f7', '#7c3aed'],
    colors: {
      primary: '#7c3aed',
      secondary: '#a855f7', // Brighter purple for better luminance difference
      background: '#faf5ff',
      surface: '#f3e8ff',
      text: '#581c87',
      textSecondary: '#6b21a8',
      border: '#7c3aed',
      nodeBackground: '#ffffff',
      nodeBorder: '#6d28d9',
      edge: '#5b21b6',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Dark theme for night work',
    preview: ['#1f2937', '#111827'],
    colors: {
      primary: '#6366f1',
      secondary: '#ec4899', // Pink color for better luminance difference (was #8b5cf6)
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#6b7280',
      nodeBackground: '#1f2937',
      nodeBorder: '#9ca3af',
      edge: '#d1d5db',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Deep blue dark theme',
    preview: ['#1e3a8a', '#172554'],
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa', // Brighter blue for better luminance difference
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#64748b',
      nodeBackground: '#1e293b',
      nodeBorder: '#94a3b8',
      edge: '#cbd5e1',
    },
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    description: 'Soft pink and rose tones',
    preview: ['#fb7185', '#f43f5e'],
    colors: {
      primary: '#f43f5e',
      secondary: '#fb7185', // Brighter pink for better luminance difference
      background: '#fff1f2',
      surface: '#ffe4e6',
      text: '#881337',
      textSecondary: '#9f1239',
      border: '#f43f5e',
      nodeBackground: '#ffffff',
      nodeBorder: '#e11d48',
      edge: '#be123c',
    },
  },
  {
    id: 'amber',
    name: 'Golden Hour',
    description: 'Warm amber and yellow',
    preview: ['#f59e0b', '#d97706'],
    colors: {
      primary: '#d97706',
      secondary: '#f59e0b', // Brighter amber for better luminance difference
      background: '#fffbeb',
      surface: '#fef3c7',
      text: '#78350f',
      textSecondary: '#92400e',
      border: '#d97706',
      nodeBackground: '#ffffff',
      nodeBorder: '#b45309',
      edge: '#92400e',
    },
  },
  {
    id: 'slate',
    name: 'Slate Gray',
    description: 'Professional gray tones',
    preview: ['#64748b', '#475569'],
    colors: {
      primary: '#475569',
      secondary: '#64748b', // Brighter gray for better luminance difference
      background: '#f8fafc',
      surface: '#e2e8f0', // Darkened from #f1f5f9 to increase contrast with background
      text: '#0f172a',
      textSecondary: '#334155',
      border: '#475569',
      nodeBackground: '#ffffff',
      nodeBorder: '#334155',
      edge: '#1e293b',
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
