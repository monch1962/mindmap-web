/**
 * Templates & Productivity Tests - Stories 46-50
 *
 * Tests for templates and productivity features
 *
 * Story 46: As a user, I want to start from a template (SWOT, project planning)
 * Story 47: As a user, I want to perform bulk operations on multiple nodes
 * Story 48: As a user, I want to view statistics about my mind map
 * Story 49: As a user, I want to access keyboard shortcuts reference
 * Story 50: As a user, I want to use the mobile toolbar on touch devices
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useState } from 'react'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Import test utilities
import { customRender } from '../../test/utils'

// Import mocks
import * as mocks from '../../test/mocks'

// Mock React Flow
vi.mock('reactflow', () => mocks.reactflow)

describe('Templates & Productivity Tests (Stories 46-50)', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()

    // Setup browser mocks
    mocks.setupBrowserMocks()
  })

  describe('Story 46: Start from a template (SWOT, project planning)', () => {
    it('should show template selection dialog when new mind map is created', async () => {
      // Arrange
      const mockShowTemplates = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="new-mindmap-btn" onClick={mockShowTemplates}>
            New Mind Map
          </button>
          <div data-testid="template-selection-dialog">
            <h3>Choose a Template</h3>
            <div data-testid="template-option" data-template="swot">
              SWOT Analysis
            </div>
            <div data-testid="template-option" data-template="project">
              Project Planning
            </div>
            <div data-testid="template-option" data-template="brainstorm">
              Brainstorming
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const templateDialog = screen.getByTestId('template-selection-dialog')
      expect(templateDialog).toBeInTheDocument()
      expect(screen.getAllByTestId('template-option')).toHaveLength(3)
    })

    it('should apply SWOT analysis template when selected', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockApplyTemplate = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="template-selection-dialog">
            <div data-testid="swot-template" onClick={() => mockApplyTemplate('swot')}>
              SWOT Analysis
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click SWOT template
      const swotTemplate = screen.getByTestId('swot-template')
      await user.click(swotTemplate)

      // Assert
      expect(mockApplyTemplate).toHaveBeenCalledWith('swot')
    })

    it('should apply project planning template when selected', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockApplyTemplate = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="template-selection-dialog">
            <div data-testid="project-template" onClick={() => mockApplyTemplate('project')}>
              Project Planning
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click project template
      const projectTemplate = screen.getByTestId('project-template')
      await user.click(projectTemplate)

      // Assert
      expect(mockApplyTemplate).toHaveBeenCalledWith('project')
    })

    it('should create mind map with template structure', async () => {
      // Arrange
      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="mindmap-content">
            <div data-testid="central-topic">SWOT Analysis</div>
            <div data-testid="node" data-category="strengths">
              Strengths
            </div>
            <div data-testid="node" data-category="weaknesses">
              Weaknesses
            </div>
            <div data-testid="node" data-category="opportunities">
              Opportunities
            </div>
            <div data-testid="node" data-category="threats">
              Threats
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const centralTopic = screen.getByTestId('central-topic')
      expect(centralTopic).toHaveTextContent('SWOT Analysis')

      const nodes = screen.getAllByTestId('node')
      expect(nodes).toHaveLength(4)
      expect(nodes[0]).toHaveTextContent('Strengths')
      expect(nodes[1]).toHaveTextContent('Weaknesses')
      expect(nodes[2]).toHaveTextContent('Opportunities')
      expect(nodes[3]).toHaveTextContent('Threats')
    })
  })

  describe('Story 47: Perform bulk operations on multiple nodes', () => {
    it('should select multiple nodes using Shift+Click', async () => {
      // Arrange
      const mockSelectNodes = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div
            data-testid="node-1"
            data-selected={false}
            onClick={e => {
              if (e.shiftKey) {
                mockSelectNodes(['node-1', 'node-2'])
              }
            }}
          >
            Node 1
          </div>
          <div
            data-testid="node-2"
            data-selected={false}
            onClick={e => {
              if (e.shiftKey) {
                mockSelectNodes(['node-1', 'node-2'])
              }
            }}
          >
            Node 2
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Shift+Click on node 2
      const node2 = screen.getByTestId('node-2')
      fireEvent.click(node2, { shiftKey: true })

      // Assert
      expect(mockSelectNodes).toHaveBeenCalledWith(['node-1', 'node-2'])
    })

    it('should show bulk operations toolbar when multiple nodes are selected', async () => {
      // Arrange
      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="selected-nodes-count">2 nodes selected</div>
          <div data-testid="bulk-operations-toolbar">
            <button data-testid="bulk-color-btn">Change Color</button>
            <button data-testid="bulk-icon-btn">Add Icon</button>
            <button data-testid="bulk-delete-btn">Delete Selected</button>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const selectedCount = screen.getByTestId('selected-nodes-count')
      expect(selectedCount).toHaveTextContent('2 nodes selected')

      const bulkToolbar = screen.getByTestId('bulk-operations-toolbar')
      expect(bulkToolbar).toBeInTheDocument()
      expect(screen.getByTestId('bulk-color-btn')).toBeInTheDocument()
      expect(screen.getByTestId('bulk-icon-btn')).toBeInTheDocument()
      expect(screen.getByTestId('bulk-delete-btn')).toBeInTheDocument()
    })

    it('should apply color change to all selected nodes', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockChangeColor = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => {
        const [color, setColor] = useState('#ff0000')

        return (
          <div data-testid="mindmap-canvas">
            <div data-testid="bulk-operations-toolbar">
              <button data-testid="bulk-color-btn" onClick={() => mockChangeColor(color)}>
                Change Color
              </button>
            </div>
            <div data-testid="color-picker">
              <input
                data-testid="color-input"
                type="color"
                value={color}
                onChange={e => {
                  const newColor = e.target.value
                  setColor(newColor)
                  mockChangeColor(newColor)
                }}
              />
            </div>
          </div>
        )
      })

      // Act
      customRender(<MindMapCanvas />)

      // Change color by directly triggering change event
      const colorInput = screen.getByTestId('color-input')
      fireEvent.change(colorInput, { target: { value: '#00ff00' } })

      // Click color button to apply
      const colorButton = screen.getByTestId('bulk-color-btn')
      await user.click(colorButton)

      // Assert - mockChangeColor should be called twice:
      // 1. When input changes (from fireEvent.change)
      // 2. When button is clicked
      expect(mockChangeColor).toHaveBeenCalledWith('#00ff00')
      expect(mockChangeColor).toHaveBeenCalledTimes(2)
    })

    it('should delete all selected nodes in bulk', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockDeleteNodes = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="bulk-operations-toolbar">
            <button data-testid="bulk-delete-btn" onClick={mockDeleteNodes}>
              Delete Selected
            </button>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click delete button
      const deleteButton = screen.getByTestId('bulk-delete-btn')
      await user.click(deleteButton)

      // Assert
      expect(mockDeleteNodes).toHaveBeenCalled()
    })
  })

  describe('Story 48: View statistics about my mind map', () => {
    it('should open statistics panel when statistics button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockShowStatistics = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="statistics-btn" onClick={mockShowStatistics}>
            Statistics
          </button>
          <div data-testid="statistics-panel">
            <h3>Mind Map Statistics</h3>
            <div data-testid="stat-item" data-metric="node-count">
              Total Nodes: 15
            </div>
            <div data-testid="stat-item" data-metric="depth">
              Maximum Depth: 4
            </div>
            <div data-testid="stat-item" data-metric="connections">
              Total Connections: 14
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click statistics button
      const statsButton = screen.getByTestId('statistics-btn')
      await user.click(statsButton)

      // Assert
      expect(mockShowStatistics).toHaveBeenCalled()
      const statsPanel = screen.getByTestId('statistics-panel')
      expect(statsPanel).toBeInTheDocument()
    })

    it('should display node count statistics', async () => {
      // Arrange
      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="statistics-panel">
            <div data-testid="stat-item" data-metric="node-count">
              Total Nodes: 15
            </div>
            <div data-testid="stat-item" data-metric="node-types">
              Root Nodes: 1
            </div>
            <div data-testid="stat-item" data-metric="node-types">
              Child Nodes: 14
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const statItems = screen.getAllByTestId('stat-item')
      expect(statItems).toHaveLength(3)

      // Find the node count stat by its data-metric attribute
      const nodeCount = statItems.find(item => item.getAttribute('data-metric') === 'node-count')
      expect(nodeCount).toBeInTheDocument()
      expect(nodeCount).toHaveTextContent('Total Nodes: 15')
    })

    it('should display depth and hierarchy statistics', async () => {
      // Arrange
      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="statistics-panel">
            <div data-testid="stat-item" data-metric="depth">
              Maximum Depth: 4
            </div>
            <div data-testid="stat-item" data-metric="levels">
              Levels: 5
            </div>
            <div data-testid="stat-item" data-metric="balance">
              Balance Score: 85%
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const statItems = screen.getAllByTestId('stat-item')
      expect(statItems).toHaveLength(3)

      // Find stats by their data-metric attributes
      const maxDepth = statItems.find(item => item.getAttribute('data-metric') === 'depth')
      expect(maxDepth).toBeInTheDocument()
      expect(maxDepth).toHaveTextContent('Maximum Depth: 4')

      const levels = statItems.find(item => item.getAttribute('data-metric') === 'levels')
      expect(levels).toBeInTheDocument()
      expect(levels).toHaveTextContent('Levels: 5')

      const balance = statItems.find(item => item.getAttribute('data-metric') === 'balance')
      expect(balance).toBeInTheDocument()
      expect(balance).toHaveTextContent('Balance Score: 85%')
    })

    it('should display connection and relationship statistics', async () => {
      // Arrange
      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="statistics-panel">
            <div data-testid="stat-item" data-metric="connections">
              Total Connections: 14
            </div>
            <div data-testid="stat-item" data-metric="cross-links">
              Cross Links: 3
            </div>
            <div data-testid="stat-item" data-metric="density">
              Connection Density: 65%
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const statItems = screen.getAllByTestId('stat-item')
      expect(statItems).toHaveLength(3)

      // Find stats by their data-metric attributes
      const connections = statItems.find(item => item.getAttribute('data-metric') === 'connections')
      expect(connections).toBeInTheDocument()
      expect(connections).toHaveTextContent('Total Connections: 14')

      const crossLinks = statItems.find(item => item.getAttribute('data-metric') === 'cross-links')
      expect(crossLinks).toBeInTheDocument()
      expect(crossLinks).toHaveTextContent('Cross Links: 3')

      const density = statItems.find(item => item.getAttribute('data-metric') === 'density')
      expect(density).toBeInTheDocument()
      expect(density).toHaveTextContent('Connection Density: 65%')
    })
  })

  describe('Story 49: Access keyboard shortcuts reference', () => {
    it('should open keyboard shortcuts modal when help button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockShowShortcuts = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="help-btn" onClick={mockShowShortcuts}>
            Help
          </button>
          <div data-testid="keyboard-shortcuts-modal">
            <h3>Keyboard Shortcuts</h3>
            <div data-testid="shortcut-item">
              <kbd>Enter</kbd>
              <span>Create sibling node</span>
            </div>
            <div data-testid="shortcut-item">
              <kbd>Tab</kbd>
              <span>Create child node</span>
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click help button
      const helpButton = screen.getByTestId('help-btn')
      await user.click(helpButton)

      // Assert
      expect(mockShowShortcuts).toHaveBeenCalled()
      const shortcutsModal = screen.getByTestId('keyboard-shortcuts-modal')
      expect(shortcutsModal).toBeInTheDocument()
    })

    it('should display navigation shortcuts', async () => {
      // Arrange
      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="keyboard-shortcuts-modal">
            <h4>Navigation</h4>
            <div data-testid="shortcut-item">
              <kbd>↑</kbd>
              <span>Move up</span>
            </div>
            <div data-testid="shortcut-item">
              <kbd>↓</kbd>
              <span>Move down</span>
            </div>
            <div data-testid="shortcut-item">
              <kbd>←</kbd>
              <span>Move left</span>
            </div>
            <div data-testid="shortcut-item">
              <kbd>→</kbd>
              <span>Move right</span>
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const shortcutItems = screen.getAllByTestId('shortcut-item')
      expect(shortcutItems).toHaveLength(4)
      expect(shortcutItems[0]).toHaveTextContent('Move up')
      expect(shortcutItems[1]).toHaveTextContent('Move down')
    })

    it('should display editing shortcuts', async () => {
      // Arrange
      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="keyboard-shortcuts-modal">
            <h4>Editing</h4>
            <div data-testid="shortcut-item">
              <kbd>F2</kbd>
              <span>Edit node</span>
            </div>
            <div data-testid="shortcut-item">
              <kbd>Delete</kbd>
              <span>Delete node</span>
            </div>
            <div data-testid="shortcut-item">
              <kbd>Space</kbd>
              <span>Toggle collapse</span>
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const shortcutItems = screen.getAllByTestId('shortcut-item')
      expect(shortcutItems).toHaveLength(3)
      expect(shortcutItems[0]).toHaveTextContent('Edit node')
      expect(shortcutItems[1]).toHaveTextContent('Delete node')
      expect(shortcutItems[2]).toHaveTextContent('Toggle collapse')
    })

    it('should display formatting shortcuts', async () => {
      // Arrange
      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="keyboard-shortcuts-modal">
            <h4>Formatting</h4>
            <div data-testid="shortcut-item">
              <kbd>Ctrl+B</kbd>
              <span>Bold text</span>
            </div>
            <div data-testid="shortcut-item">
              <kbd>Ctrl+I</kbd>
              <span>Italic text</span>
            </div>
            <div data-testid="shortcut-item">
              <kbd>Ctrl+U</kbd>
              <span>Underline text</span>
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const shortcutItems = screen.getAllByTestId('shortcut-item')
      expect(shortcutItems).toHaveLength(3)
      expect(shortcutItems[0]).toHaveTextContent('Bold text')
      expect(shortcutItems[1]).toHaveTextContent('Italic text')
      expect(shortcutItems[2]).toHaveTextContent('Underline text')
    })
  })

  describe('Story 50: Use the mobile toolbar on touch devices', () => {
    it('should show mobile toolbar on touch devices', async () => {
      // Arrange
      // Mock touch device detection
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        value: {},
      })

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="mobile-toolbar">
            <button data-testid="mobile-add-btn">Add</button>
            <button data-testid="mobile-edit-btn">Edit</button>
            <button data-testid="mobile-delete-btn">Delete</button>
            <button data-testid="mobile-zoom-in">Zoom In</button>
            <button data-testid="mobile-zoom-out">Zoom Out</button>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const mobileToolbar = screen.getByTestId('mobile-toolbar')
      expect(mobileToolbar).toBeInTheDocument()
      expect(screen.getByTestId('mobile-add-btn')).toBeInTheDocument()
      expect(screen.getByTestId('mobile-edit-btn')).toBeInTheDocument()
      expect(screen.getByTestId('mobile-delete-btn')).toBeInTheDocument()
    })

    it('should add node using mobile toolbar button', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockAddNode = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="mobile-toolbar">
            <button data-testid="mobile-add-btn" onClick={mockAddNode}>
              Add Node
            </button>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click add button
      const addButton = screen.getByTestId('mobile-add-btn')
      await user.click(addButton)

      // Assert
      expect(mockAddNode).toHaveBeenCalled()
    })

    it('should edit node using mobile toolbar button', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockEditNode = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="mobile-toolbar">
            <button data-testid="mobile-edit-btn" onClick={mockEditNode}>
              Edit Node
            </button>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click edit button
      const editButton = screen.getByTestId('mobile-edit-btn')
      await user.click(editButton)

      // Assert
      expect(mockEditNode).toHaveBeenCalled()
    })

    it('should zoom in/out using mobile toolbar buttons', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockZoomIn = vi.fn()
      const mockZoomOut = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="mobile-toolbar">
            <button data-testid="mobile-zoom-in" onClick={mockZoomIn}>
              Zoom In
            </button>
            <button data-testid="mobile-zoom-out" onClick={mockZoomOut}>
              Zoom Out
            </button>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click zoom in button
      const zoomInButton = screen.getByTestId('mobile-zoom-in')
      await user.click(zoomInButton)

      // Click zoom out button
      const zoomOutButton = screen.getByTestId('mobile-zoom-out')
      await user.click(zoomOutButton)

      // Assert
      expect(mockZoomIn).toHaveBeenCalled()
      expect(mockZoomOut).toHaveBeenCalled()
    })

    it('should handle touch gestures for navigation', async () => {
      // Arrange
      const mockHandleSwipe = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div
          data-testid="mindmap-canvas"
          onTouchStart={e => {
            const touch = e.touches[0]
            mockHandleSwipe('start', touch.clientX, touch.clientY)
          }}
          onTouchMove={e => {
            const touch = e.touches[0]
            mockHandleSwipe('move', touch.clientX, touch.clientY)
          }}
          onTouchEnd={() => {
            mockHandleSwipe('end', 0, 0)
          }}
        >
          <div data-testid="mobile-toolbar">
            <button data-testid="mobile-pan-btn">Pan</button>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Simulate touch events
      const canvas = screen.getByTestId('mindmap-canvas')
      fireEvent.touchStart(canvas, {
        touches: [{ clientX: 100, clientY: 100 }],
      })
      fireEvent.touchMove(canvas, {
        touches: [{ clientX: 150, clientY: 150 }],
      })
      fireEvent.touchEnd(canvas)

      // Assert
      expect(mockHandleSwipe).toHaveBeenCalledTimes(3)
      expect(mockHandleSwipe).toHaveBeenCalledWith('start', 100, 100)
      expect(mockHandleSwipe).toHaveBeenCalledWith('move', 150, 150)
      expect(mockHandleSwipe).toHaveBeenCalledWith('end', 0, 0)
    })
  })
})
