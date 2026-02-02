import { useState } from 'react'
import {
  sendEmail,
  downloadEmailHTML,
  exportEmailTemplate,
  generateWeeklyDigest,
  generateEmailSignature,
} from '../utils/emailIntegration'
import BasePanel from './common/BasePanel'
import StatusMessage from './common/StatusMessage'
import { useStatusMessage } from '../hooks/useStatusMessage'
import type { PanelProps, WithTreeProps } from '../types/common'

interface EmailIntegrationPanelProps extends PanelProps, WithTreeProps {}

type EmailFormat = 'summary' | 'detailed' | 'bullet-points' | 'newsletter'

export default function EmailIntegrationPanel({
  visible,
  onClose,
  tree,
}: EmailIntegrationPanelProps) {
  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [format, setFormat] = useState<EmailFormat>('summary')
  const [includeSummary, setIncludeSummary] = useState(true)
  const [includePlainText, setIncludePlainText] = useState(true)
  const { statusMessage, showStatus, clearStatus } = useStatusMessage()

  const handleSendEmail = () => {
    if (!tree) {
      showStatus('error', 'No mind map to send')
      return
    }

    sendEmail(tree, {
      recipient: recipient || '',
      subject: subject || `Mind Map: ${tree.content}`,
      includeSummary,
      includePlainText,
      includeHTML: true,
      format,
    })

    showStatus('success', 'Opening email client...')
  }

  const handleDownloadHTML = () => {
    if (!tree) return
    downloadEmailHTML(tree)
    showStatus('success', 'HTML email downloaded!')
  }

  const handleExportTemplate = () => {
    if (!tree) return
    exportEmailTemplate(tree)
    showStatus('success', 'Email template exported!')
  }

  const handleCopySignature = () => {
    if (!tree) return
    const signature = generateEmailSignature(tree)
    navigator.clipboard.writeText(signature)
    showStatus('success', 'Signature copied to clipboard!')
  }

  const handleWeeklyDigest = () => {
    if (!tree) return
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    const digest = generateWeeklyDigest(tree, startDate, endDate)

    navigator.clipboard.writeText(digest)
    showStatus('success', 'Weekly digest copied to clipboard!')
  }

  if (!visible) return null

  return (
    <BasePanel
      visible={visible}
      onClose={onClose}
      title="Email Integration"
      ariaLabel="Email integration panel"
      position="right"
      size="lg"
      customStyles={{
        width: '420px',
        maxHeight: '80vh',
      }}
    >
      {/* Status Message */}
      <StatusMessage
        message={statusMessage}
        className="mb-4"
        autoDismiss={true}
        onDismiss={clearStatus}
      />

      {/* Email Configuration */}
      <div role="group" aria-labelledby="email-config-title" style={{ marginBottom: '20px' }}>
        <h3
          id="email-config-title"
          style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}
        >
          Email Configuration
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="email-recipient"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            Recipient (Optional)
          </label>
          <input
            id="email-recipient"
            type="email"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            placeholder="recipient@example.com"
            aria-label="Enter recipient email address"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="email-subject"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            Subject
          </label>
          <input
            id="email-subject"
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder={`Mind Map: ${tree?.content || ''}`}
            aria-label="Enter email subject"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="email-format"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            Email Format
          </label>
          <select
            id="email-format"
            value={format}
            onChange={e => setFormat(e.target.value as EmailFormat)}
            aria-label="Select email format"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            <option value="summary">Summary</option>
            <option value="detailed">Detailed</option>
            <option value="bullet-points">Bullet Points</option>
            <option value="newsletter">Newsletter</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={includeSummary}
              onChange={e => setIncludeSummary(e.target.checked)}
              aria-label="Include summary in email"
            />
            Include Summary
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={includePlainText}
              onChange={e => setIncludePlainText(e.target.checked)}
              aria-label="Include plain text version"
            />
            Include Plain Text
          </label>
        </div>

        <button
          onClick={handleSendEmail}
          aria-label="Open email client with mind map content"
          style={{
            width: '100%',
            padding: '12px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          Open in Email Client
        </button>
      </div>

      {/* Quick Actions */}
      <div role="group" aria-labelledby="quick-actions-title" style={{ marginBottom: '20px' }}>
        <h3
          id="quick-actions-title"
          style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}
        >
          Quick Actions
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleDownloadHTML}
            aria-label="Download mind map as HTML email"
            style={{
              padding: '10px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '16px' }}>📥</span>
            Download HTML Email
          </button>

          <button
            onClick={handleExportTemplate}
            aria-label="Export email template"
            style={{
              padding: '10px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '16px' }}>📋</span>
            Export Email Template
          </button>

          <button
            onClick={handleCopySignature}
            aria-label="Copy email signature to clipboard"
            style={{
              padding: '10px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '16px' }}>✍️</span>
            Copy Email Signature
          </button>

          <button
            onClick={handleWeeklyDigest}
            aria-label="Generate weekly digest and copy to clipboard"
            style={{
              padding: '10px',
              background: '#ec4899',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '16px' }}>📊</span>
            Generate Weekly Digest
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div
        style={{
          padding: '12px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#1e40af',
        }}
      >
        <strong>Email Formats:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>
            <strong>Summary:</strong> Quick overview with stats
          </li>
          <li>
            <strong>Detailed:</strong> Full tree structure
          </li>
          <li>
            <strong>Bullet Points:</strong> Concise list format
          </li>
          <li>
            <strong>Newsletter:</strong> Styled newsletter format
          </li>
        </ul>
      </div>
    </BasePanel>
  )
}
