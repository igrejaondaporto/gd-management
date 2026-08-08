import { type ReactNode } from "react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className = "" }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-primary border-t-transparent ${className}`}
      style={{
        width: size,
        height: size,
        borderWidth: Math.max(2.5, size * 0.1),
      }}
    />
  );
}

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Carregando..." }: PageLoaderProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <Spinner size={28} />
      <span className="font-body text-sm text-ink-faint">{message}</span>
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-rose-soft">
        <span className="font-display text-xl font-bold text-rose">!</span>
      </div>
      <p className="font-body text-sm text-ink-soft">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 cursor-pointer rounded-lg border border-line bg-card px-4 py-2 font-body text-xs font-semibold text-ink-soft"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      {icon}
      <div className="mt-3 font-display text-[17px] font-bold text-ink">{title}</div>
      {description && (
        <div className="mt-1 font-body text-[13px] text-ink-faint">{description}</div>
      )}
    </div>
  );
}
