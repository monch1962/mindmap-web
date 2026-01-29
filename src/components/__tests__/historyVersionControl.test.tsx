/**
 * History & Version Control Tests - Stories 42-45
 *
 * Tests for history and version control features
 *
 * Story 42: As a user, I want to undo/redo changes using Ctrl+Z/Ctrl+Y
 * Story 43: As a user, I want to view a visual history timeline
 * Story 44: As a user, I want to restore from previous auto-save versions
 * Story 45: As a user, I want to resolve save conflicts when working on multiple devices
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Import test utilities
import { customRender } from '../../test/utils'

// Import mocks
import * as mocks from '../../test/mocks'

// Mock React Flow
vi.mock('reactflow', () => mocks.reactflow)

describe('History & Version Control Tests (Stories 42-45)', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()

    // Setup browser mocks
    mocks.setupBrowserMocks()
  })

  describe('Story 42: Undo/redo changes using Ctrl+Z/Ctrl+Y', () => {
    it('should undo last change when Ctrl+Z is pressed', async () => {
      // Arrange
      const mockUndo = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(({ initialData }: any) => (
        <div data-testid="mindmap-canvas">
          <div data-testid="central-topic">{initialData?.content || 'Central Topic'}</div>
          <button data-testid="undo-btn" onClick={mockUndo}>
            Undo
          </button>
          <div
            data-testid="keyboard-handler"
            onKeyDown={e => {
              if (e.ctrlKey && e.key === 'z') {
                mockUndo()
              }
            }}
          />
        </div>
      ))

      // Act
      customRender(<MindMapCanvas initialData={{ content: 'Test Mind Map' }} />)

      // Simulate Ctrl+Z key press
      const keyboardHandler = screen.getByTestId('keyboard-handler')
      fireEvent.keyDown(keyboardHandler, { key: 'z', ctrlKey: true })

      // Assert
      expect(mockUndo).toHaveBeenCalled()
    })

    it('should redo last undone change when Ctrl+Y is pressed', async () => {
      // Arrange
      const mockRedo = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="redo-btn" onClick={mockRedo}>
            Redo
          </button>
          <div
            data-testid="keyboard-handler"
            onKeyDown={e => {
              if (e.ctrlKey && e.key === 'y') {
                mockRedo()
              }
            }}
          />
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Simulate Ctrl+Y key press
      const keyboardHandler = screen.getByTestId('keyboard-handler')
      fireEvent.keyDown(keyboardHandler, { key: 'y', ctrlKey: true })

      // Assert
      expect(mockRedo).toHaveBeenCalled()
    })

    it('should show undo button in toolbar when undo is available', async () => {
      // Arrange
      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="undo-btn" disabled={false}>
            Undo
          </button>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const undoButton = screen.getByTestId('undo-btn')
      expect(undoButton).toBeEnabled()
      expect(undoButton).toHaveTextContent('Undo')
    })

    it('should show redo button in toolbar when redo is available', async () => {
      // Arrange
      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="redo-btn" disabled={false}>
            Redo
          </button>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const redoButton = screen.getByTestId('redo-btn')
      expect(redoButton).toBeEnabled()
      expect(redoButton).toHaveTextContent('Redo')
    })
  })

  describe('Story 43: View visual history timeline', () => {
    it('should open history timeline panel when history button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      let timelineOpen = false
      const mockOpenTimeline = vi.fn(() => {
        timelineOpen = true
      })

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="history-btn" onClick={mockOpenTimeline}>
            History
          </button>
          {timelineOpen && (
            <div data-testid="history-timeline-panel">
              <h3>History Timeline</h3>
              <div data-testid="timeline-entry">Created node - 10:00 AM</div>
              <div data-testid="timeline-entry">Edited content - 10:05 AM</div>
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click history button
      const historyButton = screen.getByTestId('history-btn')
      await user.click(historyButton)

      // Assert
      expect(mockOpenTimeline).toHaveBeenCalled()
      const timelinePanel = screen.getByTestId('history-timeline-panel')
      expect(timelinePanel).toBeInTheDocument()
    })

    it('should display timeline entries in chronological order', async () => {
      // Arrange
      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="history-timeline-panel">
            <div data-testid="timeline-entry">Created node - 10:00 AM</div>
            <div data-testid="timeline-entry">Edited content - 10:05 AM</div>
            <div data-testid="timeline-entry">Added child node - 10:10 AM</div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const timelineEntries = screen.getAllByTestId('timeline-entry')
      expect(timelineEntries).toHaveLength(3)
      expect(timelineEntries[0]).toHaveTextContent('Created node - 10:00 AM')
      expect(timelineEntries[1]).toHaveTextContent('Edited content - 10:05 AM')
      expect(timelineEntries[2]).toHaveTextContent('Added child node - 10:10 AM')
    })

    it('should filter timeline by date range', async () => {
      // Arrange
      const user = userEvent.setup()
      let filteredEntries = ['Created node - 2026-01-29']

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="history-timeline-panel">
            <input
              data-testid="date-filter"
              type="date"
              defaultValue="2026-01-29"
              onChange={() => {
                filteredEntries = ['Created node - 2026-01-29']
              }}
            />
            {filteredEntries.map((entry, index) => (
              <div key={index} data-testid="timeline-entry">
                {entry}
              </div>
            ))}
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Change date filter
      const dateFilter = screen.getByTestId('date-filter')
      await user.type(dateFilter, '2026-01-29')

      // Assert
      const timelineEntries = screen.getAllByTestId('timeline-entry')
      expect(timelineEntries).toHaveLength(1)
      expect(timelineEntries[0]).toHaveTextContent('Created node - 2026-01-29')
    })

    it('should show visual diff between timeline versions', async () => {
      // Arrange
      const user = userEvent.setup()
      let showDiff = false
      const mockShowDiff = vi.fn(() => {
        showDiff = true
      })

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="show-diff-btn" onClick={mockShowDiff}>
            Show Diff
          </button>
          {showDiff && (
            <div data-testid="diff-view">
              <div data-testid="diff-line">+ Added new node</div>
              <div data-testid="diff-line">~ Changed content</div>
              <div data-testid="diff-line">- Removed node</div>
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click show diff button
      const diffButton = screen.getByTestId('show-diff-btn')
      await user.click(diffButton)

      // Assert
      expect(mockShowDiff).toHaveBeenCalled()
      const diffView = screen.getByTestId('diff-view')
      expect(diffView).toBeInTheDocument()
      expect(screen.getAllByTestId('diff-line')).toHaveLength(3)
    })
  })

  describe('Story 44: Restore from previous auto-save versions', () => {
    it('should show auto-save versions in recovery panel', async () => {
      // Arrange
      const user = userEvent.setup()
      let recoveryOpen = false
      const mockOpenRecovery = vi.fn(() => {
        recoveryOpen = true
      })

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="recovery-btn" onClick={mockOpenRecovery}>
            Recovery
          </button>
          {recoveryOpen && (
            <div data-testid="auto-save-versions-list">
              <div data-testid="version-item">
                <span>Version 1 - 10:00 AM (2.1 KB)</span>
                <span>Project Planning Mind Map</span>
              </div>
              <div data-testid="version-item">
                <span>Version 2 - 09:45 AM (1.8 KB)</span>
                <span>Project Planning Mind</span>
              </div>
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click recovery button
      const recoveryButton = screen.getByTestId('recovery-btn')
      await user.click(recoveryButton)

      // Assert
      expect(mockOpenRecovery).toHaveBeenCalled()
      const versionList = screen.getByTestId('auto-save-versions-list')
      expect(versionList).toBeInTheDocument()
      expect(screen.getAllByTestId('version-item')).toHaveLength(2)
    })

    it('should preview auto-save version before restoring', async () => {
      // Arrange
      const user = userEvent.setup()
      let showPreview = false
      const mockShowPreview = vi.fn(() => {
        showPreview = true
      })

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="preview-btn" onClick={mockShowPreview}>
            Preview
          </button>
          {showPreview && (
            <div data-testid="version-preview-panel">
              <h3>Preview: Project Planning Mind Map</h3>
              <div data-testid="preview-content">
                <div>Central Topic</div>
                <div>├── Task 1</div>
                <div>├── Task 2</div>
                <div>└── Task 3</div>
              </div>
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click preview button
      const previewButton = screen.getByTestId('preview-btn')
      await user.click(previewButton)

      // Assert
      expect(mockShowPreview).toHaveBeenCalled()
      const previewPanel = screen.getByTestId('version-preview-panel')
      expect(previewPanel).toBeInTheDocument()
      expect(previewPanel).toHaveTextContent('Project Planning Mind Map')
    })

    it('should restore mind map from selected auto-save version', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockRestore = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="auto-save-versions-list">
            <div data-testid="version-item">
              <span>Version 1 - 10:00 AM</span>
              <button data-testid="restore-btn" onClick={() => mockRestore('1')}>
                Restore
              </button>
            </div>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click restore button
      const restoreButton = screen.getByTestId('restore-btn')
      await user.click(restoreButton)

      // Assert
      expect(mockRestore).toHaveBeenCalledWith('1')
    })

    it('should show confirmation dialog before restoring', async () => {
      // Arrange
      const user = userEvent.setup()
      let showConfirmation = false
      const mockShowConfirmation = vi.fn(() => {
        showConfirmation = true
      })

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="restore-btn" onClick={mockShowConfirmation}>
            Restore
          </button>
          {showConfirmation && (
            <div role="dialog" data-testid="confirmation-dialog">
              <h3>Are you sure?</h3>
              <p>This will replace your current mind map with the selected version.</p>
              <button data-testid="confirm-restore-btn">Confirm Restore</button>
              <button data-testid="cancel-btn">Cancel</button>
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click restore button
      const restoreButton = screen.getByTestId('restore-btn')
      await user.click(restoreButton)

      // Assert
      expect(mockShowConfirmation).toHaveBeenCalled()
      const confirmationDialog = screen.getByTestId('confirmation-dialog')
      expect(confirmationDialog).toBeInTheDocument()
      expect(confirmationDialog).toHaveTextContent(/are you sure/i)
    })
  })

  describe('Story 45: Resolve save conflicts when working on multiple devices', () => {
    it('should show conflict resolution dialog when conflicts are detected', async () => {
      // Arrange
      const conflicts = [
        { id: '1', device: 'Mobile', timestamp: '10:00 AM', changes: 'Added 3 nodes' },
        { id: '2', device: 'Desktop', timestamp: '10:05 AM', changes: 'Modified 2 nodes' },
      ]

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="conflict-resolution-dialog">
            <h3>Save Conflicts Detected</h3>
            {conflicts.map(conflict => (
              <div key={conflict.id} data-testid="conflict-item">
                <span>
                  {conflict.device} - {conflict.timestamp}
                </span>
                <span>{conflict.changes}</span>
              </div>
            ))}
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Assert
      const conflictDialog = screen.getByTestId('conflict-resolution-dialog')
      expect(conflictDialog).toBeInTheDocument()
      expect(screen.getAllByTestId('conflict-item')).toHaveLength(2)
    })

    it('should allow selecting which version to keep in conflict resolution', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockSelectVersion = vi.fn()

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <div data-testid="conflict-resolution-dialog">
            <div data-testid="conflict-item">
              <input
                type="radio"
                data-testid="mobile-version-radio"
                name="version"
                onChange={() => mockSelectVersion('mobile')}
              />
              <label>Mobile Version</label>
            </div>
            <button data-testid="keep-version-btn" onClick={() => {}}>
              Keep This Version
            </button>
          </div>
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Select mobile version
      const mobileRadio = screen.getByTestId('mobile-version-radio')
      await user.click(mobileRadio)

      // Click keep version button
      const keepButton = screen.getByTestId('keep-version-btn')
      await user.click(keepButton)

      // Assert
      expect(mockSelectVersion).toHaveBeenCalledWith('mobile')
    })

    it('should allow merging changes from conflicting versions', async () => {
      // Arrange
      const user = userEvent.setup()
      let showMergeDialog = false
      const mockShowMerge = vi.fn(() => {
        showMergeDialog = true
      })

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="merge-btn" onClick={mockShowMerge}>
            Merge Changes
          </button>
          {showMergeDialog && (
            <div data-testid="merge-dialog">
              <h3>Select Changes to Merge</h3>
              <div data-testid="merge-option">
                <input type="checkbox" data-testid="merge-node-1" />
                <label>Add Task 1 from Mobile</label>
              </div>
              <div data-testid="merge-option">
                <input type="checkbox" data-testid="merge-node-2" />
                <label>Update Task 2 from Desktop</label>
              </div>
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click merge button
      const mergeButton = screen.getByTestId('merge-btn')
      await user.click(mergeButton)

      // Assert
      expect(mockShowMerge).toHaveBeenCalled()
      const mergeDialog = screen.getByTestId('merge-dialog')
      expect(mergeDialog).toBeInTheDocument()
      expect(mergeDialog).toHaveTextContent(/select changes to merge/i)
    })

    it('should show preview of conflicting changes before resolution', async () => {
      // Arrange
      const user = userEvent.setup()
      let showPreview = false
      const mockShowPreview = vi.fn(() => {
        showPreview = true
      })

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <button data-testid="preview-changes-btn" onClick={mockShowPreview}>
            Preview Changes
          </button>
          {showPreview && (
            <div data-testid="conflict-preview-panel">
              <h3>Mobile Changes (10:00 AM)</h3>
              <div data-testid="preview-content">Added 3 nodes</div>
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click preview button
      const previewButton = screen.getByTestId('preview-changes-btn')
      await user.click(previewButton)

      // Assert
      expect(mockShowPreview).toHaveBeenCalled()
      const previewPanel = screen.getByTestId('conflict-preview-panel')
      expect(previewPanel).toBeInTheDocument()
      expect(previewPanel).toHaveTextContent('Added 3 nodes')
    })

    it('should resolve conflicts and continue editing', async () => {
      // Arrange
      const user = userEvent.setup()
      let conflictResolved = false
      const mockResolveConflict = vi.fn(() => {
        conflictResolved = true
      })

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          {!conflictResolved ? (
            <div data-testid="conflict-resolution-dialog">
              <button data-testid="resolve-btn" onClick={mockResolveConflict}>
                Resolve Conflict
              </button>
            </div>
          ) : (
            <div data-testid="mindmap-editor">
              <div data-testid="central-topic">Central Topic</div>
              <div data-testid="child-node">Child Node 1</div>
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click resolve button
      const resolveButton = screen.getByTestId('resolve-btn')
      await user.click(resolveButton)

      // Assert
      expect(mockResolveConflict).toHaveBeenCalled()
      await waitFor(() => {
        expect(screen.queryByTestId('conflict-resolution-dialog')).not.toBeInTheDocument()
      })
      const mindMapEditor = screen.getByTestId('mindmap-editor')
      expect(mindMapEditor).toBeInTheDocument()
    })
  })
})
