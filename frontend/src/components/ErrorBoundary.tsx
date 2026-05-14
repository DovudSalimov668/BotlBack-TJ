import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg text-center">
          <div className="text-5xl mb-4">🔄</div>
          <h1 className="text-xl font-black text-brand-charcoal mb-2">Что-то пошло не так</h1>
          <p className="text-gray-500 text-sm mb-6">Попробуйте перезагрузить страницу</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-red text-white font-black px-6 py-3 rounded-2xl text-sm hover:opacity-90 transition-opacity"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    )
  }
}
