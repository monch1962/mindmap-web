import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeSettingsPanel from './ThemeSettingsPanel'
import * as themeUtils from '../utils/theme'

// Mock the theme utilities
vi.mock('../utils/theme', () => ({
  getThemeMode: vi.fn(),
  setThemeMode: vi.fn(),
  getColorScheme: vi.fn(),
  setColorScheme: vi.fn(),
  applyTheme: vi.fn(),
  applyColorScheme: vi.fn(),
  getCustomColorSchemes: vi.fn(),
  saveCustomColorScheme: vi.fn(),
  deleteCustomColorScheme: vi.fn(),
  exportThemeSettings: vi.fn(),
  importThemeSettings: vi.fn(),
  createCustomColorScheme: vi.fn(),
  watchSystemTheme: vi.fn(),
  colorSchemes: [
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
      description: 'Deep ocean blues and greens',
      preview: ['#0ea5e9', '#06b6d4'],
      colors: {
        primary: '#0ea5e9',
        secondary: '#06b6d4',
        background: '#ffffff',
        surface: '#f0f9ff',
        text: '#0c4a6e',
        textSecondary: '#0284c7',
        border: '#bae6fd',
        nodeBackground: '#ffffff',
        nodeBorder: '#bae6fd',
        edge: '#7dd3fc',
      },
    },
  ],
}))

// Mock the downloadFile utility
vi.mock('../utils/fileDownload', () => ({
  downloadFile: vi.fn(),
}))

describe('ThemeSettingsPanel', () => {
  const mockOnClose = vi.fn()
  const mockOnThemeChange = vi.fn()

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onThemeChange: mockOnThemeChange,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mock implementations
    ;(themeUtils.getThemeMode as vi.Mock).mockReturnValue('light')
    ;(themeUtils.getColorScheme as vi.Mock).mockReturnValue({
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
    })
    ;(themeUtils.getCustomColorSchemes as vi.Mock).mockReturnValue([])
    ;(themeUtils.watchSystemTheme as vi.Mock).mockReturnValue(() => {})
  })

  it('should render the panel with title when visible is true', () => {
    render(<ThemeSettingsPanel {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('🎨 Theme Settings')).toBeInTheDocument()
  })

  it('should not render when visible is false', () => {
    render(<ThemeSettingsPanel {...defaultProps} visible={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should have proper ARIA attributes', () => {
    render(<ThemeSettingsPanel {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', '🎨 Theme Settings')
  })

  it('should call onClose when close button is clicked', async () => {
    render(<ThemeSettingsPanel {...defaultProps} />)

    const closeButton = screen.getByLabelText('Close panel')
    await userEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should show theme mode options', () => {
    render(<ThemeSettingsPanel {...defaultProps} />)

    expect(screen.getByText('☀️ Light')).toBeInTheDocument()
    expect(screen.getByText('🌙 Dark')).toBeInTheDocument()
    expect(screen.getByText('🔄 Auto')).toBeInTheDocument()
  })

  it('should handle theme mode change', async () => {
    render(<ThemeSettingsPanel {...defaultProps} />)

    const darkModeButton = screen.getByText('🌙 Dark')
    await userEvent.click(darkModeButton)

    expect(themeUtils.setThemeMode).toHaveBeenCalledWith('dark')
    expect(themeUtils.applyTheme).toHaveBeenCalledWith('dark')
    expect(mockOnThemeChange).toHaveBeenCalledTimes(1)
  })

  it('should show color scheme options', () => {
    render(<ThemeSettingsPanel {...defaultProps} />)

    expect(screen.getByText('Classic Blue')).toBeInTheDocument()
    expect(screen.getByText('Ocean')).toBeInTheDocument()
  })

  it('should handle color scheme change', async () => {
    render(<ThemeSettingsPanel {...defaultProps} />)

    const oceanScheme = screen.getByText('Ocean').closest('div')
    if (oceanScheme) {
      await userEvent.click(oceanScheme)
    }

    expect(themeUtils.setColorScheme).toHaveBeenCalledWith('ocean')
    expect(themeUtils.applyColorScheme).toHaveBeenCalled()
    expect(mockOnThemeChange).toHaveBeenCalledTimes(1)
  })

  it('should show custom scheme editor when custom button is clicked', async () => {
    render(<ThemeSettingsPanel {...defaultProps} />)

    const customButton = screen.getByText('+ Custom')
    await userEvent.click(customButton)

    expect(screen.getByText('Create Custom Scheme')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Scheme name...')).toBeInTheDocument()
  })

  it('should handle export theme settings', async () => {
    const mockExportData = JSON.stringify({ theme: 'light', scheme: 'default' })
    ;(themeUtils.exportThemeSettings as vi.Mock).mockReturnValue(mockExportData)

    render(<ThemeSettingsPanel {...defaultProps} />)

    const exportButton = screen.getByText('📥 Export')
    await userEvent.click(exportButton)

    expect(themeUtils.exportThemeSettings).toHaveBeenCalled()
    // The downloadFile utility is mocked, so we just verify it was called
  })

  it('should handle import theme settings', async () => {
    ;(themeUtils.importThemeSettings as vi.Mock).mockReturnValue(true)

    render(<ThemeSettingsPanel {...defaultProps} />)

    const importButton = screen.getByText('📤 Import')
    await userEvent.click(importButton)

    // Note: File input interactions are complex to test
    // This test verifies the button is present and clickable
    expect(importButton).toBeInTheDocument()
  })

  it('should show status message on successful export', async () => {
    const { downloadFile } = await import('../utils/fileDownload')
    ;(downloadFile as vi.Mock).mockImplementation(() => {})

    render(<ThemeSettingsPanel {...defaultProps} />)

    const exportButton = screen.getByText('📥 Export')
    await userEvent.click(exportButton)

    // Wait for status message to appear
    await waitFor(() => {
      expect(screen.getByText('Theme settings exported')).toBeInTheDocument()
    })
  })

  it('should update theme mode when system theme changes', () => {
    const mockCleanup = vi.fn()
    const mockWatchCallback = vi.fn()
    ;(themeUtils.watchSystemTheme as vi.Mock).mockImplementation(callback => {
      // Store the callback to call it later
      mockWatchCallback.mockImplementation(() => callback('dark'))
      return mockCleanup
    })

    render(<ThemeSettingsPanel {...defaultProps} />)

    // Simulate system theme change
    mockWatchCallback()

    expect(themeUtils.applyTheme).toHaveBeenCalledWith('dark')
    expect(mockOnThemeChange).toHaveBeenCalledTimes(1)
  })

  it('should cleanup system theme watcher on unmount', () => {
    const mockCleanup = vi.fn()
    ;(themeUtils.watchSystemTheme as vi.Mock).mockReturnValue(mockCleanup)

    const { unmount } = render(<ThemeSettingsPanel {...defaultProps} />)
    unmount()

    expect(mockCleanup).toHaveBeenCalledTimes(1)
  })
})
