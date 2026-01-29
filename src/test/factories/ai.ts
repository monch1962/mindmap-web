// Factory functions for creating test AI data and responses

/**
 * Create a mock AI response for mind map generation
 */
export const createAIMindMapResponse = (topic = 'Project Planning'): string => {
  return `${topic}
  Research
    Market Analysis
    Competitor Research
    User Interviews
  Planning
    Project Timeline
    Resource Allocation
    Risk Assessment
  Development
    Frontend
    Backend
    Testing
  Deployment
    Staging
    Production
    Monitoring
`
}

/**
 * Create a mock AI response for idea generation
 */
export const createAIIdeaResponse = (count = 5): string => {
  const ideas = [
    'Create an interactive tutorial for new users',
    'Implement real-time collaboration features',
    'Add export to additional formats (PDF, PowerPoint)',
    'Integrate with project management tools',
    'Develop mobile app version',
    'Add voice note recording for nodes',
    'Implement AI-powered node suggestions',
    'Create template library for common use cases',
    'Add presentation mode with speaker notes',
    'Implement version history and branching',
  ]

  const selectedIdeas = ideas.sort(() => Math.random() - 0.5).slice(0, count)

  return selectedIdeas.map((idea, index) => `${index + 1}. ${idea}`).join('\n')
}

/**
 * Create a mock AI response for branch summarization
 */
export const createAISummaryResponse = (): string => {
  return `## Summary

This branch focuses on project planning and management. Key areas include:

### Research Phase
- Market analysis to understand competitive landscape
- User interviews to gather requirements
- Technical feasibility assessment

### Planning Phase
- Timeline development with milestones
- Resource allocation across teams
- Risk identification and mitigation strategies

### Development Phase
- Frontend implementation with React components
- Backend API development
- Comprehensive testing strategy

### Deployment Phase
- Staging environment setup
- Production deployment procedures
- Monitoring and maintenance plans

### Key Insights
1. The project requires cross-functional collaboration
2. Agile methodology recommended for flexibility
3. Regular stakeholder updates are crucial
4. Technical debt should be monitored
5. User feedback loops should be established early

### Recommendations
- Start with MVP to validate assumptions
- Implement continuous integration early
- Establish clear success metrics
- Plan for scalability from the beginning`
}

/**
 * Create a mock OpenAI API response
 */
export const createOpenAIResponse = (content: string) => ({
  id: `chatcmpl-${Date.now()}`,
  object: 'chat.completion',
  created: Math.floor(Date.now() / 1000),
  model: 'gpt-4',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content,
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 100,
    completion_tokens: 200,
    total_tokens: 300,
  },
})

/**
 * Create a mock Anthropic API response
 */
export const createAnthropicResponse = (content: string) => ({
  id: `msg_${Date.now()}`,
  type: 'message',
  role: 'assistant',
  content: [
    {
      type: 'text',
      text: content,
    },
  ],
  model: 'claude-3-sonnet-20240229',
  stop_reason: 'end_turn',
  stop_sequence: null,
  usage: {
    input_tokens: 150,
    output_tokens: 250,
  },
})

/**
 * Create test AI configuration
 */
export const createAIConfig = (provider: 'openai' | 'anthropic' = 'openai') => ({
  provider,
  apiKey: `test-api-key-${provider}-${Date.now()}`,
  model: provider === 'openai' ? 'gpt-4' : 'claude-3-sonnet-20240229',
  temperature: 0.7,
  maxTokens: 1000,
  enabled: true,
})

/**
 * Create test AI conversation history
 */
export const createAIConversation = (messages: Array<{ role: string; content: string }> = []) => {
  const defaultMessages = [
    {
      role: 'system',
      content: 'You are a helpful AI assistant for mind mapping.',
    },
    {
      role: 'user',
      content: 'Help me create a mind map for project planning.',
    },
    {
      role: 'assistant',
      content: createAIMindMapResponse('Project Planning'),
    },
  ]

  return [...defaultMessages, ...messages]
}

/**
 * Create test AI error response
 */
export const createAIErrorResponse = (
  errorType: 'invalid_key' | 'rate_limit' | 'server_error' | 'network' = 'invalid_key'
) => {
  const errors = {
    invalid_key: {
      error: {
        message: 'Incorrect API key provided',
        type: 'invalid_request_error',
        code: 'invalid_api_key',
      },
    },
    rate_limit: {
      error: {
        message: 'Rate limit exceeded',
        type: 'rate_limit_error',
        code: 'rate_limit_exceeded',
      },
    },
    server_error: {
      error: {
        message: 'Internal server error',
        type: 'server_error',
        code: 'internal_error',
      },
    },
    network: null, // Will throw network error
  }

  return errors[errorType]
}

/**
 * Create test AI processing metrics
 */
export const createAIProcessingMetrics = () => ({
  startTime: Date.now() - 5000,
  endTime: Date.now(),
  duration: 5000,
  tokensUsed: 350,
  cost: 0.007,
  model: 'gpt-4',
  success: true,
  cached: false,
})

/**
 * Create test AI suggestion data
 */
export const createAISuggestions = (nodeId: string, count = 3) => {
  const suggestions = [
    {
      id: `suggestion-1-${nodeId}`,
      nodeId,
      type: 'expand',
      content: 'Consider adding subtopics for implementation details',
      confidence: 0.85,
      action: 'add_children',
    },
    {
      id: `suggestion-2-${nodeId}`,
      nodeId,
      type: 'connect',
      content: 'This topic relates to the research phase node',
      confidence: 0.72,
      action: 'create_link',
      targetNodeId: 'node-research',
    },
    {
      id: `suggestion-3-${nodeId}`,
      nodeId,
      type: 'enhance',
      content: 'Add relevant icons and colors for visual hierarchy',
      confidence: 0.91,
      action: 'apply_styling',
    },
    {
      id: `suggestion-4-${nodeId}`,
      nodeId,
      type: 'summarize',
      content: 'Create a summary note with key points',
      confidence: 0.68,
      action: 'add_note',
    },
    {
      id: `suggestion-5-${nodeId}`,
      nodeId,
      type: 'organize',
      content: 'Reorganize child nodes by priority',
      confidence: 0.79,
      action: 'reorder',
    },
  ]

  return suggestions.slice(0, count)
}
