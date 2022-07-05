import { Component } from "react";

// https://reactjs.org/docs/error-boundaries.html
// https://codepen.io/gaearon/pen/wqvxGa?editors=0010
export class ErrorBoundary extends Component<{children: any, hidden: boolean}, {error:any, errorInfo:any}> {
  constructor(props: {children: any, hidden: boolean}) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  override componentDidCatch(error: any, errorInfo: any) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    // You can also log error messages to an error reporting service here
  }

  override render() {
    if (this.state.errorInfo) {
      if(this.props.hidden) return <></>;
      // Error path
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}
