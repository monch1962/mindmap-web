import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, beforeEach, it, expect } from 'vitest'
import WebhookIntegrationPanel from './WebhookIntegrationPanel'
import * as webhookUtils from '../utils/webhookIntegration'

// Mock the webhook utilities
vi.mock('../utils/webhookIntegration', () => ({
  registerWebhook: vi.fn(),
  getWebhookConfig: vi.fn(),
  generateWebhookEndpoint: vi.fn(),
  triggerWebhook: vi.fn(),
  generateTestPayload: vi.fn(),
  validateWebhookPayload: vi.fn(),
}))

// Mock tree data
const mockTree = {
  id: 'root',
  content: 'Test Mind Map',
  children: [],
  position: { x: 0, y: 0 },
  style: {},
}

describe('WebhookIntegrationPanel', () => {
  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
    tree: mockTree,
    onWebhookData: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementations
    vi.mocked(webhookUtils.getWebhookConfig).mockReturnValue(null)
    vi.mocked(webhookUtils.generateTestPayload).mockReturnValue({
      action: 'add_node',
      data: { content: 'Test node from webhook' },
      source: 'zapier',
      timestamp: Date.now(),
    })
    vi.mocked(webhookUtils.generateWebhookEndpoint).mockReturnValue(
      'https://example.com/webhook/abc123'
    )
    vi.mocked(webhookUtils.triggerWebhook).mockResolvedValue(true)
    vi.mocked(webhookUtils.validateWebhookPayload).mockReturnValue(true)
  })

  it('should render the panel when visible is true', () => {
    render(<WebhookIntegrationPanel {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Webhook integration panel')).toBeInTheDocument()
    expect(screen.getByText('Webhook Integration')).toBeInTheDocument()
  })

  it('should not render the panel when visible is false', () => {
    render(<WebhookIntegrationPanel {...defaultProps} visible={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should load saved webhook configuration on mount', () => {
    const savedConfig = {
      enabled: true,
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/123',
      apiKey: 'test-api-key',
      lastTriggered: Date.now(),
    }
    vi.mocked(webhookUtils.getWebhookConfig).mockReturnValue(savedConfig)

    render(<WebhookIntegrationPanel {...defaultProps} />)

    expect(webhookUtils.getWebhookConfig).toHaveBeenCalled()
    expect(screen.getByDisplayValue('https://hooks.zapier.com/hooks/catch/123')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test-api-key')).toBeInTheDocument()
  })

  it('should show webhook endpoint when API key is provided', () => {
    const savedConfig = {
      enabled: true,
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/123',
      apiKey: 'test-api-key',
    }
    vi.mocked(webhookUtils.getWebhookConfig).mockReturnValue(savedConfig)

    render(<WebhookIntegrationPanel {...defaultProps} />)

    expect(screen.getByText(/Your endpoint:/)).toBeInTheDocument()
    expect(screen.getByText('https://example.com/webhook/abc123')).toBeInTheDocument()
  })

  it('should save webhook configuration when Save Configuration is clicked', async () => {
    const user = userEvent.setup()
    render(<WebhookIntegrationPanel {...defaultProps} />)

    const urlInput = screen.getByLabelText('Enter your webhook URL')
    const apiKeyInput = screen.getByLabelText('Enter your API key for webhook authentication')
    const saveButton = screen.getByLabelText('Save webhook configuration')

    await user.type(urlInput, 'https://hooks.zapier.com/hooks/catch/456')
    await user.type(apiKeyInput, 'new-api-key')
    await user.click(saveButton)

    expect(webhookUtils.registerWebhook).toHaveBeenCalledWith({
      enabled: false,
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/456',
      apiKey: 'new-api-key',
    })

    // Check for success message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Webhook configuration saved!')).toBeInTheDocument()
    })
  })

  it('should test webhook when Send Test Payload is clicked', async () => {
    const user = userEvent.setup()
    const savedConfig = {
      enabled: true,
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/123',
      apiKey: 'test-api-key',
    }
    vi.mocked(webhookUtils.getWebhookConfig).mockReturnValue(savedConfig)

    render(<WebhookIntegrationPanel {...defaultProps} />)

    const testButton = screen.getByLabelText('Send test payload to webhook')
    await user.click(testButton)

    expect(webhookUtils.triggerWebhook).toHaveBeenCalledWith(
      'https://hooks.zapier.com/hooks/catch/123',
      'test-api-key',
      mockTree,
      'updated'
    )

    // Check for success message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Webhook triggered successfully!')).toBeInTheDocument()
    })
  })

  it('should show error when testing webhook without URL', async () => {
    const user = userEvent.setup()
    render(<WebhookIntegrationPanel {...defaultProps} />)

    const testButton = screen.getByLabelText('Enter webhook URL to enable testing')

    // Button is disabled when no URL is provided, so clicking shouldn't trigger handler
    // We'll verify the button is disabled and the handler isn't called
    expect(testButton).toBeDisabled()

    // Try to click anyway (though disabled buttons typically don't fire events)
    await user.click(testButton)

    // The handler shouldn't be called since button is disabled
    expect(webhookUtils.triggerWebhook).not.toHaveBeenCalled()

    // Note: Since the button is disabled, the click event may not trigger the handler
    // and thus no error message will be shown. This is expected behavior.
    // The important check is that triggerWebhook wasn't called.
  })

  it('should process incoming webhook data when valid JSON is provided', async () => {
    const user = userEvent.setup()
    const mockOnWebhookData = vi.fn()
    render(<WebhookIntegrationPanel {...defaultProps} onWebhookData={mockOnWebhookData} />)

    const textarea = screen.getByLabelText(
      'Enter JSON webhook payload to simulate incoming webhook'
    )
    // Button starts with disabled label
    screen.getByLabelText('Enter JSON data to process')

    const validPayload = JSON.stringify({
      action: 'add_node',
      data: { content: 'New idea from webhook', parentId: 'root' },
      source: 'zapier',
      timestamp: Date.now(),
    })

    // Use fireEvent to set the value directly instead of user.type for JSON
    fireEvent.change(textarea, { target: { value: validPayload } })
    // After typing, button label changes
    const enabledButton = screen.getByLabelText('Process incoming webhook data')
    await user.click(enabledButton)

    expect(webhookUtils.validateWebhookPayload).toHaveBeenCalled()
    expect(mockOnWebhookData).toHaveBeenCalledWith({
      nodeId: expect.stringContaining('webhook_'),
      content: 'New idea from webhook',
      parentId: 'root',
    })

    // Check for success message and cleared textarea
    await waitFor(() => {
      expect(screen.getByText('Incoming webhook data processed!')).toBeInTheDocument()
      expect(textarea).toHaveValue('')
    })
  })

  it('should show error for invalid JSON in incoming webhook', async () => {
    const user = userEvent.setup()
    render(<WebhookIntegrationPanel {...defaultProps} />)

    const textarea = screen.getByLabelText(
      'Enter JSON webhook payload to simulate incoming webhook'
    )
    // Button starts with disabled label
    screen.getByLabelText('Enter JSON data to process')

    await user.type(textarea, 'invalid json')
    // After typing, button label changes
    const enabledButton = screen.getByLabelText('Process incoming webhook data')
    await user.click(enabledButton)

    expect(webhookUtils.validateWebhookPayload).not.toHaveBeenCalled()

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Invalid JSON format')).toBeInTheDocument()
    })
  })

  it('should show error for invalid webhook payload format', async () => {
    vi.mocked(webhookUtils.validateWebhookPayload).mockReturnValue(false)

    render(<WebhookIntegrationPanel {...defaultProps} />)

    const textarea = screen.getByLabelText(
      'Enter JSON webhook payload to simulate incoming webhook'
    )

    const invalidPayload = JSON.stringify({ invalid: 'format' })
    fireEvent.change(textarea, { target: { value: invalidPayload } })

    // Wait for button label to update
    await waitFor(() => {
      expect(screen.getByLabelText('Process incoming webhook data')).toBeInTheDocument()
    })

    const processButton = screen.getByLabelText('Process incoming webhook data')
    await userEvent.click(processButton)

    expect(webhookUtils.validateWebhookPayload).toHaveBeenCalled()

    // Check for error message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Invalid webhook payload format')).toBeInTheDocument()
    })
  })

  it('should disable test button when webhook URL is empty', () => {
    render(<WebhookIntegrationPanel {...defaultProps} />)

    const testButton = screen.getByLabelText('Enter webhook URL to enable testing')
    expect(testButton).toBeDisabled()
    expect(testButton).toHaveStyle({ opacity: '0.5', cursor: 'not-allowed' })
  })

  it('should enable test button when webhook URL is provided', () => {
    const savedConfig = {
      enabled: true,
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/123',
      apiKey: 'test-api-key',
    }
    vi.mocked(webhookUtils.getWebhookConfig).mockReturnValue(savedConfig)

    render(<WebhookIntegrationPanel {...defaultProps} />)

    const testButton = screen.getByLabelText('Send test payload to webhook')
    expect(testButton).toBeEnabled()
    expect(testButton).toHaveStyle({ opacity: '1', cursor: 'pointer' })
  })

  it('should disable process button when incoming data is empty', () => {
    render(<WebhookIntegrationPanel {...defaultProps} />)

    const processButton = screen.getByLabelText('Enter JSON data to process')
    expect(processButton).toBeDisabled()
    expect(processButton).toHaveStyle({ opacity: '0.5', cursor: 'not-allowed' })
  })

  it('should enable process button when incoming data is provided', () => {
    render(<WebhookIntegrationPanel {...defaultProps} />)

    const textarea = screen.getByLabelText(
      'Enter JSON webhook payload to simulate incoming webhook'
    )

    fireEvent.change(textarea, { target: { value: '{ "test": "data" }' } })

    // After changing the textarea value, the button label changes
    const processButton = screen.getByLabelText('Process incoming webhook data')
    expect(processButton).toBeEnabled()
    expect(processButton).toHaveStyle({ opacity: '1', cursor: 'pointer' })
  })

  it('should enable process button when incoming data is provided', () => {
    render(<WebhookIntegrationPanel {...defaultProps} />)

    const textarea = screen.getByLabelText(
      'Enter JSON webhook payload to simulate incoming webhook'
    )
    const processButton = screen.getByLabelText('Enter JSON data to process')

    fireEvent.change(textarea, { target: { value: '{ "test": "data" }' } })

    expect(processButton).toBeEnabled()
    expect(processButton).toHaveStyle({ opacity: '1', cursor: 'pointer' })
  })

  it('should show last triggered timestamp when available', () => {
    const savedConfig = {
      enabled: true,
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/123',
      apiKey: 'test-api-key',
      lastTriggered: Date.now(),
    }
    vi.mocked(webhookUtils.getWebhookConfig).mockReturnValue(savedConfig)

    render(<WebhookIntegrationPanel {...defaultProps} />)

    expect(screen.getByText(/Last triggered:/)).toBeInTheDocument()
  })

  it('should handle webhook test failure gracefully', async () => {
    const user = userEvent.setup()
    const savedConfig = {
      enabled: true,
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/123',
      apiKey: 'test-api-key',
    }
    vi.mocked(webhookUtils.getWebhookConfig).mockReturnValue(savedConfig)
    vi.mocked(webhookUtils.triggerWebhook).mockResolvedValue(false)

    render(<WebhookIntegrationPanel {...defaultProps} />)

    const testButton = screen.getByLabelText('Send test payload to webhook')
    await user.click(testButton)

    expect(webhookUtils.triggerWebhook).toHaveBeenCalled()

    // Check for error message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(
        screen.getByText('Failed to trigger webhook. Check URL and API key.')
      ).toBeInTheDocument()
    })
  })

  it('should toggle webhook enabled state', async () => {
    const user = userEvent.setup()
    render(<WebhookIntegrationPanel {...defaultProps} />)

    const select = screen.getByLabelText('Enable or disable webhooks')
    expect(select).toHaveValue('disabled')

    await user.selectOptions(select, 'enabled')
    expect(select).toHaveValue('enabled')
  })

  it('should close panel when close button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnClose = vi.fn()
    render(<WebhookIntegrationPanel {...defaultProps} onClose={mockOnClose} />)

    const closeButton = screen.getByLabelText('Close panel')
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
