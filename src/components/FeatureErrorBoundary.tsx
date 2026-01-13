import { Component, ErrorInfo, ReactNode } from 'react'

interface FeatureErrorBoundaryProps {
  name: string
  fallback?: ReactNode
  onError?: (error: Error) => void
  children: ReactNode
}

interface FeatureErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * FeatureErrorBoundary - A reusable error boundary for feature components
 *
 * Wraps heavy or complex features to prevent cascading failures.
 * Displays a fallback UI when errors occur, with optional retry functionality.
 *
 * @example
 * ```tsx
 * <FeatureErrorBoundary name="AIAssistant" onError={(error) => console.error(error)}>
 *   <AIAssistantPanel />
 * </FeatureErrorBoundary>
 * ```
 */
export default class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error(`FeatureErrorBoundary caught error in ${this.props.name}:`, error)
      console.error('Error Info:', errorInfo)
    }

    // Call custom error handler if provided
    this.props.onError?.(error)

    // TODO: Send to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo, this.props.name);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    const { hasError, error } = this.state
    const { name, fallback, children } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: '16px',
            margin: '16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              Something went wrong
            </h3>
          </div>

          <p style={{ fontSize: '14px', marginBottom: '8px' }}>
            The <strong>{name}</strong> feature encountered an error.
          </p>

          {error && import.meta.env.DEV && (
            <details style={{ marginBottom: '12px' }}>
              <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                Error Details
              </summary>
              <pre
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  background: '#fff',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {error.toString()}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}

          <p style={{ fontSize: '13px', marginBottom: '12px', color: '#b91c1c' }}>
            Please try refreshing the page. If the problem persists, contact support.
          </p>

          <button
            onClick={this.handleRetry}
            style={{
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Try Again
          </button>
        </div>
      )
    }

    return <>{children}</>
  }
}
