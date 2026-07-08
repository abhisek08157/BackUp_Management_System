import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
          <div className="card card-pad" style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
            <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 16 }}>
              A screen failed to render, likely because of an unexpected data value. Reloading usually fixes this.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload console</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
