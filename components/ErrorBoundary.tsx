import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkLoadError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    isChunkLoadError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    const isChunkLoadError = error.name === 'ChunkLoadError' || 
                             Boolean(error.message && error.message.includes('Failed to fetch dynamically imported module')) ||
                             Boolean(error.message && error.message.includes('Importing a module script failed'));
    
    return { hasError: true, isChunkLoadError };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    if (this.state.isChunkLoadError) {
      // Force a hard reload to get the new chunks
      window.location.reload();
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.state.isChunkLoadError) {
        // Render nothing or a loading spinner while reloading
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
            <i className="fas fa-exclamation-triangle text-2xl text-rose-500"></i>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-4">Oops! Something went wrong.</h1>
          <p className="text-slate-400 mb-8 max-w-md">
            We encountered an unexpected error. This usually happens when the app has been updated.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-colors shadow-lg shadow-indigo-600/20"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
