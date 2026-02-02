import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import {
  getThemeMode,
  setThemeMode,
  toggleDarkMode,
  getEffectiveTheme,
  getColorScheme,
  setColorScheme,
  applyTheme,
  applyColorScheme,
  initializeTheme,
  watchSystemTheme,
  createCustomColorScheme,
  saveCustomColorScheme,
  getCustomColorSchemes,
  deleteCustomColorScheme,
  exportThemeSettings,
  importThemeSettings,
  colorSchemes,
} from './theme'

describe('theme', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    // Mock document.documentElement
    document.documentElement.setAttribute('data-theme', '')
    document.documentElement.style.cssText = ''
    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('getThemeMode', () => {
    it('should return auto when no theme is saved', () => {
      expect(getThemeMode()).toBe('auto')
    })

    it('should return saved theme mode', () => {
      localStorage.setItem('theme_mode', 'dark')
      expect(getThemeMode()).toBe('dark')

      localStorage.setItem('theme_mode', 'light')
      expect(getThemeMode()).toBe('light')
    })

    it('should handle invalid saved mode', () => {
      localStorage.setItem('theme_mode', 'invalid')
      expect(getThemeMode()).toBe('auto')
    })
  })

  describe('setThemeMode', () => {
    it('should save theme mode to localStorage', () => {
      setThemeMode('dark')
      expect(localStorage.getItem('theme_mode')).toBe('dark')

      setThemeMode('light')
      expect(localStorage.getItem('theme_mode')).toBe('light')

      setThemeMode('auto')
      expect(localStorage.getItem('theme_mode')).toBe('auto')
    })

    it('should apply theme to document', () => {
      setThemeMode('dark')
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })
  })

  describe('toggleDarkMode', () => {
    it('should toggle from light to dark', () => {
      localStorage.setItem('theme_mode', 'light')
      toggleDarkMode()
      expect(localStorage.getItem('theme_mode')).toBe('dark')
    })

    it('should toggle from dark to light', () => {
      localStorage.setItem('theme_mode', 'dark')
      toggleDarkMode()
      expect(localStorage.getItem('theme_mode')).toBe('light')
    })

    it('should handle auto mode (defaults to dark)', () => {
      localStorage.setItem('theme_mode', 'auto')
      toggleDarkMode()
      expect(localStorage.getItem('theme_mode')).toBe('dark')
    })
  })

  describe('getEffectiveTheme', () => {
    it('should return light when mode is light', () => {
      localStorage.setItem('theme_mode', 'light')
      expect(getEffectiveTheme()).toBe('light')
    })

    it('should return dark when mode is dark', () => {
      localStorage.setItem('theme_mode', 'dark')
      expect(getEffectiveTheme()).toBe('dark')
    })

    it('should detect system dark mode', () => {
      localStorage.setItem('theme_mode', 'auto')
      ;(window.matchMedia as Mock).mockImplementation(() => ({
        matches: true,
        media: '(prefers-color-scheme: dark)',
      }))
      expect(getEffectiveTheme()).toBe('dark')
    })

    it('should detect system light mode', () => {
      localStorage.setItem('theme_mode', 'auto')
      ;(window.matchMedia as Mock).mockImplementation(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
      }))
      expect(getEffectiveTheme()).toBe('light')
    })
  })

  describe('getColorScheme', () => {
    it('should return default scheme when none saved', () => {
      const scheme = getColorScheme()
      expect(scheme.id).toBe('default')
      expect(scheme.name).toBe('Classic Blue')
    })

    it('should return saved color scheme', () => {
      localStorage.setItem('color_scheme', 'dark')
      const scheme = getColorScheme()
      expect(scheme.id).toBe('dark')
      expect(scheme.name).toBe('Dark Mode')
    })

    it('should return default for invalid saved scheme', () => {
      localStorage.setItem('color_scheme', 'invalid')
      const scheme = getColorScheme()
      expect(scheme.id).toBe('default')
    })
  })

  describe('setColorScheme', () => {
    it('should save valid color scheme', () => {
      setColorScheme('ocean')
      expect(localStorage.getItem('color_scheme')).toBe('ocean')
    })

    it('should not save invalid color scheme', () => {
      localStorage.setItem('color_scheme', 'default')
      setColorScheme('invalid')
      expect(localStorage.getItem('color_scheme')).toBe('default')
    })

    it('should apply color scheme to document', () => {
      const oceanScheme = colorSchemes.find(s => s.id === 'ocean')!
      setColorScheme('ocean')

      // Check that CSS variables are set
      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe(
        oceanScheme.colors.primary
      )
      expect(document.documentElement.style.getPropertyValue('--color-background')).toBe(
        oceanScheme.colors.background
      )
    })
  })

  describe('applyTheme', () => {
    it('should set data-theme attribute for light mode', () => {
      applyTheme('light')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('should set data-theme attribute for dark mode', () => {
      applyTheme('dark')
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('should detect system preference for auto mode', () => {
      ;(window.matchMedia as Mock).mockImplementation(() => ({
        matches: true,
        media: '(prefers-color-scheme: dark)',
      }))
      applyTheme('auto')
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
      ;(window.matchMedia as Mock).mockImplementation(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
      }))
      applyTheme('auto')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })
  })

  describe('applyColorScheme', () => {
    it('should set CSS variables for color scheme', () => {
      const scheme = colorSchemes[0] // default scheme
      applyColorScheme(scheme)

      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe(
        scheme.colors.primary
      )
      expect(document.documentElement.style.getPropertyValue('--color-secondary')).toBe(
        scheme.colors.secondary
      )
      expect(document.documentElement.style.getPropertyValue('--color-background')).toBe(
        scheme.colors.background
      )
      expect(document.documentElement.style.getPropertyValue('--color-surface')).toBe(
        scheme.colors.surface
      )
      expect(document.documentElement.style.getPropertyValue('--color-text')).toBe(
        scheme.colors.text
      )
      expect(document.documentElement.style.getPropertyValue('--color-text-secondary')).toBe(
        scheme.colors.textSecondary
      )
      expect(document.documentElement.style.getPropertyValue('--color-border')).toBe(
        scheme.colors.border
      )
      expect(document.documentElement.style.getPropertyValue('--color-node-background')).toBe(
        scheme.colors.nodeBackground
      )
      expect(document.documentElement.style.getPropertyValue('--color-node-border')).toBe(
        scheme.colors.nodeBorder
      )
      expect(document.documentElement.style.getPropertyValue('--color-edge')).toBe(
        scheme.colors.edge
      )
    })
  })

  describe('initializeTheme', () => {
    it('should apply saved theme and color scheme', () => {
      localStorage.setItem('theme_mode', 'dark')
      localStorage.setItem('color_scheme', 'ocean')

      initializeTheme()

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
      const oceanScheme = colorSchemes.find(s => s.id === 'ocean')!
      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe(
        oceanScheme.colors.primary
      )
    })

    it('should use defaults when nothing saved', () => {
      initializeTheme()
      expect(document.documentElement.getAttribute('data-theme')).toBe('light') // auto defaults to light
      const defaultScheme = colorSchemes[0]
      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe(
        defaultScheme.colors.primary
      )
    })
  })

  describe('watchSystemTheme', () => {
    it('should set up event listener for system theme changes', () => {
      localStorage.setItem('theme_mode', 'auto')
      const callback = vi.fn()

      const mockAddEventListener = vi.fn()
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
      })) as unknown as typeof window.matchMedia

      const removeListener = watchSystemTheme(callback)

      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))

      removeListener()
    })
  })

  describe('createCustomColorScheme', () => {
    it('should create custom scheme with provided colors', () => {
      const customColors = {
        primary: '#ff0000',
        background: '#000000',
        text: '#ffffff',
      }

      const scheme = createCustomColorScheme('My Scheme', customColors)

      expect(scheme.id).toMatch(/^custom_\d+_/)
      expect(scheme.name).toBe('My Scheme')
      expect(scheme.description).toBe('Custom color scheme')
      expect(scheme.colors.primary).toBe('#ff0000')
      expect(scheme.colors.background).toBe('#000000')
      expect(scheme.colors.text).toBe('#ffffff')
      expect(scheme.colors.secondary).toBe(colorSchemes[0].colors.secondary) // default value
    })

    it('should use default colors for missing properties', () => {
      const scheme = createCustomColorScheme('Partial', { primary: '#123456' })

      expect(scheme.colors.primary).toBe('#123456')
      expect(scheme.colors.secondary).toBe(colorSchemes[0].colors.secondary)
      expect(scheme.colors.background).toBe(colorSchemes[0].colors.background)
    })
  })

  describe('saveCustomColorScheme and getCustomColorSchemes', () => {
    it('should save and retrieve custom schemes', () => {
      const scheme1 = createCustomColorScheme('Scheme 1', { primary: '#ff0000' })
      const scheme2 = createCustomColorScheme('Scheme 2', { primary: '#00ff00' })

      saveCustomColorScheme(scheme1)
      saveCustomColorScheme(scheme2)

      const customSchemes = getCustomColorSchemes()
      expect(customSchemes).toHaveLength(2)
      expect(customSchemes[0].name).toBe('Scheme 1')
      expect(customSchemes[1].name).toBe('Scheme 2')
    })

    it('should handle empty custom schemes', () => {
      const schemes = getCustomColorSchemes()
      expect(schemes).toEqual([])
    })

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('custom_color_schemes', 'invalid json')
      const schemes = getCustomColorSchemes()
      expect(schemes).toEqual([])
    })
  })

  describe('deleteCustomColorScheme', () => {
    it('should delete custom scheme by id', () => {
      const scheme1 = createCustomColorScheme('Scheme 1', { primary: '#ff0000' })
      const scheme2 = createCustomColorScheme('Scheme 2', { primary: '#00ff00' })

      saveCustomColorScheme(scheme1)
      saveCustomColorScheme(scheme2)

      deleteCustomColorScheme(scheme1.id)

      const schemes = getCustomColorSchemes()
      expect(schemes).toHaveLength(1)
      expect(schemes[0].id).toBe(scheme2.id)
    })

    it('should handle deleting non-existent scheme', () => {
      const scheme = createCustomColorScheme('Test', { primary: '#ff0000' })
      saveCustomColorScheme(scheme)

      deleteCustomColorScheme('non-existent')

      const schemes = getCustomColorSchemes()
      expect(schemes).toHaveLength(1)
    })
  })

  describe('exportThemeSettings', () => {
    it('should export current theme settings', () => {
      localStorage.setItem('theme_mode', 'dark')
      localStorage.setItem('color_scheme', 'ocean')

      const customScheme = createCustomColorScheme('Custom', { primary: '#ff0000' })
      saveCustomColorScheme(customScheme)

      const exportJson = exportThemeSettings()
      const parsed = JSON.parse(exportJson)

      expect(parsed.mode).toBe('dark')
      expect(parsed.colorScheme).toBe('ocean')
      expect(parsed.customSchemes).toHaveLength(1)
      expect(parsed.customSchemes[0].name).toBe('Custom')
    })

    it('should export defaults when nothing set', () => {
      const exportJson = exportThemeSettings()
      const parsed = JSON.parse(exportJson)

      expect(parsed.mode).toBe('auto')
      expect(parsed.colorScheme).toBe('default')
      expect(parsed.customSchemes).toEqual([])
    })
  })

  describe('importThemeSettings', () => {
    it('should import valid theme settings', () => {
      const settings = {
        mode: 'dark',
        colorScheme: 'forest',
        customSchemes: [createCustomColorScheme('Imported', { primary: '#123456' })],
      }

      const result = importThemeSettings(JSON.stringify(settings))

      expect(result).toBe(true)
      expect(localStorage.getItem('theme_mode')).toBe('dark')
      expect(localStorage.getItem('color_scheme')).toBe('forest')

      const customSchemes = getCustomColorSchemes()
      expect(customSchemes).toHaveLength(1)
      expect(customSchemes[0].name).toBe('Imported')
    })

    it('should handle partial settings', () => {
      // First set a color scheme
      localStorage.setItem('color_scheme', 'ocean')

      const settings = {
        mode: 'light',
        // No colorScheme or customSchemes
      }

      const result = importThemeSettings(JSON.stringify(settings))

      expect(result).toBe(true)
      expect(localStorage.getItem('theme_mode')).toBe('light')
      // color_scheme should remain unchanged
      expect(localStorage.getItem('color_scheme')).toBe('ocean')
    })

    it('should return false for invalid JSON', () => {
      const result = importThemeSettings('invalid json')
      expect(result).toBe(false)
    })

    it('should handle invalid color scheme', () => {
      const settings = {
        colorScheme: 'invalid-scheme',
      }

      const result = importThemeSettings(JSON.stringify(settings))
      expect(result).toBe(true)
      // Should not crash, just not set invalid scheme
    })
  })

  describe('colorSchemes array', () => {
    it('should contain predefined color schemes', () => {
      expect(colorSchemes.length).toBeGreaterThan(0)

      // Check a few known schemes
      const defaultScheme = colorSchemes.find(s => s.id === 'default')
      expect(defaultScheme).toBeDefined()
      expect(defaultScheme?.name).toBe('Classic Blue')

      const darkScheme = colorSchemes.find(s => s.id === 'dark')
      expect(darkScheme).toBeDefined()
      expect(darkScheme?.name).toBe('Dark Mode')
    })

    it('should have valid color scheme structure', () => {
      colorSchemes.forEach(scheme => {
        expect(scheme.id).toBeDefined()
        expect(scheme.name).toBeDefined()
        expect(scheme.description).toBeDefined()
        expect(scheme.preview).toBeDefined()
        expect(Array.isArray(scheme.preview)).toBe(true)
        expect(scheme.preview.length).toBe(2)

        expect(scheme.colors).toBeDefined()
        expect(scheme.colors.primary).toMatch(/^#[0-9a-f]{6}$/i)
        expect(scheme.colors.secondary).toMatch(/^#[0-9a-f]{6}$/i)
        expect(scheme.colors.background).toMatch(/^#[0-9a-f]{6}$/i)
        expect(scheme.colors.surface).toMatch(/^#[0-9a-f]{6}$/i)
        expect(scheme.colors.text).toMatch(/^#[0-9a-f]{6}$/i)
        expect(scheme.colors.textSecondary).toMatch(/^#[0-9a-f]{6}$/i)
        expect(scheme.colors.border).toMatch(/^#[0-9a-f]{6}$/i)
        expect(scheme.colors.nodeBackground).toMatch(/^#[0-9a-f]{6}$/i)
        expect(scheme.colors.nodeBorder).toMatch(/^#[0-9a-f]{6}$/i)
        expect(scheme.colors.edge).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })
  })
})
