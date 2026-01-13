import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIAssistantPanel from './AIAssistantPanel';
import type { MindMapTree } from '../types';

// Mock fetch for API calls
global.fetch = vi.fn();

function createMockFetch(response: string) {
  return vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({ choices: [{ message: { content: response } }] }),
    }) as Response
  );
}

describe('AIAssistantPanel', () => {
  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
    onGenerateMindMap: vi.fn(),
    onSuggestIdeas: vi.fn(),
    onSummarizeBranch: vi.fn(),
    selectedNodeId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should not render when visible is false', () => {
    const { container } = render(<AIAssistantPanel {...defaultProps} visible={false} />);

    expect(container.firstChild).toBe(null);
  });

  it('should render AI assistant panel when visible', () => {
    render(<AIAssistantPanel {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('🤖')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<AIAssistantPanel {...defaultProps} onClose={handleClose} />);

    const closeButton = screen.getByLabelText('Close AI assistant panel');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should render provider selector', () => {
    render(<AIAssistantPanel {...defaultProps} />);

    const selector = screen.getByLabelText('Select AI provider');
    expect(selector).toBeInTheDocument();

    expect(screen.getByText('Select Provider...')).toBeInTheDocument();
    expect(screen.getByText('OpenAI (GPT-4)')).toBeInTheDocument();
    expect(screen.getByText('Anthropic (Claude)')).toBeInTheDocument();
  });

  it('should show API key input when provider is selected', () => {
    render(<AIAssistantPanel {...defaultProps} />);

    const selector = screen.getByLabelText('Select AI provider');
    fireEvent.change(selector, { target: { value: 'openai' } });

    expect(screen.getByLabelText('Enter your API key for the selected AI provider')).toBeInTheDocument();
  });

  it('should store API key and provider in localStorage', () => {
    render(<AIAssistantPanel {...defaultProps} />);

    const selector = screen.getByLabelText('Select AI provider');
    fireEvent.change(selector, { target: { value: 'openai' } });

    const apiKeyInput = screen.getByLabelText('Enter your API key for the selected AI provider');
    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });

    expect(localStorage.getItem('ai_provider')).toBe('openai');
    expect(localStorage.getItem('ai_api_key')).toBe('test-api-key');
  });

  it('should render quick actions when API key is set', () => {
    localStorage.setItem('ai_api_key', 'test-key');
    localStorage.setItem('ai_provider', 'openai');

    render(<AIAssistantPanel {...defaultProps} />);

    expect(screen.getByLabelText(/Generate ideas for selected node/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Summarize branch for selected node/)).toBeInTheDocument();
  });

  it('should disable quick actions when no node is selected', () => {
    localStorage.setItem('ai_api_key', 'test-key');
    localStorage.setItem('ai_provider', 'openai');

    render(<AIAssistantPanel {...defaultProps} selectedNodeId={null} />);

    const ideasButton = screen.getByLabelText(/Select a node to generate ideas/);
    const summarizeButton = screen.getByLabelText(/Select a node to summarize branch/);

    expect(ideasButton).toBeDisabled();
    expect(summarizeButton).toBeDisabled();
  });

  it('should enable quick actions when node is selected', () => {
    localStorage.setItem('ai_api_key', 'test-key');
    localStorage.setItem('ai_provider', 'openai');

    render(<AIAssistantPanel {...defaultProps} selectedNodeId="1" />);

    const ideasButton = screen.getByLabelText(/Generate ideas for selected node/);
    const summarizeButton = screen.getByLabelText(/Summarize branch for selected node/);

    expect(ideasButton).not.toBeDisabled();
    expect(summarizeButton).not.toBeDisabled();
  });

  it('should call onSuggestIdeas when ideas button is clicked', async () => {
    localStorage.setItem('ai_api_key', 'test-key');
    localStorage.setItem('ai_provider', 'openai');
    global.fetch = createMockFetch('Idea 1\nIdea 2\nIdea 3');

    const handleSuggestIdeas = vi.fn();
    render(
      <AIAssistantPanel {...defaultProps} selectedNodeId="1" onSuggestIdeas={handleSuggestIdeas} />
    );

    const ideasButton = screen.getByLabelText(/Generate ideas for selected node/);
    await userEvent.click(ideasButton);

    await waitFor(() => {
      expect(handleSuggestIdeas).toHaveBeenCalledWith('1');
    });
  });

  it('should call onSummarizeBranch when summarize button is clicked', async () => {
    localStorage.setItem('ai_api_key', 'test-key');
    localStorage.setItem('ai_provider', 'openai');
    global.fetch = createMockFetch('Summary of the branch');

    const handleSummarizeBranch = vi.fn();
    render(
      <AIAssistantPanel {...defaultProps} selectedNodeId="1" onSummarizeBranch={handleSummarizeBranch} />
    );

    const summarizeButton = screen.getByLabelText(/Summarize branch for selected node/);
    await userEvent.click(summarizeButton);

    await waitFor(() => {
      expect(handleSummarizeBranch).toHaveBeenCalledWith('1');
    });
  });

  it('should render generate mind map section', () => {
    localStorage.setItem('ai_api_key', 'test-key');
    localStorage.setItem('ai_provider', 'openai');

    render(<AIAssistantPanel {...defaultProps} />);

    expect(screen.getByLabelText('Enter topic or text to generate mind map from')).toBeInTheDocument();
    expect(screen.getByLabelText(/Generate mind map from text/)).toBeInTheDocument();
  });

  it('should call onGenerateMindMap when text is submitted', async () => {
    localStorage.setItem('ai_api_key', 'test-key');
    localStorage.setItem('ai_provider', 'openai');
    global.fetch = createMockFetch('Root\n  Child 1\n  Child 2');

    const handleGenerate = vi.fn();
    render(
      <AIAssistantPanel {...defaultProps} onGenerateMindMap={handleGenerate} />
    );

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from');
    await userEvent.type(textarea, 'Create a project plan');

    const generateButton = screen.getByLabelText(/Generate mind map from text/);
    await userEvent.click(generateButton);

    await waitFor(() => {
      expect(handleGenerate).toHaveBeenCalled();
    });
  });

  it('should display AI response', async () => {
    localStorage.setItem('ai_api_key', 'test-key');
    localStorage.setItem('ai_provider', 'openai');
    global.fetch = createMockFetch('AI response text');

    render(<AIAssistantPanel {...defaultProps} />);

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from');
    await userEvent.type(textarea, 'Test prompt');

    const generateButton = screen.getByLabelText(/Generate mind map from text/);
    await userEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('AI response text')).toBeInTheDocument();
    });
  });

  it('should disable generate button when prompt is empty', () => {
    localStorage.setItem('ai_api_key', 'test-key');
    localStorage.setItem('ai_provider', 'openai');

    render(<AIAssistantPanel {...defaultProps} />);

    const generateButton = screen.getByLabelText(/Enter text to generate mind map/);
    expect(generateButton).toBeDisabled();
  });

  it('should show loading state during generation', async () => {
    localStorage.setItem('ai_api_key', 'test-key');
    localStorage.setItem('ai_provider', 'openai');

    // Mock a delayed response
    global.fetch = vi.fn(() =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({ choices: [{ message: { content: 'Response' } }] }),
          } as Response);
        }, 100);
      })
    );

    render(<AIAssistantPanel {...defaultProps} />);

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from');
    await userEvent.type(textarea, 'Test prompt');

    const generateButton = screen.getByLabelText(/Generate mind map from text/);
    await userEvent.click(generateButton);

    // Check for loading state
    expect(screen.getByText(/⏳ Generating.../)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<AIAssistantPanel {...defaultProps} />);

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'ai-assistant-title');

    const title = screen.getByText('AI Assistant');
    expect(title).toHaveAttribute('id', 'ai-assistant-title');
  });

  it('should have privacy note for API key', () => {
    render(<AIAssistantPanel {...defaultProps} />);

    // Select a provider to show the API key input
    const selector = screen.getByLabelText('Select AI provider');
    fireEvent.change(selector, { target: { value: 'openai' } });

    expect(screen.getByText(/🔒 Your API key is stored locally/)).toBeInTheDocument();
  });

  it('should handle fetch errors gracefully', async () => {
    localStorage.setItem('ai_api_key', 'test-key');
    localStorage.setItem('ai_provider', 'openai');
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      } as Response)
    );

    render(<AIAssistantPanel {...defaultProps} />);

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from');
    await userEvent.type(textarea, 'Test prompt');

    const generateButton = screen.getByLabelText(/Generate mind map from text/);
    await userEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should switch provider correctly', () => {
    render(<AIAssistantPanel {...defaultProps} />);

    const selector = screen.getByLabelText('Select AI provider');

    // Switch to Anthropic
    fireEvent.change(selector, { target: { value: 'anthropic' } });
    expect(selector).toHaveValue('anthropic');
    expect(localStorage.getItem('ai_provider')).toBe('anthropic');

    // Switch to OpenAI
    fireEvent.change(selector, { target: { value: 'openai' } });
    expect(selector).toHaveValue('openai');
    expect(localStorage.getItem('ai_provider')).toBe('openai');
  });

  it('should clear response on new generation', async () => {
    localStorage.setItem('ai_api_key', 'test-key');
    localStorage.setItem('ai_provider', 'openai');
    global.fetch = createMockFetch('First response');

    render(<AIAssistantPanel {...defaultProps} />);

    const textarea = screen.getByLabelText('Enter topic or text to generate mind map from');

    // First generation
    await userEvent.type(textarea, 'First prompt');
    const generateButton = screen.getByLabelText(/Generate mind map from text/);
    await userEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('First response')).toBeInTheDocument();
    });

    // Change response for second generation
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(createMockFetch('Second response'));

    // Second generation
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Second prompt');
    await userEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Second response')).toBeInTheDocument();
      expect(screen.queryByText('First response')).not.toBeInTheDocument();
    });
  });
});
