import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AIAssistantPanel from '../AIAssistantPanel'

describe('AIAssistantPanel', () => {
  const mockOnClose = vi.fn()
  const mockOnGenerateMindMap = vi.fn()
  const mockOnSuggestIdeas = vi.fn()
  const mockOnSummarizeBranch = vi.fn()

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onGenerateMindMap: mockOnGenerateMindMap,
    onSuggestIdeas: mockOnSuggestIdeas,
    onSummarizeBranch: mockOnSummarizeBranch,
    selectedNodeId: 'node-123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('when rendered', () => {
    it('should render the AI assistant panel when visible is true', () => {
      render(<AIAssistantPanel {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      expect(screen.getByLabelText('Select AI provider')).toBeInTheDocument()
    })

    it('should not render when visible is false', () => {
      const props = { ...defaultProps, visible: false }
      const { container } = render(<AIAssistantPanel {...props} />)

      expect(container.firstChild).toBeNull()
    })

    it('should have proper ARIA attributes', () => {
      render(<AIAssistantPanel {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-label', 'AI Assistant panel')
    })
  })

  describe('when configuring AI provider', () => {
    it('should show provider selection dropdown', () => {
      render(<AIAssistantPanel {...defaultProps} />)

      expect(screen.getByLabelText('Select AI provider')).toBeInTheDocument()
      expect(screen.getByText('Select Provider...')).toBeInTheDocument()
      expect(screen.getByText('OpenAI (GPT-4)')).toBeInTheDocument()
      expect(screen.getByText('Anthropic (Claude)')).toBeInTheDocument()
    })

    it('should show API key input when provider is selected', () => {
      render(<AIAssistantPanel {...defaultProps} />)

      const providerSelect = screen.getByLabelText('Select AI provider')
      fireEvent.change(providerSelect, { target: { value: 'openai' } })

      expect(
        screen.getByLabelText('Enter your API key for the selected AI provider')
      ).toBeInTheDocument()
      expect(screen.getByText('API Key')).toBeInTheDocument()
    })

    it('should save API key and provider to localStorage', () => {
      render(<AIAssistantPanel {...defaultProps} />)

      const providerSelect = screen.getByLabelText('Select AI provider')
      fireEvent.change(providerSelect, { target: { value: 'openai' } })

      const apiKeyInput = screen.getByLabelText('Enter your API key for the selected AI provider')
      fireEvent.change(apiKeyInput, { target: { value: 'test-api-key-123' } })

      expect(localStorage.getItem('ai_provider')).toBe('openai')
      expect(localStorage.getItem('ai_api_key')).toBe('test-api-key-123')
    })

    it('should load saved API key and provider from localStorage', () => {
      localStorage.setItem('ai_provider', 'anthropic')
      localStorage.setItem('ai_api_key', 'saved-api-key-456')

      render(<AIAssistantPanel {...defaultProps} />)

      const providerSelect = screen.getByLabelText('Select AI provider') as HTMLSelectElement
      expect(providerSelect.value).toBe('anthropic')

      const apiKeyInput = screen.getByLabelText(
        'Enter your API key for the selected AI provider'
      ) as HTMLInputElement
      expect(apiKeyInput.value).toBe('saved-api-key-456')
    })
  })

  describe('when using quick actions', () => {
    it('should show quick actions when provider and API key are set', () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')

      render(<AIAssistantPanel {...defaultProps} />)

      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      expect(screen.getByText('💡 Generate Ideas for Selected Node')).toBeInTheDocument()
      expect(screen.getByText('📝 Summarize Branch')).toBeInTheDocument()
    })

    it('should disable quick actions when no node is selected', () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')
      const props = { ...defaultProps, selectedNodeId: null }

      render(<AIAssistantPanel {...props} />)

      const generateIdeasButton = screen.getByText('💡 Generate Ideas for Selected Node')
      const summarizeButton = screen.getByText('📝 Summarize Branch')

      expect(generateIdeasButton).toBeDisabled()
      expect(summarizeButton).toBeDisabled()
    })

    it('should call onSuggestIdeas when generate ideas button is clicked', async () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'AI response' } }] }),
      })
      vi.stubGlobal('fetch', mockFetch)

      render(<AIAssistantPanel {...defaultProps} />)

      const generateIdeasButton = screen.getByText('💡 Generate Ideas for Selected Node')
      fireEvent.click(generateIdeasButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
        expect(mockOnSuggestIdeas).toHaveBeenCalledWith('node-123')
      })
    })

    it('should call onSummarizeBranch when summarize button is clicked', async () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'Summary response' } }] }),
      })
      vi.stubGlobal('fetch', mockFetch)

      render(<AIAssistantPanel {...defaultProps} />)

      const summarizeButton = screen.getByText('📝 Summarize Branch')
      fireEvent.click(summarizeButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
        expect(mockOnSummarizeBranch).toHaveBeenCalledWith('node-123')
      })
    })
  })

  describe('when generating mind map from text', () => {
    it('should show textarea and generate button when provider and API key are set', () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')

      render(<AIAssistantPanel {...defaultProps} />)

      expect(screen.getByText('Generate Mind Map from Text')).toBeInTheDocument()
      expect(
        screen.getByLabelText('Enter topic or text to generate mind map from')
      ).toBeInTheDocument()
      expect(screen.getByText('✨ Generate Mind Map')).toBeInTheDocument()
    })

    it('should disable generate button when prompt is empty', () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')

      render(<AIAssistantPanel {...defaultProps} />)

      const generateButton = screen.getByText('✨ Generate Mind Map')
      expect(generateButton).toBeDisabled()
    })

    it('should enable generate button when prompt has text', () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')

      render(<AIAssistantPanel {...defaultProps} />)

      const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
      fireEvent.change(textarea, { target: { value: 'Test prompt' } })

      const generateButton = screen.getByText('✨ Generate Mind Map')
      expect(generateButton).not.toBeDisabled()
    })

    it('should call onGenerateMindMap when generate button is clicked', async () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: 'Root Topic\n  Subtopic 1\n    Detail 1.1' } }],
          }),
      })
      vi.stubGlobal('fetch', mockFetch)

      render(<AIAssistantPanel {...defaultProps} />)

      const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
      fireEvent.change(textarea, { target: { value: 'Test topic' } })

      const generateButton = screen.getByText('✨ Generate Mind Map')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
        expect(mockOnGenerateMindMap).toHaveBeenCalledWith(
          'Root Topic\n  Subtopic 1\n    Detail 1.1'
        )
      })
    })

    it('should show loading state while generating', async () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')
      let resolveFetch: (value: any) => void
      const mockFetch = vi.fn().mockReturnValue(
        new Promise(resolve => {
          resolveFetch = resolve
        })
      )
      vi.stubGlobal('fetch', mockFetch)

      render(<AIAssistantPanel {...defaultProps} />)

      const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
      fireEvent.change(textarea, { target: { value: 'Test topic' } })

      const generateButton = screen.getByText('✨ Generate Mind Map')
      fireEvent.click(generateButton)

      expect(screen.getByText('⏳ Generating...')).toBeInTheDocument()
      expect(generateButton).toBeDisabled()

      // Resolve the fetch promise
      resolveFetch!({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'Response' } }] }),
      })

      await waitFor(() => {
        expect(screen.getByText('✨ Generate Mind Map')).toBeInTheDocument()
      })
    })
  })

  describe('when handling API errors', () => {
    it('should show error message when API call fails', async () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } }),
      })
      vi.stubGlobal('fetch', mockFetch)

      render(<AIAssistantPanel {...defaultProps} />)

      const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
      fireEvent.change(textarea, { target: { value: 'Test topic' } })

      const generateButton = screen.getByText('✨ Generate Mind Map')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('AI Response')).toBeInTheDocument()
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
      })
    })

    it('should show error message when fetch throws', async () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
      vi.stubGlobal('fetch', mockFetch)

      render(<AIAssistantPanel {...defaultProps} />)

      const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
      fireEvent.change(textarea, { target: { value: 'Test topic' } })

      const generateButton = screen.getByText('✨ Generate Mind Map')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('AI Response')).toBeInTheDocument()
        expect(screen.getByText('Error: Network error')).toBeInTheDocument()
      })
    })
  })

  describe('when displaying AI responses', () => {
    it('should show AI response when received', async () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ choices: [{ message: { content: 'This is the AI response text.' } }] }),
      })
      vi.stubGlobal('fetch', mockFetch)

      render(<AIAssistantPanel {...defaultProps} />)

      const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
      fireEvent.change(textarea, { target: { value: 'Test topic' } })

      const generateButton = screen.getByText('✨ Generate Mind Map')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('AI Response')).toBeInTheDocument()
        expect(screen.getByText('This is the AI response text.')).toBeInTheDocument()
      })
    })

    it('should scroll to bottom when new response arrives', async () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'Response' } }] }),
      })
      vi.stubGlobal('fetch', mockFetch)
      const mockScrollIntoView = vi.fn()
      window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView

      render(<AIAssistantPanel {...defaultProps} />)

      const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
      fireEvent.change(textarea, { target: { value: 'Test topic' } })

      const generateButton = screen.getByText('✨ Generate Mind Map')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
      })
    })
  })

  describe('when closing the panel', () => {
    it('should call onClose when close button is clicked', () => {
      render(<AIAssistantPanel {...defaultProps} />)

      const closeButton = screen.getByLabelText('Close panel')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels for disabled buttons', () => {
      const props = { ...defaultProps, selectedNodeId: null }
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')

      render(<AIAssistantPanel {...props} />)

      const generateIdeasButton = screen.getByText('💡 Generate Ideas for Selected Node')
      expect(generateIdeasButton).toHaveAttribute('aria-label', 'Select a node to generate ideas')

      const summarizeButton = screen.getByText('📝 Summarize Branch')
      expect(summarizeButton).toHaveAttribute('aria-label', 'Select a node to summarize branch')
    })

    it('should have proper ARIA labels for enabled buttons', () => {
      localStorage.setItem('ai_provider', 'openai')
      localStorage.setItem('ai_api_key', 'test-key')

      render(<AIAssistantPanel {...defaultProps} />)

      const generateIdeasButton = screen.getByText('💡 Generate Ideas for Selected Node')
      expect(generateIdeasButton).toHaveAttribute('aria-label', 'Generate ideas for selected node')

      const summarizeButton = screen.getByText('📝 Summarize Branch')
      expect(summarizeButton).toHaveAttribute('aria-label', 'Summarize branch for selected node')
    })
  })
})
