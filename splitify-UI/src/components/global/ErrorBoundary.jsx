import React, { useState } from "react";

// Internal class (required by React)
class ErrorCatcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error, () =>
        this.setState({ hasError: false, error: null })
      );
    }
    return this.props.children;
  }
}

// Functional wrapper
export default function ErrorBoundary({ children, fallback }) {
  const [key, setKey] = useState(0);

  return (
    <ErrorCatcher
      key={key} // reset when fallback calls reset()
      fallback={(error, reset) =>
        fallback(error, () => {
          reset();
          setKey((k) => k + 1);
        })
      }
    >
      {children}
    </ErrorCatcher>
  );
}
