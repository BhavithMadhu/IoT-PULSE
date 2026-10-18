import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '24px',
          margin: '20px 0',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#f87171'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <AlertTriangle size={20} />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              {this.props.title || 'Component Rendering Error'}
            </h4>
          </div>
          <p style={{ margin: '0 0 14px 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <RefreshCw size={14} />
            Retry Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
