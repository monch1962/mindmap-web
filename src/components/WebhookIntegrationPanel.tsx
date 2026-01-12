import { useState, useEffect, useCallback } from 'react';
import type { MindMapTree } from '../types';
import {
  registerWebhook,
  getWebhookConfig,
  generateWebhookEndpoint,
  triggerWebhook,
  generateTestPayload,
  validateWebhookPayload,
  type WebhookConfig,
} from '../utils/webhookIntegration';

interface WebhookIntegrationPanelProps {
  visible: boolean;
  onClose: () => void;
  tree: MindMapTree | null;
  onWebhookData?: (data: { nodeId: string; content: string; parentId?: string }) => void;
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
  });
  const [testPayload, setTestPayload] = useState<string>('');
  const [incomingData, setIncomingData] = useState<string>('');
  const [lastTriggered, setLastTriggered] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const savedConfig = getWebhookConfig();
    if (savedConfig) {
      setConfig(savedConfig);
      if (savedConfig.lastTriggered) {
        setLastTriggered(new Date(savedConfig.lastTriggered).toLocaleString());
      }
    }
    setTestPayload(JSON.stringify(generateTestPayload(), null, 2));
     
  }, []);

  const showStatus = useCallback((type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  const handleSaveConfig = () => {
    registerWebhook(config);
    showStatus('success', 'Webhook configuration saved!');
  };

  const handleTestWebhook = useCallback(async () => {
    if (!config.webhookUrl || !tree) {
      showStatus('error', 'Please enter a webhook URL');
      return;
    }

    const success = await triggerWebhook(
      config.webhookUrl,
      config.apiKey,
      tree,
      'updated'
    );

    if (success) {
      const timestamp = Date.now();
      const newConfig = { ...config, lastTriggered: timestamp };
      registerWebhook(newConfig);
      setConfig(newConfig);
      setLastTriggered(new Date(timestamp).toLocaleString());
      showStatus('success', 'Webhook triggered successfully!');
    } else {
      showStatus('error', 'Failed to trigger webhook. Check URL and API key.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, tree]);

  const handleSimulateIncoming = useCallback(() => {
    try {
      const payload = JSON.parse(incomingData);
      if (validateWebhookPayload(payload)) {
        onWebhookData?.({
          nodeId: `webhook_${Date.now()}`,
          content: payload.data.content,
          parentId: payload.data.parentId,
        });
        showStatus('success', 'Incoming webhook data processed!');
        setIncomingData('');
      } else {
        showStatus('error', 'Invalid webhook payload format');
      }
    } catch {
      showStatus('error', 'Invalid JSON format');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingData, onWebhookData]);

  if (!visible) return null;

  const webhookEndpoint = config.apiKey ? generateWebhookEndpoint(config.apiKey) : '';

  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '450px',
        maxHeight: '80vh',
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🔗</span>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            Webhook Integration
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
        {/* Status Message */}
        {statusMessage && (
          <div
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
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>
            Configuration
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
              Enable Webhooks
            </label>
            <select
              value={config.enabled ? 'enabled' : 'disabled'}
              onChange={(e) => setConfig({ ...config, enabled: e.target.value === 'enabled' })}
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
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
              Webhook URL
            </label>
            <input
              type="text"
              value={config.webhookUrl}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
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
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
              API Key
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="Enter your API key..."
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
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              Last triggered: {lastTriggered}
            </div>
          )}

          <button
            onClick={handleSaveConfig}
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
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>
            Test Webhook
          </h3>

          <div
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
            {testPayload}
          </div>

          <button
            onClick={handleTestWebhook}
            disabled={!config.webhookUrl}
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
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>
            Simulate Incoming Webhook
          </h3>

          <textarea
            value={incomingData}
            onChange={(e) => setIncomingData(e.target.value)}
            placeholder='{"action":"add_node","data":{"content":"New idea"},"source":"zapier","timestamp":1234567890}'
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
          <strong>How to use:</strong>
          <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>Create a webhook in Zapier or Make</li>
            <li>Paste the webhook URL above</li>
            <li>Configure trigger actions</li>
            <li>Test your integration</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
