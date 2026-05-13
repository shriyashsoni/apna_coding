import React from "react";

/**
 * Simplified InstrumentationProvider that only logs errors to the console.
 * Removes the intrusive Error Dialog popups caused by browser extensions.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Only log if it's not a known extension error
    const stack = info.componentStack || error.stack || "";
    if (!stack.includes("chrome-extension://") && !stack.includes("moz-extension://")) {
      console.error("Application Runtime Error:", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      // In case of a hard crash, show a minimal fallback or nothing to avoid popup noise
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 text-center">
          <div>
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">Please refresh the page or check the console for details.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function InstrumentationProvider({ children }: { children: React.ReactNode }) {
  // We no longer use window-level error listeners that catch extension noise.
  // The ErrorBoundary above will catch actual React render crashes.
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
