import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Skillify AI ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.removeItem('skillify_sqlite_data');
    localStorage.removeItem('skillify_auth');
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">refresh</span>
            </div>
            <h1 className="text-xl font-bold">Refreshing Skillify AI</h1>
            <p className="text-xs text-slate-400">
              An unexpected display issue occurred. Click reload to resume seamlessly.
            </p>
            {this.state.error && (
              <div className="p-3 bg-slate-950/80 rounded-xl text-[11px] text-red-400 text-left font-mono overflow-x-auto max-h-32 border border-red-500/20">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                🔄 Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Clear local storage cache"
              >
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
