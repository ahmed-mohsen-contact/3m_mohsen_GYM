import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Catches render-time errors anywhere in the tree and shows a readable
 * fallback instead of a blank white/black page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the error for debugging tools without crashing the app.
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  private handleReload = (): void => {
    window.location.assign('/')
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center">
        <p className="font-display text-3xl font-semibold uppercase tracking-wide text-white">
          Something broke
        </p>
        <p className="max-w-md text-sm text-zinc-400">
          {error.message || 'An unexpected error occurred while rendering this page.'}
        </p>
        <button type="button" className="btn btn-primary" onClick={this.handleReload}>
          Back to home
        </button>
      </div>
    )
  }
}