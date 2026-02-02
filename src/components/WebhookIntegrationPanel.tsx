import { useState, useEffect, useCallback } from 'react'
import {
  registerWebhook,
  getWebhookConfig,
  generateWebhookEndpoint,
  triggerWebhook,
  generateTestPayload,
  validateWebhookPayload,
  type WebhookConfig,
} from '../utils/webhookIntegration'
import BasePanel from './common/BasePanel'
import { useStatusMessage } from '../hooks/useStatusMessage'
import type { PanelProps, WithTreeProps } from '../types/common'

interface WebhookIntegrationPanelProps extends PanelProps, WithTreeProps {
  onWebhookData?: (data: { nodeId: string; content: string; parentId?: string }) => void
}

export default function WebhookIntegrationPanel({
  visible,
  onClose,
  tree,
  onWebhookData,
}: WebhookIntegrationPanelProps) {
  const [config, setConfig] = useState<WebhookConfig>({
    enabled: false,
    webhookUrl: '',
    apiKey: '',
  })
  const [testPayload, setTestPayload] = useState<string>('')
  const [incomingData, setIncomingData] = useState<string>('')
  const [lastTriggered, setLastTriggered] = useState<string>('')
  const { statusMessage, showStatus } = useStatusMessage()

  useEffect(() => {
    const savedConfig = getWebhookConfig()
    if (savedConfig) {
      setConfig(savedConfig)
      if (savedConfig.lastTriggered) {
        setLastTriggered(new Date(savedConfig.lastTriggered).toLocaleString())
      }
    }
    setTestPayload(JSON.stringify(generateTestPayload(), null, 2))
  }, [])

  const handleSaveConfig = () => {
    registerWebhook(config)
    showStatus('success', 'Webhook configuration saved!')
  }

  const handleTestWebhook = useCallback(async () => {
    if (!config.webhookUrl || !tree) {
      showStatus('error', 'Please enter a webhook URL')
      return
    }

    const success = await triggerWebhook(config.webhookUrl, config.apiKey, tree, 'updated')

    if (success) {
      const timestamp = Date.now()
      const newConfig = { ...config, lastTriggered: timestamp }
      registerWebhook(newConfig)
      setConfig(newConfig)
      setLastTriggered(new Date(timestamp).toLocaleString())
      showStatus('success', 'Webhook triggered successfully!')
    } else {
      showStatus('error', 'Failed to trigger webhook. Check URL and API key.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, tree])

  const handleSimulateIncoming = useCallback(() => {
    try {
      const payload = JSON.parse(incomingData)
      if (validateWebhookPayload(payload)) {
        onWebhookData?.({
          nodeId: `webhook_${Date.now()}`,
          content: payload.data.content,
          parentId: payload.data.parentId,
        })
        showStatus('success', 'Incoming webhook data processed!')
        setIncomingData('')
      } else {
        showStatus('error', 'Invalid webhook payload format')
      }
    } catch {
      showStatus('error', 'Invalid JSON format')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingData, onWebhookData])

  if (!visible) return null

  const webhookEndpoint = config.apiKey ? generateWebhookEndpoint(config.apiKey) : ''

  return (
    <BasePanel
      visible={visible}
      onClose={onClose}
      title="Webhook Integration"
      ariaLabel="Webhook integration panel"
      position="right"
      size="lg"
      customStyles={{
        width: '450px',
        maxHeight: '80vh',
      }}
    >
      {/* Status Message */}
      {statusMessage && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '6px',
            background: statusMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: statusMessage.type === 'success' ? '#065f46' : '#991b1b',
            fontSize: '13px',
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Webhook Configuration */}
      <div role="group" aria-labelledby="webhook-config-title" style={{ marginBottom: '20px' }}>
        <h3
          id="webhook-config-title"
          style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}
        >
          Configuration
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="webhook-enabled"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            Enable Webhooks
          </label>
          <select
            id="webhook-enabled"
            value={config.enabled ? 'enabled' : 'disabled'}
            onChange={e => setConfig({ ...config, enabled: e.target.value === 'enabled' })}
            aria-label="Enable or disable webhooks"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="webhook-url"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            Webhook URL
          </label>
          <input
            id="webhook-url"
            type="text"
            value={config.webhookUrl}
            onChange={e => setConfig({ ...config, webhookUrl: e.target.value })}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            aria-label="Enter your webhook URL"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
          <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
            Enter your Zapier/Make webhook URL
          </p>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="webhook-api-key"
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
            id="webhook-api-key"
            type="password"
            value={config.apiKey}
            onChange={e => setConfig({ ...config, apiKey: e.target.value })}
            placeholder="Enter your API key..."
            aria-label="Enter your API key for webhook authentication"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>

        {webhookEndpoint && (
          <div
            role="region"
            aria-label="Your webhook endpoint"
            style={{
              padding: '8px',
              background: '#f3f4f6',
              borderRadius: '6px',
              fontSize: '11px',
              marginBottom: '12px',
            }}
          >
            <strong>Your endpoint:</strong> {webhookEndpoint}
          </div>
        )}

        {lastTriggered && (
          <div role="status" aria-live="polite" style={{ fontSize: '11px', color: '#6b7280' }}>
            Last triggered: {lastTriggered}
          </div>
        )}

        <button
          onClick={handleSaveConfig}
          aria-label="Save webhook configuration"
          style={{
            marginTop: '8px',
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          Save Configuration
        </button>
      </div>

      {/* Test Webhook */}
      <div role="group" aria-labelledby="test-webhook-title" style={{ marginBottom: '20px' }}>
        <h3
          id="test-webhook-title"
          style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}
        >
          Test Webhook
        </h3>

        <div
          role="region"
          aria-labelledby="test-payload-title"
          style={{
            padding: '12px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            marginBottom: '8px',
            maxHeight: '120px',
            overflowY: 'auto',
          }}
        >
          <h4
            id="test-payload-title"
            style={{
              margin: '0 0 4px 0',
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#6b7280',
            }}
          >
            Test Payload Preview
          </h4>
          {testPayload}
        </div>

        <button
          onClick={handleTestWebhook}
          disabled={!config.webhookUrl}
          aria-label={
            !config.webhookUrl
              ? 'Enter webhook URL to enable testing'
              : 'Send test payload to webhook'
          }
          style={{
            padding: '8px 16px',
            background: config.webhookUrl ? '#10b981' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: config.webhookUrl ? 'pointer' : 'not-allowed',
            fontSize: '13px',
            fontWeight: 'bold',
            opacity: config.webhookUrl ? 1 : 0.5,
          }}
        >
          Send Test Payload
        </button>
      </div>

      {/* Simulate Incoming */}
      <div role="group" aria-labelledby="incoming-webhook-title">
        <h3
          id="incoming-webhook-title"
          style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}
        >
          Simulate Incoming Webhook
        </h3>

        <label htmlFor="webhook-incoming" style={{ display: 'none' }}>
          Enter webhook payload to simulate
        </label>
        <textarea
          id="webhook-incoming"
          value={incomingData}
          onChange={e => setIncomingData(e.target.value)}
          placeholder='{"action":"add_node","data":{"content":"New idea"},"source":"zapier","timestamp":1234567890}'
          aria-label="Enter JSON webhook payload to simulate incoming webhook"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'monospace',
            minHeight: '80px',
            resize: 'vertical',
            marginBottom: '8px',
          }}
        />

        <button
          onClick={handleSimulateIncoming}
          disabled={!incomingData.trim()}
          aria-label={
            !incomingData.trim() ? 'Enter JSON data to process' : 'Process incoming webhook data'
          }
          style={{
            padding: '8px 16px',
            background: incomingData.trim() ? '#8b5cf6' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: incomingData.trim() ? 'pointer' : 'not-allowed',
            fontSize: '13px',
            fontWeight: 'bold',
            opacity: incomingData.trim() ? 1 : 0.5,
          }}
        >
          Process Incoming Data
        </button>
      </div>

      {/* Help Text */}
      <div
        role="region"
        aria-labelledby="webhook-help-title"
        style={{
          marginTop: '20px',
          padding: '12px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#1e40af',
        }}
      >
        <strong id="webhook-help-title">How to use:</strong>
        <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>Create a webhook in Zapier or Make</li>
          <li>Paste the webhook URL above</li>
          <li>Configure trigger actions</li>
          <li>Test your integration</li>
        </ol>
      </div>
    </BasePanel>
  )
}
