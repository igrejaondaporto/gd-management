import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught:", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-paper p-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-soft">
            <span className="font-display text-2xl font-bold text-rose">!</span>
          </div>
          <h2 className="font-display text-xl font-bold text-ink">Algo deu errado</h2>
          <p className="mt-2 font-body text-sm text-ink-soft">
            Ocorreu um erro inesperado. Tente recarregar a pagina.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 cursor-pointer rounded-xl bg-primary px-6 py-2.5 font-body text-sm font-bold text-white"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
