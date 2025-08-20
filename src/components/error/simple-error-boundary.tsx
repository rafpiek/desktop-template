'use client';

import React from 'react';

interface SimpleErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface SimpleErrorBoundaryProps {
  children: React.ReactNode;
}

export class SimpleErrorBoundary extends React.Component<SimpleErrorBoundaryProps, SimpleErrorBoundaryState> {
  constructor(props: SimpleErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<SimpleErrorBoundaryState> {
    console.error('🚨 Error Boundary Triggered:', error);
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.group('🚨 Error Boundary Details');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    
    // Check for Tiptap-specific errors
    if (error.message.includes('tiptap') || error.message.includes('view') || error.message.includes('editor')) {
      console.error('🎯 This appears to be an editor-related error');
    }
    console.groupEnd();

    this.setState({
      error,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px',
          border: '2px solid red', 
          borderRadius: '8px',
          backgroundColor: '#ffe6e6',
          fontFamily: 'monospace'
        }}>
          <h2 style={{ color: 'red', margin: '0 0 10px 0' }}>
            ⚠️ Editor Error Caught
          </h2>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer' }}>Stack Trace</summary>
            <pre style={{ 
              fontSize: '12px', 
              overflow: 'auto', 
              maxHeight: '200px',
              backgroundColor: 'white',
              padding: '10px',
              margin: '10px 0',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}