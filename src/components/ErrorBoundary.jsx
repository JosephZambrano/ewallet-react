import { Component } from 'react'

// Los Error Boundaries DEBEN ser clases — no se pueden hacer con hooks
// Capturan errores de cualquier componente hijo
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  // Se ejecuta cuando un hijo lanza un error
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturó:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4 p-6">
          <p className="text-3xl">⚠️</p>
          <p className="text-sm font-medium text-[var(--color-txt-primary)]">
            Algo salió mal en esta página
          </p>
          <p className="text-xs text-[var(--color-accent-red)] text-center font-mono bg-red-500/10 px-4 py-2 rounded-lg max-w-md">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-xs text-[var(--color-accent-blue)] hover:underline"
          >
            Intentar de nuevo
          </button>
        </div>
      )
    }
    return this.props.children
  }
}