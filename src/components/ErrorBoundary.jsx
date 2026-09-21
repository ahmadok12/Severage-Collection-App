import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-slate-900">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl border border-slate-200 shadow-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Notice</h2>
            <p className="text-xs text-slate-500 mb-4">
              The application encountered a display refresh state. Tapping below will refresh the view.
            </p>
            {this.state.error?.message && (
              <pre className="text-[10px] bg-slate-50 p-2.5 rounded-xl text-slate-600 font-mono mb-4 text-left overflow-x-auto border border-slate-100">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-97 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Refresh & Reset App</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
