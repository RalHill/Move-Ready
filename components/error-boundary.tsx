"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: unknown) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo,
      })
    );

    try {
      await fetch("/api/error-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error_message: error.message,
          error_stack: error.stack,
          context: { componentStack: errorInfo },
        }),
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg border border-danger-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={32} className="text-danger-600" />
              <h1 className="text-2xl font-semibold text-gray-900">
                Something went wrong
              </h1>
            </div>
            <p className="text-gray-600 mb-6">
              An unexpected error occurred. The error has been logged and will
              be investigated.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary-800 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
