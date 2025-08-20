'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface EditorErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => React.ReactNode;
}

export class EditorErrorBoundary extends React.Component<EditorErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log detailed error information for debugging
    console.group('🚨 Editor Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Stack:', error.stack);
    console.groupEnd();

    // Check if this is the specific Tiptap error we're trying to fix
    if (error.message.includes('editor view is not available') || 
        error.message.includes('Cannot access view[')) {
      console.warn('🎯 This appears to be a Tiptap editor view timing issue');
      console.info('💡 The safe editor utilities should prevent this error');
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo!);
      }

      // Default error display
      return (
        <div className="p-8 bg-destructive/10 border border-destructive/20 rounded-lg m-4">
          <h2 className="text-xl font-bold text-destructive mb-4">
            ⚠️ Editor Error
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Error Message:</h3>
              <div className="bg-background p-3 rounded border font-mono text-sm">
                {this.state.error.message}
              </div>
            </div>

            {this.state.error.stack && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Stack Trace:</h3>
                <div className="bg-background p-3 rounded border font-mono text-xs max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                </div>
              </div>
            )}

            {this.state.errorInfo?.componentStack && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Component Stack:</h3>
                <div className="bg-background p-3 rounded border font-mono text-xs max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components that want to handle errors
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.group('🚨 Manual Error Handler');
    console.error('Error:', error);
    if (errorInfo) {
      console.error('Error Info:', errorInfo);
    }
    console.groupEnd();
  }, []);
}