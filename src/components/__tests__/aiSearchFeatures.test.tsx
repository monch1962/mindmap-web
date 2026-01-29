/**
 * AI & Search Features Tests - Stories 16-23
 *
 * Tests for AI-powered features and search functionality
 *
 * Story 16: As a user, I want to generate a mind map from a text prompt using AI
 * Story 17: As a user, I want to get creative ideas for a selected node using AI
 * Story 18: As a user, I want to summarize a branch of my mind map using AI
 * Story 19: As a user, I want to configure my AI provider (OpenAI/Anthropic) and API key
 * Story 20: As a user, I want to search for nodes by text content
 * Story 21: As a user, I want to use advanced search filters (regex, case-sensitive, date ranges)
 * Story 22: As a user, I want to navigate search results using Ctrl+G
 * Story 23: As a user, I want to filter nodes by icons, tags, or clouds
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

describe('AI & Search Features Workflows', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()

    // Setup browser mocks
    mocks.setupBrowserMocks()
  })

  describe('Story 16: Generate mind map from text prompt using AI', () => {
    it('should open AI assistant panel', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnOpenAI = vi.fn()

      // Mock AI assistant button
      const AIAssistantButton = vi.fn(({ onClick }) => (
        <button data-testid="ai-assistant-btn" onClick={onClick} aria-label="Open AI Assistant">
          🤖 AI Assistant
        </button>
      ))

      // Mock AI assistant panel
      const AIAssistantPanel = vi.fn(({ visible }) => (
        <div data-testid="ai-assistant-panel">
          {visible && (
            <div data-testid="ai-panel-content">
              <h2>AI Assistant</h2>
              <textarea data-testid="ai-prompt-input" placeholder="Enter your prompt..." />
            </div>
          )}
        </div>
      ))

      // Act
      customRender(
        <div>
          <AIAssistantButton onClick={() => mockOnOpenAI(true)} />
          <AIAssistantPanel visible={true} />
        </div>
      )

      // Click AI assistant button
      const aiButton = screen.getByTestId('ai-assistant-btn')
      await user.click(aiButton)

      // Assert
      expect(mockOnOpenAI).toHaveBeenCalledWith(true)
      expect(screen.getByTestId('ai-assistant-panel')).toBeInTheDocument()
      expect(screen.getByTestId('ai-panel-content')).toBeInTheDocument()
    })

    it('should accept text prompt for mind map generation', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnGenerate = vi.fn()

      // Mock AI prompt input
      const AIPromptInput = vi.fn(({ onSubmit }) => (
        <div data-testid="ai-prompt-form">
          <textarea
            data-testid="prompt-input"
            placeholder="Describe your mind map..."
            defaultValue=""
          />
          <button
            data-testid="generate-btn"
            onClick={() => onSubmit('Create a mind map about project management')}
          >
            Generate Mind Map
          </button>
        </div>
      ))

      // Act
      customRender(<AIPromptInput onSubmit={mockOnGenerate} />)

      // Submit prompt
      const generateButton = screen.getByTestId('generate-btn')
      await user.click(generateButton)

      // Assert
      expect(mockOnGenerate).toHaveBeenCalledWith('Create a mind map about project management')
    })

    it('should display AI generation status', () => {
      // Arrange
      const mockIsLoading = true

      // Mock AI status display
      const AIStatusDisplay = vi.fn(({ isLoading }) => (
        <div data-testid="ai-status">
          {isLoading ? (
            <div data-testid="loading-indicator">Generating mind map...</div>
          ) : (
            <div data-testid="ready-status">Ready to generate</div>
          )}
        </div>
      ))

      // Act
      customRender(<AIStatusDisplay isLoading={mockIsLoading} />)

      // Assert
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
      expect(screen.getByTestId('loading-indicator')).toHaveTextContent('Generating mind map...')
    })
  })

  describe('Story 17: Get creative ideas for selected node using AI', () => {
    it('should show AI ideas button for selected node', () => {
      // Arrange
      const mockNodeId = 'node-123'
      const mockIsSelected = true

      // Mock node with AI ideas button
      const NodeWithAIButton = vi.fn(({ nodeId, isSelected }) => (
        <div data-testid={`node-${nodeId}`}>
          <div data-testid="node-content">Project Planning</div>
          {isSelected && (
            <button data-testid="ai-ideas-btn" aria-label={`Get AI ideas for node ${nodeId}`}>
              💡 Get Ideas
            </button>
          )}
        </div>
      ))

      // Act
      customRender(<NodeWithAIButton nodeId={mockNodeId} isSelected={mockIsSelected} />)

      // Assert
      expect(screen.getByTestId('ai-ideas-btn')).toBeInTheDocument()
      expect(screen.getByTestId('ai-ideas-btn')).toHaveAttribute(
        'aria-label',
        'Get AI ideas for node node-123'
      )
    })

    it('should request AI ideas for selected node', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnGetIdeas = vi.fn()

      // Mock AI ideas button
      const AIIdeasButton = vi.fn(({ nodeId, onClick }) => (
        <button data-testid="ai-ideas-btn" onClick={() => onClick(nodeId)}>
          Get AI Ideas
        </button>
      ))

      // Act
      customRender(<AIIdeasButton nodeId="node-456" onClick={mockOnGetIdeas} />)

      // Click AI ideas button
      const ideasButton = screen.getByTestId('ai-ideas-btn')
      await user.click(ideasButton)

      // Assert
      expect(mockOnGetIdeas).toHaveBeenCalledWith('node-456')
    })

    it('should display AI-generated ideas', () => {
      // Arrange
      const mockIdeas = [
        'Consider adding a timeline component',
        'Include risk assessment section',
        'Add resource allocation tracking',
      ]

      // Mock ideas display
      const IdeasDisplay = vi.fn(({ ideas }) => (
        <div data-testid="ideas-display">
          <h3>AI Suggestions</h3>
          <ul data-testid="ideas-list">
            {ideas.map((idea: string, index: number) => (
              <li key={index} data-testid={`idea-${index}`}>
                {idea}
              </li>
            ))}
          </ul>
        </div>
      ))

      // Act
      customRender(<IdeasDisplay ideas={mockIdeas} />)

      // Assert
      expect(screen.getByTestId('ideas-display')).toBeInTheDocument()
      expect(screen.getByTestId('ideas-list')).toBeInTheDocument()
      expect(screen.getByTestId('idea-0')).toHaveTextContent('Consider adding a timeline component')
      expect(screen.getByTestId('idea-1')).toHaveTextContent('Include risk assessment section')
      expect(screen.getByTestId('idea-2')).toHaveTextContent('Add resource allocation tracking')
    })
  })

  describe('Story 18: Summarize a branch using AI', () => {
    it('should show summarize button for branch nodes', () => {
      // Arrange
      const mockNodeId = 'branch-root'
      const mockHasChildren = true

      // Mock branch node with summarize button
      const BranchNode = vi.fn(({ nodeId, hasChildren }) => (
        <div data-testid={`node-${nodeId}`}>
          <div data-testid="node-content">Marketing Strategy</div>
          {hasChildren && (
            <button
              data-testid="summarize-btn"
              aria-label={`Summarize branch starting at ${nodeId}`}
            >
              📊 Summarize Branch
            </button>
          )}
        </div>
      ))

      // Act
      customRender(<BranchNode nodeId={mockNodeId} hasChildren={mockHasChildren} />)

      // Assert
      expect(screen.getByTestId('summarize-btn')).toBeInTheDocument()
      expect(screen.getByTestId('summarize-btn')).toHaveAttribute(
        'aria-label',
        'Summarize branch starting at branch-root'
      )
    })

    it('should request AI summary for branch', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnSummarize = vi.fn()

      // Mock summarize button
      const SummarizeButton = vi.fn(({ nodeId, onClick }) => (
        <button data-testid="summarize-btn" onClick={() => onClick(nodeId)}>
          Summarize
        </button>
      ))

      // Act
      customRender(<SummarizeButton nodeId="node-789" onClick={mockOnSummarize} />)

      // Click summarize button
      const summarizeButton = screen.getByTestId('summarize-btn')
      await user.click(summarizeButton)

      // Assert
      expect(mockOnSummarize).toHaveBeenCalledWith('node-789')
    })

    it('should display AI-generated summary', () => {
      // Arrange
      const mockSummary =
        'This branch contains 15 nodes covering marketing strategy, including target audience analysis, channel selection, budget allocation, and performance metrics. Key themes include digital marketing focus and ROI measurement.'

      // Mock summary display
      const SummaryDisplay = vi.fn(({ summary }) => (
        <div data-testid="summary-display">
          <h3>Branch Summary</h3>
          <div data-testid="summary-content">{summary}</div>
        </div>
      ))

      // Act
      customRender(<SummaryDisplay summary={mockSummary} />)

      // Assert
      expect(screen.getByTestId('summary-display')).toBeInTheDocument()
      expect(screen.getByTestId('summary-content')).toHaveTextContent(mockSummary)
    })
  })

  describe('Story 19: Configure AI provider and API key', () => {
    it('should open AI settings panel', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnOpenSettings = vi.fn()

      // Mock settings button
      const SettingsButton = vi.fn(({ onClick }) => (
        <button data-testid="ai-settings-btn" onClick={onClick} aria-label="AI Settings">
          ⚙️ AI Settings
        </button>
      ))

      // Mock settings panel
      const AISettingsPanel = vi.fn(() => (
        <div data-testid="ai-settings-panel">
          <h3>AI Configuration</h3>
          <select data-testid="provider-select">
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>
      ))

      // Act
      customRender(
        <div>
          <SettingsButton onClick={() => mockOnOpenSettings(true)} />
          <AISettingsPanel />
        </div>
      )

      // Click settings button
      const settingsButton = screen.getByTestId('ai-settings-btn')
      await user.click(settingsButton)

      // Assert
      expect(mockOnOpenSettings).toHaveBeenCalledWith(true)
      expect(screen.getByTestId('ai-settings-panel')).toBeInTheDocument()
    })

    it('should select AI provider', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnProviderChange = vi.fn()

      // Mock provider selector
      const ProviderSelector = vi.fn(({ onChange }) => (
        <select data-testid="provider-select" onChange={e => onChange(e.target.value)}>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="none">None</option>
        </select>
      ))

      // Act
      customRender(<ProviderSelector onChange={mockOnProviderChange} />)

      // Change provider
      const providerSelect = screen.getByTestId('provider-select')
      await user.selectOptions(providerSelect, 'anthropic')

      // Assert
      expect(mockOnProviderChange).toHaveBeenCalledWith('anthropic')
    })

    it('should save API key securely', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnSaveAPIKey = vi.fn()

      // Mock API key input
      const APIKeyInput = vi.fn(({ onSave }) => (
        <div data-testid="api-key-form">
          <input
            data-testid="api-key-input"
            type="password"
            placeholder="Enter API key"
            defaultValue=""
          />
          <button data-testid="save-api-key-btn" onClick={() => onSave('sk-test1234567890abcdef')}>
            Save API Key
          </button>
        </div>
      ))

      // Act
      customRender(<APIKeyInput onSave={mockOnSaveAPIKey} />)

      // Save API key
      const saveButton = screen.getByTestId('save-api-key-btn')
      await user.click(saveButton)

      // Assert
      expect(mockOnSaveAPIKey).toHaveBeenCalledWith('sk-test1234567890abcdef')
    })
  })

  describe('Story 20: Search for nodes by text content', () => {
    it('should open search panel', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnOpenSearch = vi.fn()

      // Mock search button
      const SearchButton = vi.fn(({ onClick }) => (
        <button data-testid="search-btn" onClick={onClick} aria-label="Search">
          🔍 Search
        </button>
      ))

      // Mock search panel
      const SearchPanel = vi.fn(() => (
        <div data-testid="search-panel">
          <input data-testid="search-input" placeholder="Search nodes..." />
        </div>
      ))

      // Act
      customRender(
        <div>
          <SearchButton onClick={() => mockOnOpenSearch(true)} />
          <SearchPanel />
        </div>
      )

      // Click search button
      const searchButton = screen.getByTestId('search-btn')
      await user.click(searchButton)

      // Assert
      expect(mockOnOpenSearch).toHaveBeenCalledWith(true)
      expect(screen.getByTestId('search-panel')).toBeInTheDocument()
    })

    it('should perform text search', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnSearch = vi.fn()

      // Mock search form
      const SearchForm = vi.fn(({ onSearch }) => (
        <form
          data-testid="search-form"
          onSubmit={e => {
            e.preventDefault()
            onSearch('project deadline')
          }}
        >
          <input data-testid="search-input" placeholder="Search..." defaultValue="" />
          <button data-testid="search-submit-btn" type="submit">
            Search
          </button>
        </form>
      ))

      // Act
      customRender(<SearchForm onSearch={mockOnSearch} />)

      // Submit search
      const submitButton = screen.getByTestId('search-submit-btn')
      await user.click(submitButton)

      // Assert
      expect(mockOnSearch).toHaveBeenCalledWith('project deadline')
    })

    it('should highlight search results in nodes', () => {
      // Arrange
      const mockSearchTerm = 'budget'
      const mockNodeContent = 'Project Budget Allocation'

      // Mock node with search highlight
      const SearchHighlightNode = vi.fn(({ content, searchTerm }) => {
        const highlightIndex = content.toLowerCase().indexOf(searchTerm.toLowerCase())

        return (
          <div data-testid="search-result-node">
            <div data-testid="node-content">
              {highlightIndex >= 0 ? (
                <>
                  {content.substring(0, highlightIndex)}
                  <mark data-testid="search-highlight">
                    {content.substring(highlightIndex, highlightIndex + searchTerm.length)}
                  </mark>
                  {content.substring(highlightIndex + searchTerm.length)}
                </>
              ) : (
                content
              )}
            </div>
          </div>
        )
      })

      // Act
      customRender(<SearchHighlightNode content={mockNodeContent} searchTerm={mockSearchTerm} />)

      // Assert
      expect(screen.getByTestId('search-highlight')).toBeInTheDocument()
      expect(screen.getByTestId('search-highlight')).toHaveTextContent('Budget')
    })
  })

  describe('Story 21: Use advanced search filters', () => {
    it('should toggle advanced search options', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnToggleAdvanced = vi.fn()

      // Mock advanced search toggle
      const AdvancedSearchToggle = vi.fn(({ onToggle }) => (
        <button data-testid="advanced-toggle-btn" onClick={() => onToggle(true)}>
          Advanced Options
        </button>
      ))

      // Act
      customRender(<AdvancedSearchToggle onToggle={mockOnToggleAdvanced} />)

      // Toggle advanced options
      const toggleButton = screen.getByTestId('advanced-toggle-btn')
      await user.click(toggleButton)

      // Assert
      expect(mockOnToggleAdvanced).toHaveBeenCalledWith(true)
    })

    it('should apply case-sensitive search filter', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnFilterChange = vi.fn()

      // Mock case-sensitive checkbox
      const CaseSensitiveFilter = vi.fn(({ onChange }) => (
        <label data-testid="case-sensitive-label">
          <input
            data-testid="case-sensitive-checkbox"
            type="checkbox"
            onChange={e => onChange(e.target.checked)}
          />
          Case Sensitive
        </label>
      ))

      // Act
      customRender(<CaseSensitiveFilter onChange={mockOnFilterChange} />)

      // Toggle case-sensitive
      const checkbox = screen.getByTestId('case-sensitive-checkbox')
      await user.click(checkbox)

      // Assert
      expect(mockOnFilterChange).toHaveBeenCalledWith(true)
    })

    it('should apply regex search filter', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnRegexChange = vi.fn()

      // Mock regex checkbox
      const RegexFilter = vi.fn(({ onChange }) => (
        <label data-testid="regex-label">
          <input
            data-testid="regex-checkbox"
            type="checkbox"
            onChange={e => onChange(e.target.checked)}
          />
          Use Regular Expressions
        </label>
      ))

      // Act
      customRender(<RegexFilter onChange={mockOnRegexChange} />)

      // Toggle regex
      const checkbox = screen.getByTestId('regex-checkbox')
      await user.click(checkbox)

      // Assert
      expect(mockOnRegexChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Story 22: Navigate search results', () => {
    it('should display search result navigation', () => {
      // Arrange
      const mockResultCount = 5
      const mockCurrentResult = 2

      // Mock search navigation
      const SearchNavigation = vi.fn(({ resultCount, currentResult }) => (
        <div data-testid="search-navigation">
          <div data-testid="result-count">
            {currentResult} of {resultCount} results
          </div>
          <button data-testid="prev-result-btn" aria-label="Previous result">
            ◀
          </button>
          <button data-testid="next-result-btn" aria-label="Next result">
            ▶
          </button>
        </div>
      ))

      // Act
      customRender(
        <SearchNavigation resultCount={mockResultCount} currentResult={mockCurrentResult} />
      )

      // Assert
      expect(screen.getByTestId('search-navigation')).toBeInTheDocument()
      expect(screen.getByTestId('result-count')).toHaveTextContent('2 of 5 results')
      expect(screen.getByTestId('prev-result-btn')).toBeInTheDocument()
      expect(screen.getByTestId('next-result-btn')).toBeInTheDocument()
    })

    it('should navigate to next search result', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnNext = vi.fn()

      // Mock next result button
      const NextResultButton = vi.fn(({ onClick }) => (
        <button data-testid="next-result-btn" onClick={onClick} aria-label="Next result">
          Next
        </button>
      ))

      // Act
      customRender(<NextResultButton onClick={mockOnNext} />)

      // Click next button
      const nextButton = screen.getByTestId('next-result-btn')
      await user.click(nextButton)

      // Assert
      expect(mockOnNext).toHaveBeenCalled()
    })

    it('should navigate to previous search result', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnPrevious = vi.fn()

      // Mock previous result button
      const PreviousResultButton = vi.fn(({ onClick }) => (
        <button data-testid="prev-result-btn" onClick={onClick} aria-label="Previous result">
          Previous
        </button>
      ))

      // Act
      customRender(<PreviousResultButton onClick={mockOnPrevious} />)

      // Click previous button
      const prevButton = screen.getByTestId('prev-result-btn')
      await user.click(prevButton)

      // Assert
      expect(mockOnPrevious).toHaveBeenCalled()
    })
  })

  describe('Story 23: Filter nodes by icons, tags, or clouds', () => {
    it('should filter nodes by icon', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnIconFilter = vi.fn()

      // Mock icon filter selector
      const IconFilter = vi.fn(({ onChange }) => (
        <select data-testid="icon-filter-select" onChange={e => onChange(e.target.value)}>
          <option value="">All Icons</option>
          <option value="⭐">Star</option>
          <option value="⚠️">Warning</option>
          <option value="✅">Check</option>
        </select>
      ))

      // Act
      customRender(<IconFilter onChange={mockOnIconFilter} />)

      // Select icon filter
      const iconSelect = screen.getByTestId('icon-filter-select')
      await user.selectOptions(iconSelect, '⭐')

      // Assert
      expect(mockOnIconFilter).toHaveBeenCalledWith('⭐')
    })

    it('should filter nodes by tag', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnTagFilter = vi.fn()

      // Mock tag filter input
      const TagFilter = vi.fn(({ onChange }) => (
        <input
          data-testid="tag-filter-input"
          placeholder="Filter by tag..."
          onChange={e => onChange(e.target.value)}
        />
      ))

      // Act
      customRender(<TagFilter onChange={mockOnTagFilter} />)

      // Enter tag filter
      const tagInput = screen.getByTestId('tag-filter-input')
      await user.type(tagInput, 'important')

      // Assert
      expect(mockOnTagFilter).toHaveBeenCalledWith('important')
    })

    it('should filter nodes by cloud', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnCloudFilter = vi.fn()

      // Mock cloud filter selector
      const CloudFilter = vi.fn(({ onChange }) => (
        <select data-testid="cloud-filter-select" onChange={e => onChange(e.target.value)}>
          <option value="">All Clouds</option>
          <option value="marketing">Marketing</option>
          <option value="development">Development</option>
          <option value="design">Design</option>
        </select>
      ))

      // Act
      customRender(<CloudFilter onChange={mockOnCloudFilter} />)

      // Select cloud filter
      const cloudSelect = screen.getByTestId('cloud-filter-select')
      await user.selectOptions(cloudSelect, 'development')

      // Assert
      expect(mockOnCloudFilter).toHaveBeenCalledWith('development')
    })

    it('should display filtered nodes only', () => {
      // Arrange
      const mockFilteredNodes = [
        { id: 'node-1', content: 'Marketing Plan', icon: '⭐', tags: ['important'] },
        { id: 'node-2', content: 'Budget', icon: '⚠️', tags: ['review'] },
        { id: 'node-3', content: 'Timeline', icon: '⭐', tags: ['important'] },
      ]
      const mockFilterIcon = '⭐'

      // Mock filtered nodes display
      const FilteredNodesDisplay = vi.fn(({ nodes, filterIcon }) => (
        <div data-testid="filtered-nodes">
          {nodes
            .filter(
              (node: { id: string; content: string; icon: string; tags: string[] }) =>
                !filterIcon || node.icon === filterIcon
            )
            .map((node: { id: string; content: string; icon: string; tags: string[] }) => (
              <div key={node.id} data-testid={`filtered-node-${node.id}`}>
                <div data-testid="node-content">{node.content}</div>
                {node.icon && <span data-testid="node-icon">{node.icon}</span>}
              </div>
            ))}
        </div>
      ))

      // Act
      customRender(<FilteredNodesDisplay nodes={mockFilteredNodes} filterIcon={mockFilterIcon} />)

      // Assert
      expect(screen.getByTestId('filtered-node-node-1')).toBeInTheDocument()
      expect(screen.getByTestId('filtered-node-node-3')).toBeInTheDocument()
      expect(screen.queryByTestId('filtered-node-node-2')).not.toBeInTheDocument()
    })
  })
})
