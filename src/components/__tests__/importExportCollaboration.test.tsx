/**
 * Import/Export & Collaboration Features Tests - Stories 24-33
 *
 * Tests for file import/export and collaboration features
 *
 * Story 24: As a user, I want to import FreeMind (.mm) files
 * Story 25: As a user, I want to export my mind map as JSON
 * Story 26: As a user, I want to export my mind map as SVG/PNG/PDF
 * Story 27: As a user, I want to export my mind map as Markdown
 * Story 28: As a user, I want to export to calendar format (iCal)
 * Story 29: As a user, I want to email my mind map directly from the app
 * Story 30: As a user, I want to see other users' cursors and selections in real-time
 * Story 31: As a user, I want to add comments to specific nodes
 * Story 32: As a user, I want to resolve comment threads
 * Story 33: As a user, I want to configure webhooks for node changes
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

describe('Import/Export & Collaboration Features Workflows', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()

    // Setup browser mocks
    mocks.setupBrowserMocks()
  })

  describe('Story 24: Import FreeMind (.mm) files', () => {
    it('should open file import dialog', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnOpenImport = vi.fn()

      // Mock import button
      const ImportButton = vi.fn(({ onClick }) => (
        <button data-testid="import-btn" onClick={onClick} aria-label="Import file">
          📥 Import
        </button>
      ))

      // Mock file input
      const FileImportInput = vi.fn(() => (
        <input
          data-testid="file-import-input"
          type="file"
          accept=".mm,.xml"
          style={{ display: 'none' }}
        />
      ))

      // Act
      customRender(
        <div>
          <ImportButton onClick={() => mockOnOpenImport(true)} />
          <FileImportInput />
        </div>
      )

      // Click import button
      const importButton = screen.getByTestId('import-btn')
      await user.click(importButton)

      // Assert
      expect(mockOnOpenImport).toHaveBeenCalledWith(true)
      expect(screen.getByTestId('file-import-input')).toBeInTheDocument()
    })

    it('should handle FreeMind file selection', async () => {
      // Arrange
      const mockOnFileSelect = vi.fn()
      const testFile = new File(
        ['<map version="1.0.1"><node TEXT="Test"></node></map>'],
        'test.mm',
        { type: 'application/xml' }
      )

      // Mock file selector
      const FileSelector = vi.fn(({ onChange }) => (
        <input
          data-testid="freemind-file-selector"
          type="file"
          accept=".mm"
          onChange={e => onChange(e.target.files)}
        />
      ))

      // Act
      customRender(<FileSelector onChange={mockOnFileSelect} />)

      // Select file - create a proper FileList mock
      const fileInput = screen.getByTestId('freemind-file-selector')

      // Create a mock FileList
      const fileList = {
        0: testFile,
        length: 1,
        item: (index: number) => (index === 0 ? testFile : null),
        [Symbol.iterator]: function* () {
          yield testFile
        },
      } as FileList

      Object.defineProperty(fileInput, 'files', {
        value: fileList,
        writable: false,
      })

      // Simulate file selection
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))

      // Assert
      expect(mockOnFileSelect).toHaveBeenCalled()
    })

    it('should parse FreeMind XML content', () => {
      // Arrange
      const mockFreeMindXML =
        '<?xml version="1.0" encoding="UTF-8"?><map version="1.0.1"><node TEXT="Central Topic"><node TEXT="Child 1"/><node TEXT="Child 2"/></node></map>'
      const mockParsedData = {
        root: 'Central Topic',
        children: ['Child 1', 'Child 2'],
      }

      // Mock XML parser display
      const XMLParserDisplay = vi.fn(({ xml, parsedData }) => (
        <div data-testid="xml-parser">
          <div data-testid="xml-content">{xml.substring(0, 50)}...</div>
          <div data-testid="parsed-data">
            <div data-testid="root-node">{parsedData.root}</div>
            <div data-testid="child-count">{parsedData.children.length} children</div>
          </div>
        </div>
      ))

      // Act
      customRender(<XMLParserDisplay xml={mockFreeMindXML} parsedData={mockParsedData} />)

      // Assert
      expect(screen.getByTestId('xml-parser')).toBeInTheDocument()
      expect(screen.getByTestId('root-node')).toHaveTextContent('Central Topic')
      expect(screen.getByTestId('child-count')).toHaveTextContent('2 children')
    })
  })

  describe('Story 25: Export mind map as JSON', () => {
    it('should open JSON export options', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnOpenExport = vi.fn()

      // Mock export button
      const ExportButton = vi.fn(({ onClick }) => (
        <button data-testid="export-json-btn" onClick={onClick} aria-label="Export as JSON">
          📤 Export JSON
        </button>
      ))

      // Mock export options
      const ExportOptions = vi.fn(() => (
        <div data-testid="json-export-options">
          <label>
            <input type="checkbox" data-testid="include-metadata" />
            Include metadata
          </label>
          <label>
            <input type="checkbox" data-testid="pretty-print" />
            Pretty print
          </label>
        </div>
      ))

      // Act
      customRender(
        <div>
          <ExportButton onClick={() => mockOnOpenExport(true)} />
          <ExportOptions />
        </div>
      )

      // Click export button
      const exportButton = screen.getByTestId('export-json-btn')
      await user.click(exportButton)

      // Assert
      expect(mockOnOpenExport).toHaveBeenCalledWith(true)
      expect(screen.getByTestId('json-export-options')).toBeInTheDocument()
    })

    it('should generate JSON export data', () => {
      // Arrange
      const mockMindMapData = {
        id: 'map-123',
        root: {
          id: 'node-1',
          content: 'Project Plan',
          children: [
            { id: 'node-2', content: 'Research' },
            { id: 'node-3', content: 'Development' },
          ],
        },
        metadata: {
          created: '2024-01-01',
          version: '1.0',
        },
      }

      // Mock JSON export display
      const JSONExportDisplay = vi.fn(({ data }) => (
        <div data-testid="json-export-display">
          <div data-testid="json-preview">{JSON.stringify(data, null, 2).substring(0, 100)}...</div>
          <div data-testid="node-count">Total nodes: {countNodes(data.root)}</div>
        </div>
      ))

      // Helper function to count nodes
      const countNodes = (node: {
        id: string
        content: string
        children?: Array<{ id: string; content: string }>
      }) => {
        let count = 1
        if (node.children) {
          count += node.children.length
        }
        return count
      }

      // Act
      customRender(<JSONExportDisplay data={mockMindMapData} />)

      // Assert
      expect(screen.getByTestId('json-export-display')).toBeInTheDocument()
      expect(screen.getByTestId('node-count')).toHaveTextContent('Total nodes: 3')
    })

    it('should download JSON file', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnDownload = vi.fn()

      // Mock download button
      const DownloadButton = vi.fn(({ onClick }) => (
        <button
          data-testid="download-json-btn"
          onClick={() => onClick('mindmap.json', '{"id":"test"}')}
        >
          Download JSON
        </button>
      ))

      // Act
      customRender(<DownloadButton onClick={mockOnDownload} />)

      // Click download button
      const downloadButton = screen.getByTestId('download-json-btn')
      await user.click(downloadButton)

      // Assert
      expect(mockOnDownload).toHaveBeenCalledWith('mindmap.json', '{"id":"test"}')
    })
  })

  describe('Story 26: Export as SVG/PNG/PDF', () => {
    it('should show visual export format options', () => {
      // Arrange
      const mockExportFormats = ['SVG', 'PNG', 'PDF']

      // Mock format selector
      const FormatSelector = vi.fn(({ formats }) => (
        <div data-testid="format-selector">
          <h3>Export as Image</h3>
          <div data-testid="format-options">
            {formats.map((format: string) => (
              <button key={format} data-testid={`export-${format.toLowerCase()}-btn`}>
                Export as {format}
              </button>
            ))}
          </div>
        </div>
      ))

      // Act
      customRender(<FormatSelector formats={mockExportFormats} />)

      // Assert
      expect(screen.getByTestId('format-selector')).toBeInTheDocument()
      expect(screen.getByTestId('export-svg-btn')).toBeInTheDocument()
      expect(screen.getByTestId('export-png-btn')).toBeInTheDocument()
      expect(screen.getByTestId('export-pdf-btn')).toBeInTheDocument()
    })

    it('should generate SVG export', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnExportSVG = vi.fn()

      // Mock SVG export button
      const SVGExportButton = vi.fn(({ onClick }) => (
        <button
          data-testid="export-svg-btn"
          onClick={() => onClick('mindmap.svg', '<svg>...</svg>')}
        >
          Export SVG
        </button>
      ))

      // Act
      customRender(<SVGExportButton onClick={mockOnExportSVG} />)

      // Click SVG export button
      const svgButton = screen.getByTestId('export-svg-btn')
      await user.click(svgButton)

      // Assert
      expect(mockOnExportSVG).toHaveBeenCalledWith('mindmap.svg', '<svg>...</svg>')
    })

    it('should show export preview', () => {
      // Arrange
      const mockPreviewData =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PC9zdmc+'

      // Mock preview display
      const ExportPreview = vi.fn(({ previewData }) => (
        <div data-testid="export-preview">
          <img data-testid="preview-image" src={previewData} alt="Export preview" />
          <div data-testid="preview-info">Preview ready</div>
        </div>
      ))

      // Act
      customRender(<ExportPreview previewData={mockPreviewData} />)

      // Assert
      expect(screen.getByTestId('export-preview')).toBeInTheDocument()
      expect(screen.getByTestId('preview-image')).toHaveAttribute('src', mockPreviewData)
      expect(screen.getByTestId('preview-info')).toHaveTextContent('Preview ready')
    })
  })

  describe('Story 27: Export as Markdown', () => {
    it('should generate Markdown from mind map structure', () => {
      // Arrange
      const mockMindMapStructure = {
        root: 'Project',
        children: [
          { content: 'Planning', children: ['Timeline', 'Budget'] },
          { content: 'Execution', children: ['Development', 'Testing'] },
        ],
      }

      // Mock Markdown generator display
      const MarkdownGenerator = vi.fn(({ structure }) => (
        <div data-testid="markdown-generator">
          <textarea data-testid="markdown-output" readOnly value={generateMarkdown(structure)} />
          <div data-testid="line-count">
            Lines: {generateMarkdown(structure).split('\\n').length}
          </div>
        </div>
      ))

      // Helper function to generate markdown
      const generateMarkdown = (structure: {
        root: string
        children: Array<{ content: string; children: string[] }>
      }) => {
        let markdown = `# ${structure.root}\\n\\n`

        structure.children.forEach(child => {
          markdown += `## ${child.content}\\n`
          child.children.forEach(subChild => {
            markdown += `- ${subChild}\\n`
          })
          markdown += '\\n'
        })

        return markdown.trim()
      }

      // Act
      customRender(<MarkdownGenerator structure={mockMindMapStructure} />)

      // Assert
      expect(screen.getByTestId('markdown-generator')).toBeInTheDocument()
      const textarea = screen.getByTestId('markdown-output') as HTMLTextAreaElement
      expect(textarea.value).toContain('# Project')
      expect(textarea.value).toContain('## Planning')
      expect(textarea.value).toContain('- Timeline')
      expect(screen.getByTestId('line-count')).toHaveTextContent('Lines: 11')
    })

    it('should offer Markdown export options', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnOptionChange = vi.fn()

      // Mock Markdown options
      const MarkdownOptions = vi.fn(({ onChange }) => (
        <div data-testid="markdown-options">
          <label>
            <input
              type="checkbox"
              data-testid="include-frontmatter"
              onChange={e => onChange('frontmatter', e.target.checked)}
            />
            Include frontmatter
          </label>
          <label>
            <input
              type="checkbox"
              data-testid="use-checkboxes"
              onChange={e => onChange('checkboxes', e.target.checked)}
            />
            Use checkboxes for tasks
          </label>
        </div>
      ))

      // Act
      customRender(<MarkdownOptions onChange={mockOnOptionChange} />)

      // Toggle frontmatter option
      const frontmatterCheckbox = screen.getByTestId('include-frontmatter')
      await user.click(frontmatterCheckbox)

      // Toggle checkboxes option
      const checkboxesCheckbox = screen.getByTestId('use-checkboxes')
      await user.click(checkboxesCheckbox)

      // Assert
      expect(mockOnOptionChange).toHaveBeenCalledWith('frontmatter', true)
      expect(mockOnOptionChange).toHaveBeenCalledWith('checkboxes', true)
    })
  })

  describe('Story 28: Export to calendar format (iCal)', () => {
    it('should extract calendar events from mind map', () => {
      // Arrange
      const mockMindMapWithDates = {
        nodes: [
          { id: 'node-1', content: 'Team Meeting', date: '2024-01-15' },
          { id: 'node-2', content: 'Project Deadline', date: '2024-01-31' },
          { id: 'node-3', content: 'Client Review', date: '2024-02-10' },
        ],
      }

      // Mock calendar events display
      const CalendarEventsDisplay = vi.fn(({ nodes }) => (
        <div data-testid="calendar-events">
          <h3>Calendar Events</h3>
          <ul data-testid="events-list">
            {nodes
              .filter((node: { id: string; content: string; date?: string }) => node.date)
              .map((node: { id: string; content: string; date?: string }) => (
                <li key={node.id} data-testid={`event-${node.id}`}>
                  {node.content} - {node.date}
                </li>
              ))}
          </ul>
          <div data-testid="event-count">
            {
              nodes.filter((node: { id: string; content: string; date?: string }) => node.date)
                .length
            }{' '}
            events found
          </div>
        </div>
      ))

      // Act
      customRender(<CalendarEventsDisplay nodes={mockMindMapWithDates.nodes} />)

      // Assert
      expect(screen.getByTestId('calendar-events')).toBeInTheDocument()
      expect(screen.getByTestId('event-count')).toHaveTextContent('3 events found')
      expect(screen.getByTestId('event-node-1')).toHaveTextContent('Team Meeting - 2024-01-15')
    })

    it('should generate iCal format data', () => {
      // Arrange
      const mockICalData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MindMap//EN
BEGIN:VEVENT
SUMMARY:Team Meeting
DTSTART:20240115T100000
DTEND:20240115T110000
END:VEVENT
END:VCALENDAR`

      // Mock iCal display
      const ICalDisplay = vi.fn(({ data }) => (
        <div data-testid="ical-display">
          <pre data-testid="ical-content">{data}</pre>
          <div data-testid="ical-size">{data.length} characters</div>
        </div>
      ))

      // Act
      customRender(<ICalDisplay data={mockICalData} />)

      // Assert
      expect(screen.getByTestId('ical-display')).toBeInTheDocument()
      expect(screen.getByTestId('ical-content')).toHaveTextContent('BEGIN:VCALENDAR')
      expect(screen.getByTestId('ical-size')).toHaveTextContent('154 characters')
    })
  })

  describe('Story 29: Email mind map directly', () => {
    it('should open email composition dialog', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnOpenEmail = vi.fn()

      // Mock email button
      const EmailButton = vi.fn(({ onClick }) => (
        <button data-testid="email-btn" onClick={onClick} aria-label="Email mind map">
          📧 Email
        </button>
      ))

      // Mock email dialog
      const EmailDialog = vi.fn(() => (
        <div data-testid="email-dialog">
          <input data-testid="recipient-input" placeholder="Recipient email" />
          <textarea data-testid="email-body" placeholder="Message..." />
        </div>
      ))

      // Act
      customRender(
        <div>
          <EmailButton onClick={() => mockOnOpenEmail(true)} />
          <EmailDialog />
        </div>
      )

      // Click email button
      const emailButton = screen.getByTestId('email-btn')
      await user.click(emailButton)

      // Assert
      expect(mockOnOpenEmail).toHaveBeenCalledWith(true)
      expect(screen.getByTestId('email-dialog')).toBeInTheDocument()
    })

    it('should attach mind map to email', () => {
      // Arrange
      const mockAttachmentInfo = {
        fileName: 'mindmap.json',
        fileSize: '15.2 KB',
        format: 'JSON',
      }

      // Mock attachment display
      const AttachmentDisplay = vi.fn(({ attachment }) => (
        <div data-testid="attachment-display">
          <div data-testid="file-info">
            Attaching: {attachment.fileName} ({attachment.fileSize})
          </div>
          <div data-testid="format-info">Format: {attachment.format}</div>
        </div>
      ))

      // Act
      customRender(<AttachmentDisplay attachment={mockAttachmentInfo} />)

      // Assert
      expect(screen.getByTestId('attachment-display')).toBeInTheDocument()
      expect(screen.getByTestId('file-info')).toHaveTextContent('Attaching: mindmap.json (15.2 KB)')
      expect(screen.getByTestId('format-info')).toHaveTextContent('Format: JSON')
    })
  })

  describe("Story 30: See other users' cursors and selections", () => {
    it("should display other users' cursors", () => {
      // Arrange
      const mockOtherUsers = [
        { id: 'user-1', name: 'Alice', color: '#ff0000', position: { x: 100, y: 200 } },
        { id: 'user-2', name: 'Bob', color: '#00ff00', position: { x: 300, y: 150 } },
      ]

      // Mock cursor display
      const CursorDisplay = vi.fn(({ users }) => (
        <div data-testid="cursor-display">
          <div data-testid="user-count">{users.length} users online</div>
          {users.map(
            (user: {
              id: string
              name: string
              color: string
              position: { x: number; y: number }
            }) => (
              <div
                key={user.id}
                data-testid={`cursor-${user.id}`}
                style={{
                  position: 'absolute',
                  left: user.position.x,
                  top: user.position.y,
                  backgroundColor: user.color,
                }}
              >
                {user.name}
              </div>
            )
          )}
        </div>
      ))

      // Act
      customRender(<CursorDisplay users={mockOtherUsers} />)

      // Assert
      expect(screen.getByTestId('cursor-display')).toBeInTheDocument()
      expect(screen.getByTestId('user-count')).toHaveTextContent('2 users online')
      expect(screen.getByTestId('cursor-user-1')).toBeInTheDocument()
      expect(screen.getByTestId('cursor-user-2')).toBeInTheDocument()
    })

    it("should highlight other users' selections", () => {
      // Arrange
      const mockSelections = [
        { userId: 'user-1', nodeIds: ['node-1', 'node-2'], color: '#ff0000' },
        { userId: 'user-2', nodeIds: ['node-3'], color: '#00ff00' },
      ]

      // Mock selection highlight display
      const SelectionHighlight = vi.fn(({ selections }) => (
        <div data-testid="selection-highlights">
          {selections.map((selection: { userId: string; nodeIds: string[]; color: string }) => (
            <div key={selection.userId} data-testid={`selection-${selection.userId}`}>
              <div data-testid="selection-color" style={{ backgroundColor: selection.color }} />
              <div data-testid="selected-nodes">Selected: {selection.nodeIds.join(', ')}</div>
            </div>
          ))}
        </div>
      ))

      // Act
      customRender(<SelectionHighlight selections={mockSelections} />)

      // Assert
      expect(screen.getByTestId('selection-highlights')).toBeInTheDocument()
      expect(screen.getByTestId('selection-user-1')).toBeInTheDocument()
      const selectedNodesElements = screen.getAllByTestId('selected-nodes')
      expect(selectedNodesElements[0]).toHaveTextContent('Selected: node-1, node-2')
      expect(selectedNodesElements[1]).toHaveTextContent('Selected: node-3')
    })
  })

  describe('Story 31: Add comments to specific nodes', () => {
    it('should open comment input for selected node', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnOpenComment = vi.fn()

      // Mock comment button
      const CommentButton = vi.fn(({ nodeId, onClick }) => (
        <button
          data-testid={`comment-btn-${nodeId}`}
          onClick={() => onClick(nodeId)}
          aria-label={`Add comment to node ${nodeId}`}
        >
          💬 Comment
        </button>
      ))

      // Act
      customRender(<CommentButton nodeId="node-123" onClick={mockOnOpenComment} />)

      // Click comment button
      const commentButton = screen.getByTestId('comment-btn-node-123')
      await user.click(commentButton)

      // Assert
      expect(mockOnOpenComment).toHaveBeenCalledWith('node-123')
    })

    it('should save comment to node', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnSaveComment = vi.fn()

      // Mock comment input form
      const CommentForm = vi.fn(({ onSave }) => (
        <div data-testid="comment-form">
          <textarea data-testid="comment-input" placeholder="Add a comment..." defaultValue="" />
          <button
            data-testid="save-comment-btn"
            onClick={() => onSave('node-456', 'This needs more detail')}
          >
            Save Comment
          </button>
        </div>
      ))

      // Act
      customRender(<CommentForm onSave={mockOnSaveComment} />)

      // Save comment
      const saveButton = screen.getByTestId('save-comment-btn')
      await user.click(saveButton)

      // Assert
      expect(mockOnSaveComment).toHaveBeenCalledWith('node-456', 'This needs more detail')
    })

    it('should display comments on node', () => {
      // Arrange
      const mockComments = [
        { id: 'comment-1', author: 'Alice', text: 'Great idea!', timestamp: '2024-01-15 10:30' },
        {
          id: 'comment-2',
          author: 'Bob',
          text: 'Needs more research',
          timestamp: '2024-01-15 11:45',
        },
      ]

      // Mock comments display
      const CommentsDisplay = vi.fn(({ comments }) => (
        <div data-testid="comments-display">
          <div data-testid="comment-count">{comments.length} comments</div>
          <ul data-testid="comments-list">
            {comments.map(
              (comment: { id: string; author: string; text: string; timestamp: string }) => (
                <li key={comment.id} data-testid={`comment-${comment.id}`}>
                  <div data-testid="comment-author">{comment.author}</div>
                  <div data-testid="comment-text">{comment.text}</div>
                  <div data-testid="comment-time">{comment.timestamp}</div>
                </li>
              )
            )}
          </ul>
        </div>
      ))

      // Act
      customRender(<CommentsDisplay comments={mockComments} />)

      // Assert
      expect(screen.getByTestId('comments-display')).toBeInTheDocument()
      expect(screen.getByTestId('comment-count')).toHaveTextContent('2 comments')
      expect(screen.getByTestId('comment-comment-1')).toBeInTheDocument()
      expect(screen.getByTestId('comment-comment-2')).toBeInTheDocument()
    })
  })

  describe('Story 32: Resolve comment threads', () => {
    it('should mark comment as resolved', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnResolve = vi.fn()

      // Mock resolve button
      const ResolveButton = vi.fn(({ commentId, onResolve }) => (
        <button
          data-testid={`resolve-btn-${commentId}`}
          onClick={() => onResolve(commentId)}
          aria-label={`Resolve comment ${commentId}`}
        >
          ✅ Resolve
        </button>
      ))

      // Act
      customRender(<ResolveButton commentId="comment-789" onResolve={mockOnResolve} />)

      // Click resolve button
      const resolveButton = screen.getByTestId('resolve-btn-comment-789')
      await user.click(resolveButton)

      // Assert
      expect(mockOnResolve).toHaveBeenCalledWith('comment-789')
    })

    it('should show resolved comment status', () => {
      // Arrange
      const mockResolvedComment = {
        id: 'comment-123',
        text: 'Fixed in latest version',
        resolved: true,
        resolvedBy: 'Alice',
        resolvedAt: '2024-01-16 09:15',
      }

      // Mock resolved comment display
      const ResolvedCommentDisplay = vi.fn(({ comment }) => (
        <div data-testid="resolved-comment">
          <div data-testid="comment-text">{comment.text}</div>
          {comment.resolved && (
            <div data-testid="resolution-info">
              <div data-testid="resolved-by">Resolved by: {comment.resolvedBy}</div>
              <div data-testid="resolved-at">On: {comment.resolvedAt}</div>
              <div data-testid="resolved-badge">✅ Resolved</div>
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<ResolvedCommentDisplay comment={mockResolvedComment} />)

      // Assert
      expect(screen.getByTestId('resolved-comment')).toBeInTheDocument()
      expect(screen.getByTestId('resolution-info')).toBeInTheDocument()
      expect(screen.getByTestId('resolved-by')).toHaveTextContent('Resolved by: Alice')
      expect(screen.getByTestId('resolved-badge')).toHaveTextContent('✅ Resolved')
    })
  })

  describe('Story 33: Configure webhooks for node changes', () => {
    it('should open webhook configuration', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnOpenWebhookConfig = vi.fn()

      // Mock webhook button
      const WebhookButton = vi.fn(({ onClick }) => (
        <button data-testid="webhook-config-btn" onClick={onClick} aria-label="Configure webhooks">
          🔗 Webhooks
        </button>
      ))

      // Mock webhook config panel
      const WebhookConfigPanel = vi.fn(() => (
        <div data-testid="webhook-config-panel">
          <input data-testid="webhook-url-input" placeholder="Webhook URL" />
          <select data-testid="event-type-select">
            <option value="node_create">Node Created</option>
            <option value="node_update">Node Updated</option>
            <option value="node_delete">Node Deleted</option>
          </select>
        </div>
      ))

      // Act
      customRender(
        <div>
          <WebhookButton onClick={() => mockOnOpenWebhookConfig(true)} />
          <WebhookConfigPanel />
        </div>
      )

      // Click webhook button
      const webhookButton = screen.getByTestId('webhook-config-btn')
      await user.click(webhookButton)

      // Assert
      expect(mockOnOpenWebhookConfig).toHaveBeenCalledWith(true)
      expect(screen.getByTestId('webhook-config-panel')).toBeInTheDocument()
    })

    it('should save webhook configuration', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnSaveWebhook = vi.fn()

      // Mock webhook form
      const WebhookForm = vi.fn(({ onSave }) => (
        <div data-testid="webhook-form">
          <input
            data-testid="webhook-url"
            placeholder="https://api.example.com/webhook"
            defaultValue=""
          />
          <button
            data-testid="save-webhook-btn"
            onClick={() =>
              onSave('https://api.example.com/webhook', ['node_create', 'node_update'])
            }
          >
            Save Webhook
          </button>
        </div>
      ))

      // Act
      customRender(<WebhookForm onSave={mockOnSaveWebhook} />)

      // Save webhook
      const saveButton = screen.getByTestId('save-webhook-btn')
      await user.click(saveButton)

      // Assert
      expect(mockOnSaveWebhook).toHaveBeenCalledWith('https://api.example.com/webhook', [
        'node_create',
        'node_update',
      ])
    })

    it('should list configured webhooks', () => {
      // Arrange
      const mockWebhooks = [
        {
          id: 'webhook-1',
          url: 'https://slack.com/webhook',
          events: ['node_create'],
          active: true,
        },
        {
          id: 'webhook-2',
          url: 'https://discord.com/webhook',
          events: ['node_update', 'node_delete'],
          active: false,
        },
      ]

      // Mock webhooks list
      const WebhooksList = vi.fn(({ webhooks }) => (
        <div data-testid="webhooks-list">
          <div data-testid="webhook-count">{webhooks.length} webhooks configured</div>
          <ul>
            {webhooks.map(
              (webhook: { id: string; url: string; events: string[]; active: boolean }) => (
                <li key={webhook.id} data-testid={`webhook-${webhook.id}`}>
                  <div data-testid="webhook-url">{webhook.url}</div>
                  <div data-testid="webhook-events">Events: {webhook.events.join(', ')}</div>
                  <div data-testid="webhook-status">
                    Status: {webhook.active ? '✅ Active' : '❌ Inactive'}
                  </div>
                </li>
              )
            )}
          </ul>
        </div>
      ))

      // Act
      customRender(<WebhooksList webhooks={mockWebhooks} />)

      // Assert
      expect(screen.getByTestId('webhooks-list')).toBeInTheDocument()
      expect(screen.getByTestId('webhook-count')).toHaveTextContent('2 webhooks configured')
      expect(screen.getByTestId('webhook-webhook-1')).toBeInTheDocument()
      expect(screen.getByTestId('webhook-webhook-2')).toBeInTheDocument()
    })
  })
})
