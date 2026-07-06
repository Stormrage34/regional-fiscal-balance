import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl p-6 text-center bg-card border border-card">
          <span className="text-tertiary text-xs font-mono">{this.props.fallback || 'Section unavailable — try refreshing'}</span>
        </div>
      );
    }
    return this.props.children;
  }
}
