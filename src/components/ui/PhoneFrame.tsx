import { type ReactNode } from "react";
import { Church } from "lucide-react";
import { Pill } from "./Pill";

interface PhoneFrameProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  badge?: { label: string; color: string; bg: string };
  onBack?: () => void;
}

export function PhoneFrame({
  children,
  title,
  subtitle,
  badge,
  onBack,
}: PhoneFrameProps) {
  return (
    <div className="mx-auto flex w-full max-w-[430px] min-h-[700px] flex-col overflow-hidden rounded-[26px] border border-line bg-paper shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-5 pt-4">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-primary">
          <Church size={16} color="#fff" />
        </div>
        <div>
          <div className="text-[10.5px] font-bold text-ink-faint tracking-[0.3px]">
            PRESENCA GD
          </div>
          <div className="mt-[-1px] text-[12.5px] font-bold text-ink">
            {title}
          </div>
        </div>
        {subtitle && (
          <span className="ml-1 text-[11px] font-semibold text-ink-soft">
            {subtitle}
          </span>
        )}
        {onBack && (
          <button
            onClick={onBack}
            className="ml-auto flex cursor-pointer items-center gap-[3px] border-none bg-transparent font-body text-xs font-bold text-primary"
          >
            voltar
          </button>
        )}
        {badge && (
          <Pill color={badge.color} bg={badge.bg}>
            {badge.label}
          </Pill>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
        {children}
      </div>
    </div>
  );
}
