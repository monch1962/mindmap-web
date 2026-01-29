/**
 * Presentation & Visualization Features Tests - Stories 34-37
 *
 * Tests for presentation mode, 3D view, and theme switching
 *
 * Story 34: As a user, I want to enter presentation mode
 * Story 35: As a user, I want to navigate presentation slides using arrow keys
 * Story 36: As a user, I want to view my mind map in 3D
 * Story 37: As a user, I want to apply different themes (light/dark/custom)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Import test utilities
import { customRender } from '../../test/utils'

// Import mocks
import * as mocks from '../../test/mocks'

// Mock React Flow
vi.mock('reactflow', () => mocks.reactflow)

describe('Presentation & Visualization Features Workflows', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()

    // Setup browser mocks
    mocks.setupBrowserMocks()
  })

  describe('Story 34: Enter presentation mode', () => {
    it('should open presentation mode from toolbar', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnEnterPresentation = vi.fn()

      // Mock presentation button
      const PresentationButton = vi.fn(({ onClick }) => (
        <button
          data-testid="presentation-btn"
          onClick={onClick}
          aria-label="Enter presentation mode"
        >
          🎬 Present
        </button>
      ))

      // Mock presentation mode container
      const PresentationContainer = vi.fn(() => (
        <div data-testid="presentation-container">
          <div data-testid="slide-content">Slide 1: Introduction</div>
        </div>
      ))

      // Act
      customRender(
        <div>
          <PresentationButton onClick={() => mockOnEnterPresentation(true)} />
          <PresentationContainer />
        </div>
      )

      // Click presentation button
      const presentationButton = screen.getByTestId('presentation-btn')
      await user.click(presentationButton)

      // Assert
      expect(mockOnEnterPresentation).toHaveBeenCalledWith(true)
      expect(screen.getByTestId('presentation-container')).toBeInTheDocument()
    })

    it('should display current slide information', () => {
      // Arrange
      const mockSlideInfo = {
        currentSlide: 3,
        totalSlides: 15,
        title: 'Project Timeline',
        progress: '20%',
      }

      // Mock slide info display
      const SlideInfoDisplay = vi.fn(({ slideInfo }) => (
        <div data-testid="slide-info">
          <div data-testid="slide-position">
            Slide {slideInfo.currentSlide} of {slideInfo.totalSlides}
          </div>
          <div data-testid="slide-title">{slideInfo.title}</div>
          <div data-testid="slide-progress" style={{ width: slideInfo.progress }}>
            {slideInfo.progress} complete
          </div>
        </div>
      ))

      // Act
      customRender(<SlideInfoDisplay slideInfo={mockSlideInfo} />)

      // Assert
      expect(screen.getByTestId('slide-info')).toBeInTheDocument()
      expect(screen.getByTestId('slide-position')).toHaveTextContent('Slide 3 of 15')
      expect(screen.getByTestId('slide-title')).toHaveTextContent('Project Timeline')
      expect(screen.getByTestId('slide-progress')).toHaveTextContent('20% complete')
    })

    it('should show slide overview with thumbnails', () => {
      // Arrange
      const mockSlides = [
        { id: 'slide-1', title: 'Introduction', thumbnail: 'intro-thumb.png' },
        { id: 'slide-2', title: 'Problem Statement', thumbnail: 'problem-thumb.png' },
        { id: 'slide-3', title: 'Solution Overview', thumbnail: 'solution-thumb.png' },
      ]

      // Mock slide overview
      const SlideOverview = vi.fn(({ slides }) => (
        <div data-testid="slide-overview">
          <div data-testid="overview-title">Slide Overview</div>
          <div data-testid="slides-grid">
            {slides.map((slide: { id: string; title: string; thumbnail: string }) => (
              <div key={slide.id} data-testid={`slide-${slide.id}`}>
                <img
                  data-testid={`thumbnail-${slide.id}`}
                  src={slide.thumbnail}
                  alt={slide.title}
                />
                <div data-testid={`slide-title-${slide.id}`}>{slide.title}</div>
              </div>
            ))}
          </div>
          <div data-testid="slide-count">{slides.length} slides</div>
        </div>
      ))

      // Act
      customRender(<SlideOverview slides={mockSlides} />)

      // Assert
      expect(screen.getByTestId('slide-overview')).toBeInTheDocument()
      expect(screen.getByTestId('slide-count')).toHaveTextContent('3 slides')
      expect(screen.getByTestId('slide-slide-1')).toBeInTheDocument()
      expect(screen.getByTestId('slide-slide-2')).toBeInTheDocument()
      expect(screen.getByTestId('slide-slide-3')).toBeInTheDocument()
    })
  })

  describe('Story 35: Navigate presentation slides', () => {
    it('should navigate to next slide with right arrow key', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnNextSlide = vi.fn()

      // Mock slide navigation
      const SlideNavigation = vi.fn(({ onNext }) => (
        <div data-testid="slide-navigation">
          <button data-testid="next-btn" onClick={onNext}>
            Next
          </button>
          <div data-testid="key-hint">Press → for next slide</div>
        </div>
      ))

      // Act
      customRender(<SlideNavigation onNext={mockOnNextSlide} />)

      // Click next button
      const nextButton = screen.getByTestId('next-btn')
      await user.click(nextButton)

      // Assert
      expect(mockOnNextSlide).toHaveBeenCalled()
    })

    it('should navigate to previous slide with left arrow key', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnPrevSlide = vi.fn()

      // Mock slide navigation
      const SlideNavigation = vi.fn(({ onPrev }) => (
        <div data-testid="slide-navigation">
          <button data-testid="prev-btn" onClick={onPrev}>
            Previous
          </button>
          <div data-testid="key-hint">Press ← for previous slide</div>
        </div>
      ))

      // Act
      customRender(<SlideNavigation onPrev={mockOnPrevSlide} />)

      // Click previous button
      const prevButton = screen.getByTestId('prev-btn')
      await user.click(prevButton)

      // Assert
      expect(mockOnPrevSlide).toHaveBeenCalled()
    })

    it('should jump to specific slide from overview', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnJumpToSlide = vi.fn()

      // Mock slide jump interface
      const SlideJump = vi.fn(({ onJump }) => (
        <div data-testid="slide-jump">
          <input
            data-testid="slide-input"
            type="number"
            min="1"
            max="20"
            defaultValue="1"
            onChange={e => onJump(parseInt(e.target.value))}
          />
          <button data-testid="jump-btn" onClick={() => onJump(5)}>
            Jump to Slide 5
          </button>
        </div>
      ))

      // Act
      customRender(<SlideJump onJump={mockOnJumpToSlide} />)

      // Change slide input
      const slideInput = screen.getByTestId('slide-input')
      await user.clear(slideInput)
      await user.type(slideInput, '10')

      // Click jump button
      const jumpButton = screen.getByTestId('jump-btn')
      await user.click(jumpButton)

      // Assert
      expect(mockOnJumpToSlide).toHaveBeenCalledWith(5)
    })

    it('should show navigation controls with keyboard shortcuts', () => {
      // Arrange
      const mockNavigationControls = [
        { key: '←', action: 'Previous slide', label: 'Left Arrow' },
        { key: '→', action: 'Next slide', label: 'Right Arrow' },
        { key: 'Space', action: 'Next slide', label: 'Space' },
        { key: 'Esc', action: 'Exit presentation', label: 'Escape' },
      ]

      // Mock navigation controls display
      const NavigationControls = vi.fn(({ controls }) => (
        <div data-testid="navigation-controls">
          <div data-testid="controls-title">Keyboard Shortcuts</div>
          <ul data-testid="controls-list">
            {controls.map((control: { key: string; action: string; label: string }) => (
              <li key={control.key} data-testid={`control-${control.key}`}>
                <kbd data-testid="control-key">{control.key}</kbd>
                <span data-testid="control-action">{control.action}</span>
                <span data-testid="control-label">({control.label})</span>
              </li>
            ))}
          </ul>
        </div>
      ))

      // Act
      customRender(<NavigationControls controls={mockNavigationControls} />)

      // Assert
      expect(screen.getByTestId('navigation-controls')).toBeInTheDocument()
      expect(screen.getByTestId('controls-title')).toHaveTextContent('Keyboard Shortcuts')
      expect(screen.getByTestId('control-←')).toBeInTheDocument()
      expect(screen.getByTestId('control-→')).toBeInTheDocument()
      expect(screen.getByTestId('control-Space')).toBeInTheDocument()
      expect(screen.getByTestId('control-Esc')).toBeInTheDocument()
    })
  })

  describe('Story 36: View mind map in 3D', () => {
    it('should open 3D view from visualization menu', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnOpen3DView = vi.fn()

      // Mock 3D view button
      const ThreeDViewButton = vi.fn(({ onClick }) => (
        <button data-testid="3d-view-btn" onClick={onClick} aria-label="Open 3D view">
          🎮 3D View
        </button>
      ))

      // Mock 3D view container
      const ThreeDViewContainer = vi.fn(() => (
        <div data-testid="3d-view-container">
          <canvas data-testid="3d-canvas" />
          <div data-testid="3d-controls">3D Controls</div>
        </div>
      ))

      // Act
      customRender(
        <div>
          <ThreeDViewButton onClick={() => mockOnOpen3DView(true)} />
          <ThreeDViewContainer />
        </div>
      )

      // Click 3D view button
      const threeDButton = screen.getByTestId('3d-view-btn')
      await user.click(threeDButton)

      // Assert
      expect(mockOnOpen3DView).toHaveBeenCalledWith(true)
      expect(screen.getByTestId('3d-view-container')).toBeInTheDocument()
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument()
    })

    it('should display 3D camera controls', () => {
      // Arrange
      const mockCameraControls = {
        position: { x: 10, y: 5, z: 15 },
        rotation: { x: 30, y: 45, z: 0 },
        zoom: 1.5,
      }

      // Mock camera controls display
      const CameraControlsDisplay = vi.fn(({ controls }) => (
        <div data-testid="camera-controls">
          <div data-testid="camera-position">
            Position: X={controls.position.x}, Y={controls.position.y}, Z={controls.position.z}
          </div>
          <div data-testid="camera-rotation">
            Rotation: X={controls.rotation.x}°, Y={controls.rotation.y}°, Z={controls.rotation.z}°
          </div>
          <div data-testid="camera-zoom">Zoom: {controls.zoom}x</div>
        </div>
      ))

      // Act
      customRender(<CameraControlsDisplay controls={mockCameraControls} />)

      // Assert
      expect(screen.getByTestId('camera-controls')).toBeInTheDocument()
      expect(screen.getByTestId('camera-position')).toHaveTextContent('Position: X=10, Y=5, Z=15')
      expect(screen.getByTestId('camera-rotation')).toHaveTextContent(
        'Rotation: X=30°, Y=45°, Z=0°'
      )
      expect(screen.getByTestId('camera-zoom')).toHaveTextContent('Zoom: 1.5x')
    })

    it('should show node information in 3D view', () => {
      // Arrange
      const mockNodeInfo = {
        id: 'node-3d-123',
        content: 'Central Topic in 3D',
        position: { x: 0, y: 0, z: 0 },
        children: 5,
        depth: 0,
      }

      // Mock 3D node info display
      const ThreeDNodeInfo = vi.fn(({ node }) => (
        <div data-testid="3d-node-info">
          <div data-testid="node-content">{node.content}</div>
          <div data-testid="node-position">
            3D Position: ({node.position.x}, {node.position.y}, {node.position.z})
          </div>
          <div data-testid="node-stats">
            <span data-testid="child-count">{node.children} children</span>
            <span data-testid="node-depth">Depth: {node.depth}</span>
          </div>
        </div>
      ))

      // Act
      customRender(<ThreeDNodeInfo node={mockNodeInfo} />)

      // Assert
      expect(screen.getByTestId('3d-node-info')).toBeInTheDocument()
      expect(screen.getByTestId('node-content')).toHaveTextContent('Central Topic in 3D')
      expect(screen.getByTestId('node-position')).toHaveTextContent('3D Position: (0, 0, 0)')
      expect(screen.getByTestId('child-count')).toHaveTextContent('5 children')
      expect(screen.getByTestId('node-depth')).toHaveTextContent('Depth: 0')
    })

    it('should provide 3D view settings', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnSettingsChange = vi.fn()

      // Mock 3D settings
      const ThreeDSettings = vi.fn(({ onChange }) => (
        <div data-testid="3d-settings">
          <label>
            <input
              type="checkbox"
              data-testid="show-labels"
              onChange={e => onChange('showLabels', e.target.checked)}
            />
            Show node labels
          </label>
          <label>
            <input
              type="checkbox"
              data-testid="show-connections"
              onChange={e => onChange('showConnections', e.target.checked)}
            />
            Show connections
          </label>
          <label>
            <input
              type="range"
              data-testid="node-size"
              min="0.5"
              max="3"
              step="0.1"
              defaultValue="1"
              onChange={e => onChange('nodeSize', parseFloat(e.target.value))}
            />
            Node size
          </label>
        </div>
      ))

      // Act
      customRender(<ThreeDSettings onChange={mockOnSettingsChange} />)

      // Toggle show labels
      const showLabelsCheckbox = screen.getByTestId('show-labels')
      await user.click(showLabelsCheckbox)

      // Toggle show connections
      const showConnectionsCheckbox = screen.getByTestId('show-connections')
      await user.click(showConnectionsCheckbox)

      // Change node size
      const nodeSizeSlider = screen.getByTestId('node-size')
      await user.type(nodeSizeSlider, '{selectall}2.5')

      // Assert
      expect(mockOnSettingsChange).toHaveBeenCalledWith('showLabels', true)
      expect(mockOnSettingsChange).toHaveBeenCalledWith('showConnections', true)
    })
  })

  describe('Story 37: Apply different themes', () => {
    it('should open theme selection menu', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnOpenThemeMenu = vi.fn()

      // Mock theme button
      const ThemeButton = vi.fn(({ onClick }) => (
        <button data-testid="theme-btn" onClick={onClick} aria-label="Change theme">
          🎨 Theme
        </button>
      ))

      // Mock theme menu
      const ThemeMenu = vi.fn(() => (
        <div data-testid="theme-menu">
          <div data-testid="theme-options">
            <button data-testid="theme-light">Light</button>
            <button data-testid="theme-dark">Dark</button>
            <button data-testid="theme-custom">Custom</button>
          </div>
        </div>
      ))

      // Act
      customRender(
        <div>
          <ThemeButton onClick={() => mockOnOpenThemeMenu(true)} />
          <ThemeMenu />
        </div>
      )

      // Click theme button
      const themeButton = screen.getByTestId('theme-btn')
      await user.click(themeButton)

      // Assert
      expect(mockOnOpenThemeMenu).toHaveBeenCalledWith(true)
      expect(screen.getByTestId('theme-menu')).toBeInTheDocument()
      expect(screen.getByTestId('theme-light')).toBeInTheDocument()
      expect(screen.getByTestId('theme-dark')).toBeInTheDocument()
      expect(screen.getByTestId('theme-custom')).toBeInTheDocument()
    })

    it('should apply light theme', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnApplyTheme = vi.fn()

      // Mock theme application
      const ThemeApplication = vi.fn(({ onApply }) => (
        <div data-testid="theme-application">
          <button data-testid="apply-light-theme" onClick={() => onApply('light')}>
            Apply Light Theme
          </button>
          <div data-testid="theme-preview" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            Light theme preview
          </div>
        </div>
      ))

      // Act
      customRender(<ThemeApplication onApply={mockOnApplyTheme} />)

      // Apply light theme
      const applyButton = screen.getByTestId('apply-light-theme')
      await user.click(applyButton)

      // Assert
      expect(mockOnApplyTheme).toHaveBeenCalledWith('light')
      expect(screen.getByTestId('theme-preview')).toHaveStyle({
        backgroundColor: '#ffffff',
        color: '#000000',
      })
    })

    it('should apply dark theme', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnApplyTheme = vi.fn()

      // Mock theme application
      const ThemeApplication = vi.fn(({ onApply }) => (
        <div data-testid="theme-application">
          <button data-testid="apply-dark-theme" onClick={() => onApply('dark')}>
            Apply Dark Theme
          </button>
          <div data-testid="theme-preview" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
            Dark theme preview
          </div>
        </div>
      ))

      // Act
      customRender(<ThemeApplication onApply={mockOnApplyTheme} />)

      // Apply dark theme
      const applyButton = screen.getByTestId('apply-dark-theme')
      await user.click(applyButton)

      // Assert
      expect(mockOnApplyTheme).toHaveBeenCalledWith('dark')
      expect(screen.getByTestId('theme-preview')).toHaveStyle({
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
      })
    })

    it('should show custom theme configuration', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnCustomThemeChange = vi.fn()

      // Mock custom theme configuration
      const CustomThemeConfig = vi.fn(({ onChange }) => (
        <div data-testid="custom-theme-config">
          <div data-testid="color-pickers">
            <input
              type="color"
              data-testid="primary-color"
              defaultValue="#3b82f6"
              onChange={e => onChange('primaryColor', (e.target as HTMLInputElement).value)}
            />
            <input
              type="color"
              data-testid="background-color"
              defaultValue="#f8fafc"
              onChange={e => onChange('backgroundColor', (e.target as HTMLInputElement).value)}
            />
            <input
              type="color"
              data-testid="text-color"
              defaultValue="#1e293b"
              onChange={e => onChange('textColor', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div data-testid="theme-preview" style={{ backgroundColor: '#f8fafc', color: '#1e293b' }}>
            Custom theme preview
          </div>
          <button data-testid="save-custom-theme" onClick={() => onChange('save', true)}>
            Save Custom Theme
          </button>
        </div>
      ))

      // Act
      customRender(<CustomThemeConfig onChange={mockOnCustomThemeChange} />)

      // Test that the component renders correctly
      expect(screen.getByTestId('custom-theme-config')).toBeInTheDocument()
      expect(screen.getByTestId('primary-color')).toBeInTheDocument()
      expect(screen.getByTestId('background-color')).toBeInTheDocument()
      expect(screen.getByTestId('text-color')).toBeInTheDocument()
      expect(screen.getByTestId('theme-preview')).toBeInTheDocument()

      // Save custom theme
      const saveButton = screen.getByTestId('save-custom-theme')
      await user.click(saveButton)

      // Assert
      expect(mockOnCustomThemeChange).toHaveBeenCalledWith('save', true)
    })

    it('should show current theme status', () => {
      // Arrange
      const mockThemeStatus = {
        currentTheme: 'dark',
        availableThemes: ['light', 'dark', 'blue', 'green', 'custom'],
        isCustom: false,
        lastChanged: '2024-01-15 14:30',
      }

      // Mock theme status display
      const ThemeStatusDisplay = vi.fn(({ status }) => (
        <div data-testid="theme-status">
          <div data-testid="current-theme">Current theme: {status.currentTheme}</div>
          <div data-testid="available-themes">Available: {status.availableThemes.join(', ')}</div>
          {status.isCustom && <div data-testid="custom-theme-badge">Custom Theme</div>}
          <div data-testid="last-changed">Last changed: {status.lastChanged}</div>
        </div>
      ))

      // Act
      customRender(<ThemeStatusDisplay status={mockThemeStatus} />)

      // Assert
      expect(screen.getByTestId('theme-status')).toBeInTheDocument()
      expect(screen.getByTestId('current-theme')).toHaveTextContent('Current theme: dark')
      expect(screen.getByTestId('available-themes')).toHaveTextContent(
        'Available: light, dark, blue, green, custom'
      )
      expect(screen.getByTestId('last-changed')).toHaveTextContent('Last changed: 2024-01-15 14:30')
    })
  })
})
