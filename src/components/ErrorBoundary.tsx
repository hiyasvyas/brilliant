import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches render-time and lazy-chunk-load failures so the app shows a
 * recoverable message instead of a blank white screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-page">
          <h1>Something went wrong</h1>
          <p>That screen failed to load. This is usually fixed by reloading.</p>
          <button type="button" className="btn primary full" onClick={this.handleReload}>
            Reload app
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
