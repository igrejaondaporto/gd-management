import { type ReactNode, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: "danger" | "default";
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  onConfirm,
  onCancel,
  loading = false,
  variant = "default",
}: ConfirmModalProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel, loading]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-4 desktop:items-center"
      onClick={loading ? undefined : onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] animate-slide-up rounded-[18px] bg-card shadow-lg desktop:rounded-2xl"
      >
        <div className="px-5 pt-5 pb-5">
          <div className="mb-3 flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                isDanger ? "bg-rose-soft" : "bg-primary-soft"
              }`}
            >
              <AlertTriangle size={17} className={isDanger ? "text-rose" : "text-primary"} />
            </div>
            <div className="font-display text-[17px] font-bold tracking-[-0.03em] text-ink">
              {title}
            </div>
          </div>
          <div className="font-body text-[13.5px] leading-relaxed text-ink-soft">{message}</div>
        </div>

        <div className="flex gap-2.5 border-t border-line-soft px-5 py-3.5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 cursor-pointer rounded-xl border border-line bg-card px-4 py-2.5 font-body text-[13.5px] font-bold text-ink disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 cursor-pointer rounded-xl border-none px-4 py-2.5 font-body text-[13.5px] font-bold text-white disabled:opacity-60 ${
              isDanger ? "bg-rose" : "bg-primary"
            }`}
          >
            {loading ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
