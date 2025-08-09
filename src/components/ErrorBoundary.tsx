import React from "react"

type Props = { children: React.ReactNode }

type State = { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h1 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-700 dark:text-gray-300">Try reloading the page or navigating elsewhere.</p>
        </div>
      )
    }
    return this.props.children
  }
}
