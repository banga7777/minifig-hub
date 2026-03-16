
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <i className="fas fa-exclamation-triangle text-rose-500 text-2xl"></i>
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest mb-2 italic">Something went wrong</h1>
          <p className="text-slate-400 text-xs max-w-xs mb-8 leading-relaxed">
            The application encountered an unexpected error. This might be due to a connection issue or a temporary glitch.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-500 transition-all active:scale-95"
          >
            Refresh App
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-8 p-4 bg-black/40 rounded-xl text-[10px] text-rose-400 font-mono text-left overflow-auto max-w-full">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
