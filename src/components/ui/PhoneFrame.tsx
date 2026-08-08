import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Church, ChevronLeft } from "lucide-react";

interface PhoneFrameProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
  bottomSlot?: ReactNode;
}

export function PhoneFrame({
  children,
  title,
  subtitle,
  onBack,
  rightSlot,
  bottomSlot,
}: PhoneFrameProps) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex w-full max-w-full h-full flex-col bg-paper sm:h-auto sm:max-w-[430px] sm:min-h-[700px] sm:rounded-[26px] sm:border sm:border-line sm:shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 sm:px-5 sm:pt-4">
        {/* Back button or home icon */}
        {onBack ? (
          <button
            onClick={onBack}
            className="flex shrink-0 cursor-pointer items-center gap-1 border-none bg-transparent p-1 font-body text-xs font-bold text-primary"
          >
            <ChevronLeft size={18} />
          </button>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="flex shrink-0 cursor-pointer items-center justify-center rounded-[9px] border-none bg-primary p-0"
            style={{ width: 30, height: 30 }}
            aria-label="Ir para inicio"
          >
            <Church size={16} color="#fff" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate text-[10.5px] font-bold text-ink-faint tracking-[0.3px]">
            PRESENÇA GD
          </div>
          <div className="mt-[-1px] truncate text-[12.5px] font-bold text-ink">{title}</div>
        </div>

        {subtitle && (
          <span className="shrink-0 text-[11px] font-semibold text-ink-soft">{subtitle}</span>
        )}

        {rightSlot}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-h-0">
        {children}
      </div>

      {/* Bottom slot (e.g. BottomNav) */}
      {bottomSlot}
    </div>
  );
}
