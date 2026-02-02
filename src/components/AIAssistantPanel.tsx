import { useState, useRef, useEffect } from 'react'
import { trackError } from '../utils/errorTracking'
import BasePanel from './common/BasePanel'

interface AIAssistantPanelProps {
  visible: boolean
  onClose: () => void
  onGenerateMindMap: (text: string) => void
  onSuggestIdeas: (nodeId: string) => void
  onSummarizeBranch: (nodeId: string) => void
  selectedNodeId: string | null
}

type AIProvider = 'openai' | 'anthropic' | 'none'

export default function AIAssistantPanel({
  visible,
  onClose,
  onGenerateMindMap,
  onSuggestIdeas,
  onSummarizeBranch,
  selectedNodeId,
}: AIAssistantPanelProps) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ai_api_key') || '')
  const [provider, setProvider] = useState<AIProvider>(
    () => (localStorage.getItem('ai_provider') as AIProvider) || 'none'
  )
  const [prompt, setPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem('ai_api_key', apiKey)
  }, [apiKey])

  useEffect(() => {
    localStorage.setItem('ai_provider', provider)
  }, [provider])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiResponse])

  const handleGenerate = async () => {
    if (!prompt.trim() || !apiKey) return

    setIsLoading(true)
    try {
      const response = await fetchAIResponse(prompt, 'generate', provider, apiKey)
      setAiResponse(response)

      // Parse the response and generate mind map
      const mindMapText = extractMindMapFromResponse(response)
      if (mindMapText) {
        onGenerateMindMap(mindMapText)
      }
    } catch (error) {
      trackError(
        error instanceof Error ? error : new Error(String(error)),
        'AIAssistant-handleGenerate'
      )
      setAiResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestIdeas = async () => {
    if (!selectedNodeId || !apiKey) return

    setIsLoading(true)

    try {
      const response = await fetchAIResponse(
        `Generate 5 creative ideas related to the selected node`,
        'suggest',
        provider,
        apiKey
      )
      setAiResponse(response)
      onSuggestIdeas(selectedNodeId)
    } catch (error) {
      trackError(
        error instanceof Error ? error : new Error(String(error)),
        'AIAssistant-handleSuggestIdeas'
      )
      setAiResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSummarize = async () => {
    if (!selectedNodeId || !apiKey) return

    setIsLoading(true)

    try {
      const response = await fetchAIResponse(
        `Summarize the mind map branch for the selected node`,
        'summarize',
        provider,
        apiKey
      )
      setAiResponse(response)
      onSummarizeBranch(selectedNodeId)
    } catch (error) {
      trackError(
        error instanceof Error ? error : new Error(String(error)),
        'AIAssistant-handleSummarize'
      )
      setAiResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BasePanel
      visible={visible}
      onClose={onClose}
      title="AI Assistant"
      position="right"
      size="md"
      ariaLabel="AI Assistant panel"
      trapFocus={true}
      closeOnEscape={true}
    >
      {/* Content */}
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
        {/* API Key Input */}
        <div role="group" aria-labelledby="ai-config-title" style={{ marginBottom: '16px' }}>
          <h3
            id="ai-config-title"
            style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}
          >
            AI Provider
          </h3>
          <label htmlFor="ai-provider-select" style={{ display: 'none' }}>
            Select AI provider
          </label>
          <select
            id="ai-provider-select"
            value={provider}
            onChange={e => setProvider(e.target.value as AIProvider)}
            aria-label="Select AI provider"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '8px',
            }}
          >
            <option value="none">Select Provider...</option>
            <option value="openai">OpenAI (GPT-4)</option>
            <option value="anthropic">Anthropic (Claude)</option>
          </select>

          {provider !== 'none' && (
            <>
              <label
                htmlFor="ai-api-key"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                }}
              >
                API Key
              </label>
              <input
                id="ai-api-key"
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                aria-label="Enter your API key for the selected AI provider"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
              <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                🔒 Your API key is stored locally and never sent to our servers
              </p>
            </>
          )}
        </div>

        {/* Quick Actions */}
        {provider !== 'none' && apiKey && (
          <div role="group" aria-labelledby="quick-actions-title" style={{ marginBottom: '16px' }}>
            <label
              id="quick-actions-title"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '8px',
              }}
            >
              Quick Actions
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleSuggestIdeas}
                disabled={!selectedNodeId || isLoading}
                aria-label={
                  !selectedNodeId
                    ? 'Select a node to generate ideas'
                    : isLoading
                      ? 'Generating ideas...'
                      : 'Generate ideas for selected node'
                }
                style={{
                  padding: '10px',
                  background: selectedNodeId ? '#3b82f6' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: selectedNodeId && !isLoading ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  opacity: selectedNodeId && !isLoading ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                💡 Generate Ideas for Selected Node
              </button>
              <button
                onClick={handleSummarize}
                disabled={!selectedNodeId || isLoading}
                aria-label={
                  !selectedNodeId
                    ? 'Select a node to summarize branch'
                    : isLoading
                      ? 'Summarizing...'
                      : 'Summarize branch for selected node'
                }
                style={{
                  padding: '10px',
                  background: selectedNodeId ? '#8b5cf6' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: selectedNodeId && !isLoading ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  opacity: selectedNodeId && !isLoading ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                📝 Summarize Branch
              </button>
            </div>
          </div>
        )}

        {/* Generate Mind Map */}
        {provider !== 'none' && apiKey && (
          <div role="group" aria-labelledby="generate-title" style={{ marginBottom: '16px' }}>
            <label
              id="generate-title"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '8px',
              }}
            >
              Generate Mind Map from Text
            </label>
            <label htmlFor="ai-prompt" style={{ display: 'none' }}>
              Enter text to generate mind map
            </label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter a topic or paste text to generate a mind map..."
              aria-label="Enter topic or text to generate mind map from"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              aria-label={
                !prompt.trim()
                  ? 'Enter text to generate mind map'
                  : isLoading
                    ? 'Generating mind map...'
                    : 'Generate mind map from text'
              }
              style={{
                marginTop: '8px',
                padding: '10px 16px',
                background: prompt.trim() && !isLoading ? '#10b981' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: prompt.trim() && !isLoading ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: 'bold',
                opacity: prompt.trim() && !isLoading ? 1 : 0.5,
              }}
            >
              {isLoading ? '⏳ Generating...' : '✨ Generate Mind Map'}
            </button>
          </div>
        )}

        {/* Response Area */}
        {aiResponse && (
          <div
            role="region"
            aria-labelledby="ai-response-title"
            style={{
              padding: '12px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              whiteSpace: 'pre-wrap',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            <h4
              id="ai-response-title"
              style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              AI Response
            </h4>
            {aiResponse}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </BasePanel>
  )
}

// Helper functions
async function fetchAIResponse(
  prompt: string,
  mode: string,
  provider: AIProvider,
  apiKey: string
): Promise<string> {
  const systemPrompt = {
    generate: `You are a mind map generator. Convert the user's text into a hierarchical mind map structure.
Use indentation to show hierarchy. Format:
Root Topic
  Subtopic 1
    Detail 1.1
    Detail 1.2
  Subtopic 2
    Detail 2.1`,
    suggest: `You are a creative brainstorming assistant. Generate 5 creative, relevant ideas related to the user's topic.
Each idea should be concise (1-2 sentences) and actionable.`,
    summarize: `You are a summarization expert. Create a clear, concise summary of the provided content.`,
  }

  const systemMessage = systemPrompt[mode as keyof typeof systemPrompt] || systemPrompt.generate

  if (provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'API request failed')
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response'
  } else if (provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        system: systemMessage,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'API request failed')
    }

    const data = await response.json()
    return data.content[0]?.text || 'No response'
  }

  throw new Error('No AI provider selected')
}

function extractMindMapFromResponse(response: string): string {
  // Extract the mind map structure from AI response
  const lines = response.split('\n').filter(line => line.trim())
  return lines.join('\n')
}
