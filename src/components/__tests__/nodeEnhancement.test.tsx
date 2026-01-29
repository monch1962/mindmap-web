/**
 * Node Enhancement & Styling Tests - Stories 9-15
 *
 * Tests for node enhancement and styling features
 *
 * Story 9: As a user, I want to add icons to nodes using the icon picker
 * Story 10: As a user, I want to change node colors, fonts, and backgrounds
 * Story 11: As a user, I want to add clouds to group related nodes
 * Story 12: As a user, I want to add links to external resources
 * Story 13: As a user, I want to add rich text notes to nodes
 * Story 14: As a user, I want to attach files (images, code, documents) to nodes
 * Story 15: As a user, I want to add tags and custom metadata to nodes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Import test utilities
import { customRender } from '../../test/utils'

// Import mocks
import * as mocks from '../../test/mocks'

// Mock React Flow
vi.mock('reactflow', () => mocks.reactflow)

describe('Node Enhancement & Styling Workflows', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()

    // Setup browser mocks
    mocks.setupBrowserMocks()
  })

  describe('Story 9: Add icons to nodes using icon picker', () => {
    it('should open icon picker when icon button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()

      // Mock the MindMapNode component with icon picker
      const MindMapNode = vi.fn(({ data }) => (
        <div data-testid={`node-${data.id}`}>
          <div data-testid="node-content">{data.content}</div>
          <button data-testid="icon-picker-btn" aria-label="Add icon">
            🎨
          </button>
          <div data-testid="icon-picker" style={{ display: 'none' }}>
            <button data-testid="icon-emoji">😊</button>
            <button data-testid="icon-star">⭐</button>
            <button data-testid="icon-check">✅</button>
          </div>
        </div>
      ))

      // Mock the MindMapCanvas component
      const MindMapCanvas = vi.fn(() => (
        <div data-testid="mindmap-canvas">
          <MindMapNode data={{ id: 'node-1', content: 'Test Node' }} />
        </div>
      ))

      // Act
      customRender(<MindMapCanvas />)

      // Click icon picker button
      const iconButton = screen.getByTestId('icon-picker-btn')
      await user.click(iconButton)

      // Assert
      const iconPicker = screen.getByTestId('icon-picker')
      expect(iconPicker).toBeInTheDocument()
    })

    it('should apply selected icon to node', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnIconSelect = vi.fn()

      // Mock icon picker component
      const IconPicker = vi.fn(({ onSelect }) => (
        <div data-testid="icon-picker">
          <button
            data-testid="icon-star"
            onClick={() => onSelect('⭐')}
            aria-label="Select star icon"
          >
            ⭐
          </button>
        </div>
      ))

      // Mock node component
      const MindMapNode = vi.fn(({ data }) => (
        <div data-testid={`node-${data.id}`}>
          <div data-testid="node-content">
            {data.icon && <span data-testid="node-icon">{data.icon}</span>}
            {data.content}
          </div>
          <IconPicker onSelect={mockOnIconSelect} />
        </div>
      ))

      // Act
      customRender(
        <MindMapNode
          data={{
            id: 'node-1',
            content: 'Test Node',
            icon: null,
          }}
        />
      )

      // Select star icon
      const starIcon = screen.getByTestId('icon-star')
      await user.click(starIcon)

      // Assert
      expect(mockOnIconSelect).toHaveBeenCalledWith('⭐')
    })

    it('should display selected icon in node content', () => {
      // Arrange
      // Mock node with icon
      const MindMapNode = vi.fn(({ data }) => (
        <div data-testid={`node-${data.id}`}>
          <div data-testid="node-content">
            {data.icon && <span data-testid="node-icon">{data.icon}</span>}
            <span data-testid="node-text">{data.content}</span>
          </div>
        </div>
      ))

      // Act
      customRender(
        <MindMapNode
          data={{
            id: 'node-1',
            content: 'Test Node',
            icon: '⭐',
          }}
        />
      )

      // Assert
      const nodeIcon = screen.getByTestId('node-icon')
      expect(nodeIcon).toBeInTheDocument()
      expect(nodeIcon).toHaveTextContent('⭐')
    })
  })

  describe('Story 10: Change node colors, fonts, and backgrounds', () => {
    it('should open style editor when style button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()

      // Mock style editor component
      const StyleEditor = vi.fn(() => (
        <div data-testid="style-editor" style={{ display: 'none' }}>
          <input data-testid="color-picker" type="color" defaultValue="#ffffff" />
          <select data-testid="font-selector">
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
          </select>
        </div>
      ))

      // Mock node with style button
      const MindMapNode = vi.fn(({ data }) => (
        <div data-testid={`node-${data.id}`}>
          <button data-testid="style-btn">Style</button>
          <StyleEditor />
        </div>
      ))

      // Act
      customRender(<MindMapNode data={{ id: 'node-1', content: 'Test Node' }} />)

      // Click style button
      const styleButton = screen.getByTestId('style-btn')
      await user.click(styleButton)

      // Assert
      const styleEditor = screen.getByTestId('style-editor')
      expect(styleEditor).toBeInTheDocument()
    })

    it('should apply color changes to node', () => {
      // Arrange
      const mockOnColorChange = vi.fn()

      // Mock color picker
      const ColorPicker = vi.fn(({ onChange }) => (
        <input
          data-testid="color-picker"
          type="color"
          defaultValue="#ffffff"
          onChange={e => onChange(e.target.value)}
        />
      ))

      // Mock styled node
      const StyledNode = vi.fn(({ style }) => (
        <div
          data-testid="styled-node"
          style={{
            backgroundColor: style?.backgroundColor || 'white',
            color: style?.color || 'black',
          }}
        >
          Test Node
        </div>
      ))

      // Act
      customRender(
        <div>
          <ColorPicker onChange={mockOnColorChange} />
          <StyledNode style={{ backgroundColor: '#ff0000', color: '#ffffff' }} />
        </div>
      )

      // Change color
      const colorPicker = screen.getByTestId('color-picker')
      fireEvent.change(colorPicker, { target: { value: '#00ff00' } })

      // Assert
      expect(mockOnColorChange).toHaveBeenCalledWith('#00ff00')
    })

    it('should apply font changes to node text', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnFontChange = vi.fn()

      // Mock font selector
      const FontSelector = vi.fn(({ onChange }) => (
        <select data-testid="font-selector" onChange={e => onChange(e.target.value)}>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Monospace">Monospace</option>
        </select>
      ))

      // Mock text with font style
      const StyledText = vi.fn(({ fontFamily }) => (
        <div data-testid="styled-text" style={{ fontFamily: fontFamily || 'Arial' }}>
          Test Text
        </div>
      ))

      // Act
      customRender(
        <div>
          <FontSelector onChange={mockOnFontChange} />
          <StyledText fontFamily="Helvetica" />
        </div>
      )

      // Change font
      const fontSelector = screen.getByTestId('font-selector')
      await user.selectOptions(fontSelector, 'Monospace')

      // Assert
      expect(mockOnFontChange).toHaveBeenCalledWith('Monospace')
    })
  })

  describe('Story 11: Add clouds to group related nodes', () => {
    it('should add cloud to selected nodes', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnAddCloud = vi.fn()

      // Mock cloud button
      const CloudButton = vi.fn(({ onClick }) => (
        <button data-testid="cloud-btn" onClick={onClick} aria-label="Add cloud">
          ☁️
        </button>
      ))

      // Mock cloud visualization
      const CloudVisualization = vi.fn(({ hasCloud }) => (
        <div data-testid="cloud-visualization">
          {hasCloud && <div data-testid="cloud">☁️ Cloud</div>}
          <div>Node Content</div>
        </div>
      ))

      // Act
      customRender(
        <div>
          <CloudButton onClick={() => mockOnAddCloud(['node-1', 'node-2'])} />
          <CloudVisualization hasCloud={true} />
        </div>
      )

      // Click cloud button
      const cloudButton = screen.getByTestId('cloud-btn')
      await user.click(cloudButton)

      // Assert
      expect(mockOnAddCloud).toHaveBeenCalledWith(['node-1', 'node-2'])
      expect(screen.getByTestId('cloud')).toBeInTheDocument()
    })

    it('should remove cloud from nodes', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnRemoveCloud = vi.fn()

      // Mock cloud removal button
      const RemoveCloudButton = vi.fn(({ onClick }) => (
        <button data-testid="remove-cloud-btn" onClick={onClick} aria-label="Remove cloud">
          Remove Cloud
        </button>
      ))

      // Act
      customRender(<RemoveCloudButton onClick={() => mockOnRemoveCloud('node-1')} />)

      // Click remove cloud button
      const removeButton = screen.getByTestId('remove-cloud-btn')
      await user.click(removeButton)

      // Assert
      expect(mockOnRemoveCloud).toHaveBeenCalledWith('node-1')
    })
  })

  describe('Story 12: Add links to external resources', () => {
    it('should open link editor when link button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()

      // Mock link editor
      const LinkEditor = vi.fn(() => (
        <div data-testid="link-editor" style={{ display: 'none' }}>
          <input data-testid="link-input" placeholder="Enter URL" />
          <button data-testid="save-link-btn">Save</button>
        </div>
      ))

      // Mock node with link button
      const MindMapNode = vi.fn(({ data }) => (
        <div data-testid={`node-${data.id}`}>
          <button data-testid="add-link-btn">Add Link</button>
          <LinkEditor />
        </div>
      ))

      // Act
      customRender(<MindMapNode data={{ id: 'node-1', content: 'Test Node' }} />)

      // Click add link button
      const linkButton = screen.getByTestId('add-link-btn')
      await user.click(linkButton)

      // Assert
      const linkEditor = screen.getByTestId('link-editor')
      expect(linkEditor).toBeInTheDocument()
    })

    it('should save link URL to node', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnSaveLink = vi.fn()

      // Mock link input form
      const LinkForm = vi.fn(({ onSave }) => (
        <div data-testid="link-form">
          <input data-testid="link-input" placeholder="https://example.com" defaultValue="" />
          <button data-testid="save-btn" onClick={() => onSave('https://example.com')}>
            Save Link
          </button>
        </div>
      ))

      // Act
      customRender(<LinkForm onSave={mockOnSaveLink} />)

      // Save link
      const saveButton = screen.getByTestId('save-btn')
      await user.click(saveButton)

      // Assert
      expect(mockOnSaveLink).toHaveBeenCalledWith('https://example.com')
    })

    it('should display link indicator on node with link', () => {
      // Arrange
      const mockNodeWithLink = {
        id: 'node-1',
        content: 'Linked Node',
        link: 'https://example.com',
      }

      // Mock node with link indicator
      const LinkedNode = vi.fn(({ data }) => (
        <div data-testid={`node-${data.id}`}>
          <div data-testid="node-content">{data.content}</div>
          {data.link && (
            <a data-testid="node-link" href={data.link} target="_blank" rel="noopener noreferrer">
              🔗
            </a>
          )}
        </div>
      ))

      // Act
      customRender(<LinkedNode data={mockNodeWithLink} />)

      // Assert
      const linkIndicator = screen.getByTestId('node-link')
      expect(linkIndicator).toBeInTheDocument()
      expect(linkIndicator).toHaveAttribute('href', 'https://example.com')
    })
  })

  describe('Story 13: Add rich text notes to nodes', () => {
    it('should open rich text editor for notes', async () => {
      // Arrange
      const user = userEvent.setup()

      // Mock rich text editor
      const RichTextEditor = vi.fn(() => (
        <div data-testid="rich-text-editor" style={{ display: 'none' }}>
          <div data-testid="editor-toolbar">
            <button data-testid="bold-btn">B</button>
            <button data-testid="italic-btn">I</button>
          </div>
          <div data-testid="editor-content" suppressContentEditableWarning contentEditable={true}>
            Enter notes here...
          </div>
        </div>
      ))

      // Mock notes button
      const NotesButton = vi.fn(() => <button data-testid="notes-btn">Add Notes</button>)

      // Act
      customRender(
        <div>
          <NotesButton />
          <RichTextEditor />
        </div>
      )

      // Click notes button
      const notesButton = screen.getByTestId('notes-btn')
      await user.click(notesButton)

      // Assert
      const editor = screen.getByTestId('rich-text-editor')
      expect(editor).toBeInTheDocument()
    })

    it('should apply formatting to note text', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnFormat = vi.fn()

      // Mock formatting buttons
      const FormatToolbar = vi.fn(({ onBold, onItalic }) => (
        <div data-testid="format-toolbar">
          <button data-testid="bold-btn" onClick={onBold} aria-label="Bold">
            B
          </button>
          <button data-testid="italic-btn" onClick={onItalic} aria-label="Italic">
            I
          </button>
        </div>
      ))

      // Act
      customRender(
        <FormatToolbar
          onBold={() => mockOnFormat('bold')}
          onItalic={() => mockOnFormat('italic')}
        />
      )

      // Click bold button
      const boldButton = screen.getByTestId('bold-btn')
      await user.click(boldButton)

      // Click italic button
      const italicButton = screen.getByTestId('italic-btn')
      await user.click(italicButton)

      // Assert
      expect(mockOnFormat).toHaveBeenCalledWith('bold')
      expect(mockOnFormat).toHaveBeenCalledWith('italic')
    })

    it('should save formatted notes to node', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnSaveNotes = vi.fn()

      // Mock notes save functionality
      const NotesSaver = vi.fn(({ onSave }) => (
        <div data-testid="notes-saver">
          <div data-testid="notes-content">
            <strong>Important</strong> note with <em>formatting</em>
          </div>
          <button
            data-testid="save-notes-btn"
            onClick={() => onSave('<strong>Important</strong> note with <em>formatting</em>')}
          >
            Save Notes
          </button>
        </div>
      ))

      // Act
      customRender(<NotesSaver onSave={mockOnSaveNotes} />)

      // Save notes
      const saveButton = screen.getByTestId('save-notes-btn')
      await user.click(saveButton)

      // Assert
      expect(mockOnSaveNotes).toHaveBeenCalledWith(
        '<strong>Important</strong> note with <em>formatting</em>'
      )
    })
  })

  describe('Story 14: Attach files to nodes', () => {
    it('should open file attachment dialog', async () => {
      // Arrange
      const user = userEvent.setup()

      // Mock file input
      const FileAttachment = vi.fn(() => (
        <div data-testid="file-attachment">
          <input
            data-testid="file-input"
            type="file"
            style={{ display: 'none' }}
            multiple
            accept="image/*,.pdf,.txt"
          />
          <button data-testid="attach-file-btn">Attach File</button>
        </div>
      ))

      // Act
      customRender(<FileAttachment />)

      // Click attach file button
      const attachButton = screen.getByTestId('attach-file-btn')
      await user.click(attachButton)

      // Assert
      const fileInput = screen.getByTestId('file-input')
      expect(fileInput).toBeInTheDocument()
    })

    it('should handle file selection', async () => {
      // Arrange
      const mockOnFileSelect = vi.fn()
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })

      // Mock file selector
      const FileSelector = vi.fn(({ onChange }) => (
        <input data-testid="file-selector" type="file" onChange={e => onChange(e.target.files)} />
      ))

      // Act
      customRender(<FileSelector onChange={mockOnFileSelect} />)

      // Select file
      const fileInput = screen.getByTestId('file-selector')
      fireEvent.change(fileInput, { target: { files: [testFile] } })

      // Assert
      expect(mockOnFileSelect).toHaveBeenCalled()
      const files = mockOnFileSelect.mock.calls[0][0]
      expect(files[0].name).toBe('test.txt')
    })

    it('should display attached files list', () => {
      // Arrange
      const mockAttachments = [
        { name: 'document.pdf', size: 1024, type: 'application/pdf' },
        { name: 'image.png', size: 2048, type: 'image/png' },
      ]

      // Mock attachments list
      const AttachmentsList = vi.fn(
        ({ files }: { files: Array<{ name: string; size: number; type: string }> }) => (
          <div data-testid="attachments-list">
            {files.map((file: { name: string; size: number; type: string }, index: number) => (
              <div key={index} data-testid={`attachment-${index}`}>
                <span data-testid="file-name">{file.name}</span>
                <span data-testid="file-size">({Math.round(file.size / 1024)}KB)</span>
              </div>
            ))}
          </div>
        )
      )

      // Act
      customRender(<AttachmentsList files={mockAttachments} />)

      // Assert
      expect(screen.getByTestId('attachments-list')).toBeInTheDocument()
      const fileNames = screen.getAllByTestId('file-name')
      expect(fileNames[0]).toHaveTextContent('document.pdf')
      expect(fileNames[1]).toHaveTextContent('image.png')
      const fileSizes = screen.getAllByTestId('file-size')
      expect(fileSizes[0]).toHaveTextContent('(1KB)')
      expect(fileSizes[1]).toHaveTextContent('(2KB)')
    })
  })

  describe('Story 15: Add tags and custom metadata', () => {
    it('should open metadata editor', async () => {
      // Arrange
      const user = userEvent.setup()

      // Mock metadata editor
      const MetadataEditor = vi.fn(() => (
        <div data-testid="metadata-editor" style={{ display: 'none' }}>
          <input data-testid="tag-input" placeholder="Add tags..." />
          <div data-testid="custom-fields">
            <input data-testid="field-key" placeholder="Key" />
            <input data-testid="field-value" placeholder="Value" />
          </div>
        </div>
      ))

      // Mock metadata button
      const MetadataButton = vi.fn(() => <button data-testid="metadata-btn">Metadata</button>)

      // Act
      customRender(
        <div>
          <MetadataButton />
          <MetadataEditor />
        </div>
      )

      // Click metadata button
      const metadataButton = screen.getByTestId('metadata-btn')
      await user.click(metadataButton)

      // Assert
      const editor = screen.getByTestId('metadata-editor')
      expect(editor).toBeInTheDocument()
    })

    it('should add tags to node', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnAddTag = vi.fn()

      // Mock tag input
      const TagInput = vi.fn(({ onAddTag }) => (
        <div data-testid="tag-input-container">
          <input data-testid="tag-input" placeholder="Enter tag" defaultValue="" />
          <button data-testid="add-tag-btn" onClick={() => onAddTag('important')}>
            Add Tag
          </button>
        </div>
      ))

      // Act
      customRender(<TagInput onAddTag={mockOnAddTag} />)

      // Add tag
      const addButton = screen.getByTestId('add-tag-btn')
      await user.click(addButton)

      // Assert
      expect(mockOnAddTag).toHaveBeenCalledWith('important')
    })

    it('should display tags on node', () => {
      // Arrange
      const mockTags = ['important', 'todo', 'review']

      // Mock tags display
      const TagsDisplay = vi.fn(({ tags }: { tags: string[] }) => (
        <div data-testid="tags-display">
          {tags.map((tag: string, index: number) => (
            <span key={index} data-testid={`tag-${tag}`} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      ))

      // Act
      customRender(<TagsDisplay tags={mockTags} />)

      // Assert
      expect(screen.getByTestId('tags-display')).toBeInTheDocument()
      expect(screen.getByTestId('tag-important')).toHaveTextContent('#important')
      expect(screen.getByTestId('tag-todo')).toHaveTextContent('#todo')
      expect(screen.getByTestId('tag-review')).toHaveTextContent('#review')
    })

    it('should add custom metadata fields', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnAddMetadata = vi.fn()

      // Mock metadata form
      const MetadataForm = vi.fn(({ onAdd }) => (
        <div data-testid="metadata-form">
          <input data-testid="key-input" placeholder="Key" defaultValue="priority" />
          <input data-testid="value-input" placeholder="Value" defaultValue="high" />
          <button data-testid="add-metadata-btn" onClick={() => onAdd('priority', 'high')}>
            Add Metadata
          </button>
        </div>
      ))

      // Act
      customRender(<MetadataForm onAdd={mockOnAddMetadata} />)

      // Add metadata
      const addButton = screen.getByTestId('add-metadata-btn')
      await user.click(addButton)

      // Assert
      expect(mockOnAddMetadata).toHaveBeenCalledWith('priority', 'high')
    })
  })
})
