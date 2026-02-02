import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StatusMessage from './StatusMessage'

describe('StatusMessage', () => {
  const successMessage = { type: 'success' as const, text: 'Operation successful' }
  const errorMessage = { type: 'error' as const, text: 'An error occurred' }
  const warningMessage = { type: 'warning' as const, text: 'Warning: Check your input' }
  const infoMessage = { type: 'info' as const, text: 'Information message' }

  it('should not render when message is null', () => {
    const { container } = render(<StatusMessage message={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render success message with correct styling', () => {
    render(<StatusMessage message={successMessage} />)

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Operation successful')
    expect(alert).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800')
  })

  it('should render error message with correct styling', () => {
    render(<StatusMessage message={errorMessage} />)

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('An error occurred')
    expect(alert).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800')
  })

  it('should render warning message with correct styling', () => {
    render(<StatusMessage message={warningMessage} />)

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Warning: Check your input')
    expect(alert).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800')
  })

  it('should render info message with correct styling', () => {
    render(<StatusMessage message={infoMessage} />)

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Information message')
    expect(alert).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800')
  })

  it('should apply custom className', () => {
    render(<StatusMessage message={successMessage} className="custom-class" />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('custom-class')
  })

  it('should show dismiss button when onDismiss is provided', () => {
    const onDismiss = vi.fn()
    render(<StatusMessage message={successMessage} onDismiss={onDismiss} />)

    const dismissButton = screen.getByLabelText('Dismiss message')
    expect(dismissButton).toBeInTheDocument()
  })

  it('should not show dismiss button when onDismiss is not provided', () => {
    render(<StatusMessage message={successMessage} />)

    const dismissButton = screen.queryByLabelText('Dismiss message')
    expect(dismissButton).not.toBeInTheDocument()
  })

  it('should call onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(<StatusMessage message={successMessage} onDismiss={onDismiss} />)

    const dismissButton = screen.getByLabelText('Dismiss message')
    await user.click(dismissButton)

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('should auto-dismiss when autoDismiss is true', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()

    render(
      <StatusMessage
        message={successMessage}
        autoDismiss={true}
        autoDismissDelay={100}
        onDismiss={onDismiss}
      />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()

    vi.advanceTimersByTime(100)

    expect(onDismiss).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('should not auto-dismiss when autoDismiss is false', async () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()

    render(
      <StatusMessage
        message={successMessage}
        autoDismiss={false}
        autoDismissDelay={100}
        onDismiss={onDismiss}
      />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()

    vi.advanceTimersByTime(100)

    expect(onDismiss).not.toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('should use custom auto-dismiss delay', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()

    render(
      <StatusMessage
        message={successMessage}
        autoDismiss={true}
        autoDismissDelay={2000}
        onDismiss={onDismiss}
      />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()

    vi.advanceTimersByTime(1000)
    expect(onDismiss).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(onDismiss).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('should have proper accessibility attributes', () => {
    render(<StatusMessage message={successMessage} />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'polite')
    expect(alert).toHaveAttribute('aria-atomic', 'true')
  })

  it('should handle message changes correctly', () => {
    const { rerender } = render(<StatusMessage message={null} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    rerender(<StatusMessage message={successMessage} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Operation successful')

    rerender(<StatusMessage message={errorMessage} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('An error occurred')

    rerender(<StatusMessage message={null} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
