import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIAssistantPanel from './AIAssistantPanel'

// Declare global for TypeScript
declare const global: typeof globalThis & {
  fetch: ReturnType<typeof vi.fn>
}

// Mock fetch for API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

function createMockFetch(response: string) {
  return vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({ choices: [{ message: { content: response } }] }),
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic' as ResponseType,
      url: '',
      clone: () => ({}) as Response,
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve(''),
    } as Response)
  )
}

describe('AIAssistantPanel', () => {
  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
    onGenerateMindMap: vi.fn(),
    onSuggestIdeas: vi.fn(),
    onSummarizeBranch: vi.fn(),
    selectedNodeId: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should not render when visible is false', () => {
    const { container } = render(<AIAssistantPanel {...defaultProps} visible={false} />)

    expect(container.firstChild).toBe(null)
  })

  it('should render AI assistant panel when visible', () => {
    render(<AIAssistantPanel {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    render(<AIAssistantPanel {...defaultProps} onClose={handleClose} />)

    const closeButton = screen.getByLabelText('Close panel')
    fireEvent.click(closeButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should render provider selector', () => {
    render(<AIAssistantPanel {...defaultProps} />)

    const selector = screen.getByLabelText('Select AI provider')
    expect(selector).toBeInTheDocument()

    expect(screen.getByText('Select Provider...')).toBeInTheDocument()
    expect(screen.getByText('OpenAI (GPT-4)')).toBeInTheDocument()
    expect(screen.getByText('Anthropic (Claude)')).toBeInTheDocument()
  })

  it('should show API key input when provider is selected', () => {
    render(<AIAssistantPanel {...defaultProps} />)

    const selector = screen.getByLabelText('Select AI provider')
    fireEvent.change(selector, { target: { value: 'openai' } })

    expect(
      screen.getByLabelText('Enter your API key for the selected AI provider')
    ).toBeInTheDocument()
  })

  it('should store API key and provider in localStorage', () => {
    render(<AIAssistantPanel {...defaultProps} />)

    const selector = screen.getByLabelText('Select AI provider')
    fireEvent.change(selector, { target: { value: 'openai' } })

    const apiKeyInput = screen.getByLabelText('Enter your API key for the selected AI provider')
    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } })

    expect(localStorage.getItem('ai_provider')).toBe('openai')
    expect(localStorage.getItem('ai_api_key')).toBe('test-api-key')
  })

  it('should render quick actions when API key is set', () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')

    render(<AIAssistantPanel {...defaultProps} selectedNodeId="1" />)

    expect(screen.getByLabelText(/Generate ideas for selected node/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Summarize branch for selected node/)).toBeInTheDocument()
  })

  it('should disable quick actions when no node is selected', () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')

    render(<AIAssistantPanel {...defaultProps} selectedNodeId={null} />)

    const ideasButton = screen.getByLabelText(/Select a node to generate ideas/)
    const summarizeButton = screen.getByLabelText(/Select a node to summarize branch/)

    expect(ideasButton).toBeDisabled()
    expect(summarizeButton).toBeDisabled()
  })

  it('should enable quick actions when node is selected', () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')

    render(<AIAssistantPanel {...defaultProps} selectedNodeId="1" />)

    const ideasButton = screen.getByLabelText(/Generate ideas for selected node/)
    const summarizeButton = screen.getByLabelText(/Summarize branch for selected node/)

    expect(ideasButton).not.toBeDisabled()
    expect(summarizeButton).not.toBeDisabled()
  })

  it('should call onSuggestIdeas when ideas button is clicked', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')
    mockFetch.mockImplementation(createMockFetch('Idea 1\nIdea 2\nIdea 3'))

    const handleSuggestIdeas = vi.fn()
    render(
      <AIAssistantPanel {...defaultProps} selectedNodeId="1" onSuggestIdeas={handleSuggestIdeas} />
    )

    const ideasButton = screen.getByLabelText(/Generate ideas for selected node/)
    await userEvent.click(ideasButton)

    await waitFor(() => {
      expect(handleSuggestIdeas).toHaveBeenCalledWith('1')
    })
  })

  it('should call onSummarizeBranch when summarize button is clicked', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')
    mockFetch.mockImplementation(createMockFetch('Summary of the branch'))

    const handleSummarizeBranch = vi.fn()
    render(
      <AIAssistantPanel
        {...defaultProps}
        selectedNodeId="1"
        onSummarizeBranch={handleSummarizeBranch}
      />
    )

    const summarizeButton = screen.getByLabelText(/Summarize branch for selected node/)
    await userEvent.click(summarizeButton)

    await waitFor(() => {
      expect(handleSummarizeBranch).toHaveBeenCalledWith('1')
    })
  })

  it('should render generate mind map section', () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')

    render(<AIAssistantPanel {...defaultProps} />)

    expect(
      screen.getByLabelText('Enter topic or text to generate mind map from')
    ).toBeInTheDocument()
    expect(screen.getByText('Generate Mind Map from Text')).toBeInTheDocument()
  })

  it('should call onGenerateMindMap when text is submitted', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')
    mockFetch.mockImplementation(createMockFetch('Root\n  Child 1\n  Child 2'))

    const handleGenerate = vi.fn()
    render(<AIAssistantPanel {...defaultProps} onGenerateMindMap={handleGenerate} />)

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
    await userEvent.type(textarea, 'Create a project plan')

    const generateButton = screen.getByLabelText(/Generate mind map from text/)
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(handleGenerate).toHaveBeenCalled()
    })
  })

  it('should display AI response', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')
    mockFetch.mockImplementation(createMockFetch('AI response text'))

    render(<AIAssistantPanel {...defaultProps} />)

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
    await userEvent.type(textarea, 'Test prompt')

    const generateButton = screen.getByLabelText(/Generate mind map from text/)
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('AI response text')).toBeInTheDocument()
    })
  })

  it('should disable generate button when prompt is empty', () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')

    render(<AIAssistantPanel {...defaultProps} />)

    const generateButton = screen.getByRole('button', { name: /Enter text to generate mind map/ })
    expect(generateButton).toBeDisabled()
  })

  it('should show loading state during generation', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')

    // Mock a delayed response
    mockFetch.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ choices: [{ message: { content: 'Response' } }] }),
              headers: new Headers(),
              redirected: false,
              status: 200,
              statusText: 'OK',
              type: 'basic' as ResponseType,
              url: '',
              clone: () => ({}) as Response,
              body: null,
              bodyUsed: false,
              arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
              blob: () => Promise.resolve(new Blob()),
              formData: () => Promise.resolve(new FormData()),
              text: () => Promise.resolve(''),
            } as Response)
          }, 100)
        })
    )

    render(<AIAssistantPanel {...defaultProps} />)

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
    await userEvent.type(textarea, 'Test prompt')

    const generateButton = screen.getByLabelText(/Generate mind map from text/)
    await userEvent.click(generateButton)

    // Check for loading state
    expect(screen.getByText(/⏳ Generating.../)).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<AIAssistantPanel {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'AI Assistant panel')

    // BasePanel uses aria-label instead of aria-labelledby
    expect(dialog).not.toHaveAttribute('aria-labelledby')

    const title = screen.getByText('AI Assistant')
    // Title doesn't need ID since we use aria-label
    expect(title).not.toHaveAttribute('id')
  })

  it('should have privacy note for API key', () => {
    render(<AIAssistantPanel {...defaultProps} />)

    // Select a provider to show the API key input
    const selector = screen.getByLabelText('Select AI provider')
    fireEvent.change(selector, { target: { value: 'openai' } })

    expect(screen.getByText(/🔒 Your API key is stored locally/)).toBeInTheDocument()
  })

  it('should handle fetch errors gracefully', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ error: { message: 'Invalid API key' } }),
        headers: new Headers(),
        redirected: false,
        status: 401,
        statusText: 'Unauthorized',
        type: 'basic' as ResponseType,
        url: '',
        clone: () => ({}) as Response,
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve(''),
      } as Response)
    )

    render(<AIAssistantPanel {...defaultProps} />)

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
    await userEvent.type(textarea, 'Test prompt')

    const generateButton = screen.getByLabelText(/Generate mind map from text/)
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
    })
  })

  it('should switch provider correctly', () => {
    render(<AIAssistantPanel {...defaultProps} />)

    const selector = screen.getByLabelText('Select AI provider')

    // Switch to Anthropic
    fireEvent.change(selector, { target: { value: 'anthropic' } })
    expect(selector).toHaveValue('anthropic')
    expect(localStorage.getItem('ai_provider')).toBe('anthropic')

    // Switch to OpenAI
    fireEvent.change(selector, { target: { value: 'openai' } })
    expect(selector).toHaveValue('openai')
    expect(localStorage.getItem('ai_provider')).toBe('openai')
  })

  it('should clear response on new generation', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')
    mockFetch.mockImplementation(createMockFetch('First response'))

    render(<AIAssistantPanel {...defaultProps} />)

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')

    // First generation
    await userEvent.type(textarea, 'First prompt')
    const generateButton = screen.getByLabelText(/Generate mind map from text/)
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('First response')).toBeInTheDocument()
    })

    // Change response for second generation
    mockFetch.mockImplementationOnce(createMockFetch('Second response'))

    // Second generation
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Second prompt')
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Second response')).toBeInTheDocument()
      expect(screen.queryByText('First response')).not.toBeInTheDocument()
    })
  })

  it('should work with Anthropic provider', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'anthropic')

    // Mock Anthropic response
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ content: [{ text: 'Anthropic response' }] }),
        headers: new Headers(),
        redirected: false,
        status: 200,
        statusText: 'OK',
        type: 'basic' as ResponseType,
        url: '',
        clone: () => ({}) as Response,
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve(''),
      } as Response)
    )

    render(<AIAssistantPanel {...defaultProps} />)

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
    await userEvent.type(textarea, 'Test prompt')

    const generateButton = screen.getByLabelText(/Generate mind map from text/)
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Anthropic response')).toBeInTheDocument()
    })
  })

  it('should handle network errors', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')

    // Mock network failure
    mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')))

    render(<AIAssistantPanel {...defaultProps} />)

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
    await userEvent.type(textarea, 'Test prompt')

    const generateButton = screen.getByLabelText(/Generate mind map from text/)
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
    })
  })

  it('should handle empty API response', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')

    // Mock empty response
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ choices: [] }),
        headers: new Headers(),
        redirected: false,
        status: 200,
        statusText: 'OK',
        type: 'basic' as ResponseType,
        url: '',
        clone: () => ({}) as Response,
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve(''),
      } as Response)
    )

    render(<AIAssistantPanel {...defaultProps} />)

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
    await userEvent.type(textarea, 'Test prompt')

    const generateButton = screen.getByLabelText(/Generate mind map from text/)
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('No response')).toBeInTheDocument()
    })
  })

  it('should extract mind map from AI response', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')

    const mindMapResponse = `Root Topic
  Subtopic 1
    Detail 1.1
    Detail 1.2
  Subtopic 2
    Detail 2.1`

    mockFetch.mockImplementation(createMockFetch(mindMapResponse))

    const handleGenerate = vi.fn()
    render(<AIAssistantPanel {...defaultProps} onGenerateMindMap={handleGenerate} />)

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
    await userEvent.type(textarea, 'Create a project plan')

    const generateButton = screen.getByLabelText(/Generate mind map from text/)
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(handleGenerate).toHaveBeenCalledWith(mindMapResponse)
    })
  })

  it('should not generate mind map when response has no structure', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')

    const unstructuredResponse =
      'This is just a regular text response without any mind map structure'

    mockFetch.mockImplementation(createMockFetch(unstructuredResponse))

    const handleGenerate = vi.fn()
    render(<AIAssistantPanel {...defaultProps} onGenerateMindMap={handleGenerate} />)

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
    await userEvent.type(textarea, 'Test prompt')

    const generateButton = screen.getByLabelText(/Generate mind map from text/)
    await userEvent.click(generateButton)

    await waitFor(() => {
      // The extractMindMapFromResponse function always returns the response,
      // so handleGenerate will be called with the unstructured response
      expect(handleGenerate).toHaveBeenCalledWith(unstructuredResponse)
      expect(screen.getByText(unstructuredResponse)).toBeInTheDocument()
    })
  })

  it('should handle provider "none" selection', () => {
    render(<AIAssistantPanel {...defaultProps} />)

    const selector = screen.getByLabelText('Select AI provider')
    fireEvent.change(selector, { target: { value: 'none' } })

    expect(selector).toHaveValue('none')
    expect(localStorage.getItem('ai_provider')).toBe('none')

    // API key input should not be shown
    expect(
      screen.queryByLabelText('Enter your API key for the selected AI provider')
    ).not.toBeInTheDocument()
  })

  it('should disable buttons when loading', async () => {
    localStorage.setItem('ai_api_key', 'test-key')
    localStorage.setItem('ai_provider', 'openai')

    // Mock a delayed response
    mockFetch.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ choices: [{ message: { content: 'Response' } }] }),
              headers: new Headers(),
              redirected: false,
              status: 200,
              statusText: 'OK',
              type: 'basic' as ResponseType,
              url: '',
              clone: () => ({}) as Response,
              body: null,
              bodyUsed: false,
              arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
              blob: () => Promise.resolve(new Blob()),
              formData: () => Promise.resolve(new FormData()),
              text: () => Promise.resolve(''),
            } as Response)
          }, 100)
        })
    )

    render(<AIAssistantPanel {...defaultProps} selectedNodeId="1" />)

    // Type in prompt first
    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from')
    await userEvent.type(textarea, 'Test prompt')

    // Get buttons - the generate button label changes during loading
    const generateButton = screen.getByRole('button', {
      name: /Generate mind map from text|⏳ Generating/,
    })
    const ideasButton = screen.getByLabelText(/Generate ideas for selected node/)
    const summarizeButton = screen.getByLabelText(/Summarize branch for selected node/)

    await userEvent.click(generateButton)

    // All buttons should be disabled during loading
    expect(generateButton).toBeDisabled()
    expect(ideasButton).toBeDisabled()
    expect(summarizeButton).toBeDisabled()

    // Wait for loading to complete
    await waitFor(() => {
      expect(generateButton).not.toBeDisabled()
    })
  })

  it('should handle keyboard navigation integration', () => {
    render(<AIAssistantPanel {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    // BasePanel handles keyboard navigation internally
    expect(dialog).toBeInTheDocument()
    // Check that the dialog has proper ARIA attributes
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'AI Assistant panel')
    // BasePanel sets tabindex for focus management
    expect(dialog).toHaveAttribute('tabindex', '-1')
  })

  it('should persist API key and provider across renders', () => {
    // Set initial values
    localStorage.setItem('ai_api_key', 'initial-key')
    localStorage.setItem('ai_provider', 'openai')

    const { rerender } = render(<AIAssistantPanel {...defaultProps} />)

    // Verify initial values are loaded
    const apiKeyInput = screen.getByLabelText('Enter your API key for the selected AI provider')
    expect(apiKeyInput).toHaveValue('initial-key')

    const selector = screen.getByLabelText('Select AI provider')
    expect(selector).toHaveValue('openai')

    // Change values
    fireEvent.change(apiKeyInput, { target: { value: 'new-key' } })
    fireEvent.change(selector, { target: { value: 'anthropic' } })

    // Re-render
    rerender(<AIAssistantPanel {...defaultProps} />)

    // Verify persistence
    const newApiKeyInput = screen.getByLabelText('Enter your API key for the selected AI provider')
    expect(newApiKeyInput).toHaveValue('new-key')
    expect(localStorage.getItem('ai_api_key')).toBe('new-key')
    expect(localStorage.getItem('ai_provider')).toBe('anthropic')
  })
})
