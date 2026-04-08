import { Component, ReactNode, ErrorInfo } from "react";
import { useNavigate } from "react-router";

interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class PageErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Page Error (${this.props.pageName || 'Unknown'}):`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#000',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>⚠️ Page Error</h1>
          <p style={{ color: '#888' }}>Error loading {this.props.pageName || 'this page'}</p>
          <pre style={{
            background: '#111',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '600px',
            overflow: 'auto',
            fontSize: '12px',
            color: '#ff6b6b'
          }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.history.back()}
              style={{
                padding: '12px 24px',
                background: '#444',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ← Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 24px',
                background: '#8b5cf6',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
          </div>
          <p style={{ color: '#666', fontSize: '14px' }}>Check browser console (F12) for details</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export function PageErrorBoundary({ children, pageName }: Props) {
  return <PageErrorBoundaryClass pageName={pageName}>{children}</PageErrorBoundaryClass>;
}
