import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmailIntegrationPanel from './EmailIntegrationPanel'
import * as emailUtils from '../utils/emailIntegration'

// Mock the email utilities
vi.mock('../utils/emailIntegration', () => ({
  sendEmail: vi.fn(),
  downloadEmailHTML: vi.fn(),
  exportEmailTemplate: vi.fn(),
  generateWeeklyDigest: vi.fn(),
  generateEmailSignature: vi.fn(),
}))

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(),
}
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
})

// Mock tree data
const mockTree = {
  id: 'root',
  content: 'Test Mind Map',
  children: [],
  position: { x: 0, y: 0 },
  style: {},
}

describe('EmailIntegrationPanel', () => {
  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
    tree: mockTree,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementations
    ;(emailUtils.sendEmail as any).mockImplementation(() => {})
    ;(emailUtils.downloadEmailHTML as any).mockImplementation(() => {})
    ;(emailUtils.exportEmailTemplate as any).mockImplementation(() => {})
    ;(emailUtils.generateWeeklyDigest as any).mockReturnValue('Weekly digest content')
    ;(emailUtils.generateEmailSignature as any).mockReturnValue('Email signature')
  })

  it('should render the panel when visible is true', () => {
    render(<EmailIntegrationPanel {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Email integration panel')).toBeInTheDocument()
    expect(screen.getByText('Email Integration')).toBeInTheDocument()
  })

  it('should not render the panel when visible is false', () => {
    render(<EmailIntegrationPanel {...defaultProps} visible={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should send email when Open in Email Client is clicked', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const sendButton = screen.getByLabelText('Open email client with mind map content')
    await user.click(sendButton)

    expect(emailUtils.sendEmail).toHaveBeenCalledWith(mockTree, {
      recipient: '',
      subject: 'Mind Map: Test Mind Map',
      includeSummary: true,
      includePlainText: true,
      includeHTML: true,
      format: 'summary',
    })

    // Check for success message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Opening email client...')).toBeInTheDocument()
    })
  })

  it('should show error when sending email without tree', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} tree={null} />)

    const sendButton = screen.getByLabelText('Open email client with mind map content')
    await user.click(sendButton)

    expect(emailUtils.sendEmail).not.toHaveBeenCalled()

    // Check for error message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('No mind map to send')).toBeInTheDocument()
    })
  })

  it('should download HTML email when Download HTML Email is clicked', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const downloadButton = screen.getByLabelText('Download mind map as HTML email')
    await user.click(downloadButton)

    expect(emailUtils.downloadEmailHTML).toHaveBeenCalledWith(mockTree)

    // Check for success message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('HTML email downloaded!')).toBeInTheDocument()
    })
  })

  it('should export email template when Export Email Template is clicked', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const exportButton = screen.getByLabelText('Export email template')
    await user.click(exportButton)

    expect(emailUtils.exportEmailTemplate).toHaveBeenCalledWith(mockTree)

    // Check for success message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Email template exported!')).toBeInTheDocument()
    })
  })

  it('should copy email signature to clipboard when Copy Email Signature is clicked', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const copyButton = screen.getByLabelText('Copy email signature to clipboard')
    await user.click(copyButton)

    expect(emailUtils.generateEmailSignature).toHaveBeenCalledWith(mockTree)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Email signature')

    // Check for success message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Signature copied to clipboard!')).toBeInTheDocument()
    })
  })

  it('should generate weekly digest when Generate Weekly Digest is clicked', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const digestButton = screen.getByLabelText('Generate weekly digest and copy to clipboard')
    await user.click(digestButton)

    expect(emailUtils.generateWeeklyDigest).toHaveBeenCalledWith(
      mockTree,
      expect.any(Date), // startDate
      expect.any(Date) // endDate
    )
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Weekly digest content')

    // Check for success message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Weekly digest copied to clipboard!')).toBeInTheDocument()
    })
  })

  it('should update recipient email when typed', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const recipientInput = screen.getByLabelText('Enter recipient email address')
    await user.type(recipientInput, 'test@example.com')

    expect(recipientInput).toHaveValue('test@example.com')
  })

  it('should update subject when typed', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const subjectInput = screen.getByLabelText('Enter email subject')
    await user.type(subjectInput, 'Important Update')

    expect(subjectInput).toHaveValue('Important Update')
  })

  it('should update email format when selected', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const formatSelect = screen.getByLabelText('Select email format')
    expect(formatSelect).toHaveValue('summary')

    await user.selectOptions(formatSelect, 'detailed')
    expect(formatSelect).toHaveValue('detailed')
  })

  it('should toggle include summary checkbox', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const summaryCheckbox = screen.getByLabelText('Include summary in email')
    expect(summaryCheckbox).toBeChecked()

    await user.click(summaryCheckbox)
    expect(summaryCheckbox).not.toBeChecked()
  })

  it('should toggle include plain text checkbox', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const plainTextCheckbox = screen.getByLabelText('Include plain text version')
    expect(plainTextCheckbox).toBeChecked()

    await user.click(plainTextCheckbox)
    expect(plainTextCheckbox).not.toBeChecked()
  })

  it('should use custom subject when provided', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const subjectInput = screen.getByLabelText('Enter email subject')
    const sendButton = screen.getByLabelText('Open email client with mind map content')

    await user.type(subjectInput, 'Custom Subject')
    await user.click(sendButton)

    expect(emailUtils.sendEmail).toHaveBeenCalledWith(mockTree, {
      recipient: '',
      subject: 'Custom Subject',
      includeSummary: true,
      includePlainText: true,
      includeHTML: true,
      format: 'summary',
    })
  })

  it('should use custom recipient when provided', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const recipientInput = screen.getByLabelText('Enter recipient email address')
    const sendButton = screen.getByLabelText('Open email client with mind map content')

    await user.type(recipientInput, 'recipient@example.com')
    await user.click(sendButton)

    expect(emailUtils.sendEmail).toHaveBeenCalledWith(mockTree, {
      recipient: 'recipient@example.com',
      subject: 'Mind Map: Test Mind Map',
      includeSummary: true,
      includePlainText: true,
      includeHTML: true,
      format: 'summary',
    })
  })

  it('should use selected format when sending email', async () => {
    const user = userEvent.setup()
    render(<EmailIntegrationPanel {...defaultProps} />)

    const formatSelect = screen.getByLabelText('Select email format')
    const sendButton = screen.getByLabelText('Open email client with mind map content')

    await user.selectOptions(formatSelect, 'newsletter')
    await user.click(sendButton)

    expect(emailUtils.sendEmail).toHaveBeenCalledWith(mockTree, {
      recipient: '',
      subject: 'Mind Map: Test Mind Map',
      includeSummary: true,
      includePlainText: true,
      includeHTML: true,
      format: 'newsletter',
    })
  })

  it('should close panel when close button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnClose = vi.fn()
    render(<EmailIntegrationPanel {...defaultProps} onClose={mockOnClose} />)

    const closeButton = screen.getByLabelText('Close panel')
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should show email format descriptions in help text', () => {
    render(<EmailIntegrationPanel {...defaultProps} />)

    expect(screen.getByText('Email Formats:')).toBeInTheDocument()
    expect(screen.getByText('Summary:')).toBeInTheDocument()
    expect(screen.getByText('Quick overview with stats')).toBeInTheDocument()
    expect(screen.getByText('Detailed:')).toBeInTheDocument()
    expect(screen.getByText('Full tree structure')).toBeInTheDocument()
    expect(screen.getByText('Bullet Points:')).toBeInTheDocument()
    expect(screen.getByText('Concise list format')).toBeInTheDocument()
    expect(screen.getByText('Newsletter:')).toBeInTheDocument()
    expect(screen.getByText('Styled newsletter format')).toBeInTheDocument()
  })
})
