import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
} from './theme';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('theme utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document attributes
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('--color-primary');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('getThemeMode and setThemeMode', () => {
    it('should return "auto" by default', () => {
      expect(getThemeMode()).toBe('auto');
    });

    it('should set and get theme mode', () => {
      setThemeMode('dark');
      expect(getThemeMode()).toBe('dark');

      setThemeMode('light');
      expect(getThemeMode()).toBe('light');
    });

    it('should persist theme mode to localStorage', () => {
      setThemeMode('dark');
      expect(localStorage.getItem('theme_mode')).toBe('dark');
    });

    it('should apply theme to document', () => {
      setThemeMode('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      setThemeMode('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('toggleDarkMode', () => {
    it('should toggle from auto to dark', () => {
      setThemeMode('auto');
      toggleDarkMode();
      expect(getThemeMode()).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      setThemeMode('dark');
      toggleDarkMode();
      expect(getThemeMode()).toBe('light');
    });

    it('should toggle from light to dark', () => {
      setThemeMode('light');
      toggleDarkMode();
      expect(getThemeMode()).toBe('dark');
    });
  });

  describe('getEffectiveTheme', () => {
    it('should return explicit mode when set to light', () => {
      setThemeMode('light');
      expect(getEffectiveTheme()).toBe('light');
    });

    it('should return explicit mode when set to dark', () => {
      setThemeMode('dark');
      expect(getEffectiveTheme()).toBe('dark');
    });

    it('should return system preference when set to auto', () => {
      setThemeMode('auto');
      const theme = getEffectiveTheme();
      expect(['light', 'dark']).toContain(theme);
    });
  });

  describe('color schemes', () => {
    it('should get default color scheme', () => {
      const scheme = getColorScheme();
      expect(scheme).toBeDefined();
      expect(scheme.id).toBe('default');
    });

    it('should set and get color scheme', () => {
      setColorScheme('ocean');
      expect(getColorScheme().id).toBe('ocean');
    });

    it('should persist color scheme to localStorage', () => {
      setColorScheme('forest');
      expect(localStorage.getItem('color_scheme')).toBe('forest');
    });

    it('should apply color scheme CSS variables', () => {
      const scheme = getColorScheme();
      applyColorScheme(scheme);

      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe(scheme.colors.primary);
      expect(document.documentElement.style.getPropertyValue('--color-secondary')).toBe(scheme.colors.secondary);
    });
  });

  describe('applyTheme', () => {
    it('should set data-theme attribute for light mode', () => {
      applyTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should set data-theme attribute for dark mode', () => {
      applyTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should use system preference for auto mode', () => {
      applyTheme('auto');
      const theme = document.documentElement.getAttribute('data-theme');
      expect(['light', 'dark']).toContain(theme);
    });
  });

  describe('initializeTheme', () => {
    it('should initialize with saved theme mode', () => {
      localStorage.setItem('theme_mode', 'dark');
      initializeTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should initialize with saved color scheme', () => {
      localStorage.setItem('color_scheme', 'ocean');
      initializeTheme();
      const primaryColor = document.documentElement.style.getPropertyValue('--color-primary');
      expect(primaryColor).toBeTruthy();
    });
  });
});
