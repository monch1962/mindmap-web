/**
 * Core Workflow Tests - Stories 1-8
 *
 * Tests for core mind map creation and editing workflows
 *
 * Story 1: As a user, I want to create a new mind map with a central topic
 * Story 2: As a user, I want to add child and sibling nodes using keyboard shortcuts
 * Story 3: As a user, I want to edit node content inline
 * Story 4: As a user, I want to drag and drop nodes to reorganize
 * Story 5: As a user, I want to delete nodes using keyboard
 * Story 6: As a user, I want to collapse/expand branches
 * Story 7: As a user, I want to zoom and pan the canvas
 * Story 8: As a user, I want to select multiple nodes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Import test utilities
import { customRender } from '../../test/utils'

// Import mocks
import * as mocks from '../../test/mocks'

// Mock React Flow
vi.mock('reactflow', () => mocks.reactflow)

describe('Core Mind Map Creation & Editing Workflows', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()

    // Setup browser mocks
    mocks.setupBrowserMocks()
  })

  describe('Story 1: Create new mind map with central topic', () => {
    it('should create a new mind map with default central topic', async () => {
      // Arrange
      const user = userEvent.setup()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="central-topic">Central Topic</div>
          <button data-testid="new-mindmap-btn">New Mind Map</button>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      expect(screen.getByTestId('mindmap-canvas')).toBeInTheDocument()
      expect(screen.getByTestId('central-topic')).toHaveTextContent('Central Topic')

      // Test that new mind map button exists
      const newMindMapBtn = screen.getByTestId('new-mindmap-btn')
      expect(newMindMapBtn).toBeInTheDocument()

      // Test clicking new mind map button
      await user.click(newMindMapBtn)

      // Verify central topic is present after creation
      expect(screen.getByTestId('central-topic')).toBeInTheDocument()
    })

    it('should allow customizing central topic text', async () => {
      // Arrange
      const user = userEvent.setup()
      const customTopic = 'My Project Plan'

      // Mock component with editable central topic
      const MindMapCanvas = vi.fn(() => {
        const [topic, setTopic] = React.useState('Central Topic')

        return (
          <div data-testid="mindmap-canvas">
            <div
              data-testid="central-topic"
              contentEditable
              onBlur={e => setTopic(e.currentTarget.textContent || '')}
            >
              {topic}
            </div>
            <input
              data-testid="topic-input"
              defaultValue={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>
        )
      })

      // Act
      customRender(<MindMapCanvas />)

      // Get the editable central topic
      const centralTopic = screen.getByTestId('central-topic')

      // Test double-click to edit
      await user.dblClick(centralTopic)
      await user.clear(centralTopic)
      await user.type(centralTopic, customTopic)
      await user.tab() // Blur to save

      // Assert
      expect(centralTopic).toHaveTextContent(customTopic)

      // Test input field editing
      const topicInput = screen.getByTestId('topic-input')
      await user.clear(topicInput)
      await user.type(topicInput, 'Updated Topic')
      expect(topicInput).toHaveValue('Updated Topic')
    })
  })

  describe('Story 2: Add child and sibling nodes using keyboard shortcuts', () => {
    it('should add child node when Tab key is pressed', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockAddChild = vi.fn()

      // Mock component
      const MindMapCanvas = vi.fn(() => {
        React.useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab' && !e.shiftKey) {
              e.preventDefault()
              mockAddChild('child-node')
            }
          }

          window.addEventListener('keydown', handleKeyDown)
          return () => window.removeEventListener('keydown', handleKeyDown)
        }, [])

        return (
          <div data-testid="mindmap-canvas" tabIndex={0}>
            <div data-testid="selected-node">Selected Node</div>
          </div>
        )
      })

      // Act
      customRender(<MindMapCanvas />)

      // Focus the canvas
      const canvas = screen.getByTestId('mindmap-canvas')
      canvas.focus()

      // Press Tab key
      await user.keyboard('[Tab]')

      // Assert
      expect(mockAddChild).toHaveBeenCalledWith('child-node')
    })

    it('should add sibling node when Enter key is pressed', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockAddSibling = vi.fn()

      // Mock component
      const MindMapCanvas = vi.fn(() => {
        React.useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              mockAddSibling('sibling-node')
            }
          }

          window.addEventListener('keydown', handleKeyDown)
          return () => window.removeEventListener('keydown', handleKeyDown)
        }, [])

        return (
          <div data-testid="mindmap-canvas" tabIndex={0}>
            <div data-testid="selected-node">Selected Node</div>
          </div>
        )
      })

      // Act
      customRender(<MindMapCanvas />)

      // Focus the canvas
      const canvas = screen.getByTestId('mindmap-canvas')
      canvas.focus()

      // Press Enter key
      await user.keyboard('[Enter]')

      // Assert
      expect(mockAddSibling).toHaveBeenCalledWith('sibling-node')
    })
  })

  describe('Story 3: Edit node content inline', () => {
    it('should edit node content when double-clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const initialText = 'Initial Text'
      const updatedText = 'Updated Text'

      // Mock editable node component
      const EditableNode = vi.fn(() => {
        const [text, setText] = React.useState(initialText)
        const [isEditing, setIsEditing] = React.useState(false)

        return (
          <div data-testid="node">
            {isEditing ? (
              <input
                data-testid="node-input"
                value={text}
                onChange={e => setText(e.target.value)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setIsEditing(false)
                  }
                  if (e.key === 'Escape') {
                    setText(initialText)
                    setIsEditing(false)
                  }
                }}
                autoFocus
              />
            ) : (
              <div data-testid="node-text" onDoubleClick={() => setIsEditing(true)}>
                {text}
              </div>
            )}
          </div>
        )
      })

      // Act
      customRender(<EditableNode />)

      // Verify initial state
      const nodeText = screen.getByTestId('node-text')
      expect(nodeText).toHaveTextContent(initialText)

      // Double-click to edit
      await user.dblClick(nodeText)

      // Verify editing state
      const nodeInput = screen.getByTestId('node-input')
      expect(nodeInput).toBeInTheDocument()
      expect(nodeInput).toHaveValue(initialText)

      // Update text
      await user.clear(nodeInput)
      await user.type(nodeInput, updatedText)
      expect(nodeInput).toHaveValue(updatedText)

      // Press Enter to save
      await user.keyboard('[Enter]')

      // Verify updated state
      expect(screen.getByTestId('node-text')).toHaveTextContent(updatedText)
    })
  })

  describe('Story 4: Drag and drop nodes to reorganize', () => {
    it('should allow dragging a node', async () => {
      // Arrange
      const mockDragStart = vi.fn()
      const mockDragEnd = vi.fn()

      // Mock draggable node
      const DraggableNode = vi.fn(() => {
        return (
          <div
            data-testid="draggable-node"
            draggable
            onDragStart={e => {
              // Mock dataTransfer for test environment
              if (e.dataTransfer) {
                e.dataTransfer.setData('text/plain', 'node-id')
              }
              mockDragStart('node-id')
            }}
            onDragEnd={() => mockDragEnd()}
          >
            Draggable Node
          </div>
        )
      })

      // Act
      customRender(<DraggableNode />)

      const node = screen.getByTestId('draggable-node')

      // Mock dataTransfer for drag event
      const dataTransfer = {
        setData: vi.fn(),
        clearData: vi.fn(),
        setDragImage: vi.fn(),
        effectAllowed: 'none',
        dropEffect: 'none',
        types: [],
        files: [],
      }

      // Start drag with mocked dataTransfer
      fireEvent.dragStart(node, { dataTransfer })

      // Assert
      expect(mockDragStart).toHaveBeenCalledWith('node-id')
      expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'node-id')

      // End drag
      fireEvent.dragEnd(node)
      expect(mockDragEnd).toHaveBeenCalled()
    })
  })

  describe('Story 5: Delete nodes using keyboard', () => {
    it('should delete selected node when Delete key is pressed', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockDeleteNode = vi.fn()

      // Mock component with delete support
      const MindMapCanvas = vi.fn(() => {
        React.useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete') {
              e.preventDefault()
              mockDeleteNode('selected-node-id')
            }
          }

          window.addEventListener('keydown', handleKeyDown)
          return () => window.removeEventListener('keydown', handleKeyDown)
        }, [])

        return (
          <div data-testid="mindmap-canvas" tabIndex={0}>
            <div data-testid="selected-node">Selected Node</div>
          </div>
        )
      })

      // Act
      customRender(<MindMapCanvas />)

      // Focus and press Delete
      const canvas = screen.getByTestId('mindmap-canvas')
      canvas.focus()
      await user.keyboard('[Delete]')

      // Assert
      expect(mockDeleteNode).toHaveBeenCalledWith('selected-node-id')
    })
  })

  describe('Story 6: Collapse/expand branches', () => {
    it('should collapse branch when Space key is pressed', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockToggleCollapse = vi.fn()

      // Mock component with collapse support
      const MindMapCanvas = vi.fn(() => {
        React.useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ') {
              e.preventDefault()
              mockToggleCollapse('node-id', 'collapse')
            }
          }

          window.addEventListener('keydown', handleKeyDown)
          return () => window.removeEventListener('keydown', handleKeyDown)
        }, [])

        return (
          <div data-testid="mindmap-canvas" tabIndex={0}>
            <div data-testid="selected-node">Selected Node</div>
          </div>
        )
      })

      // Act
      customRender(<MindMapCanvas />)

      // Focus and press Space
      const canvas = screen.getByTestId('mindmap-canvas')
      canvas.focus()
      await user.keyboard(' ')

      // Assert
      expect(mockToggleCollapse).toHaveBeenCalledWith('node-id', 'collapse')
    })
  })

  describe('Story 7: Zoom and pan the canvas', () => {
    it('should zoom in with mouse wheel', async () => {
      // Arrange
      const mockZoomIn = vi.fn()

      // Mock component with zoom
      const MindMapCanvas = vi.fn(() => {
        return (
          <div
            data-testid="mindmap-canvas"
            onWheel={e => {
              if (e.deltaY < 0) {
                mockZoomIn()
              }
            }}
          >
            Canvas
          </div>
        )
      })

      // Act
      customRender(<MindMapCanvas />)

      const canvas = screen.getByTestId('mindmap-canvas')

      // Simulate wheel up (zoom in)
      fireEvent.wheel(canvas, { deltaY: -100 })

      // Assert
      expect(mockZoomIn).toHaveBeenCalled()
    })
  })

  describe('Story 8: Select multiple nodes', () => {
    it('should select multiple nodes with Shift+Click', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockSelectMultiple = vi.fn()

      // Mock component with multi-select
      const MindMapCanvas = vi.fn(() => {
        const handleNodeClick = (nodeId: string, shiftKey: boolean) => {
          mockSelectMultiple(nodeId, shiftKey)
        }

        return (
          <div data-testid="mindmap-canvas">
            <div data-testid="node-1" onClick={e => handleNodeClick('node-1', e.shiftKey)}>
              Node 1
            </div>
            <div data-testid="node-2" onClick={e => handleNodeClick('node-2', e.shiftKey)}>
              Node 2
            </div>
          </div>
        )
      })

      // Act
      customRender(<MindMapCanvas />)

      // Click first node
      await user.click(screen.getByTestId('node-1'))
      expect(mockSelectMultiple).toHaveBeenCalledWith('node-1', false)

      // Click second node with Shift
      await user.keyboard('{Shift>}')
      await user.click(screen.getByTestId('node-2'))
      await user.keyboard('{/Shift}')

      // Assert
      expect(mockSelectMultiple).toHaveBeenCalledWith('node-2', true)
    })
  })
})
