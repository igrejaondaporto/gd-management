import { Church } from "lucide-react";
import { colors } from "@/lib/constants";
import type { LeaderGd } from "@/hooks/useLeaderGd";
import type { ReactNode } from "react";

interface GdPickerProps {
  gds: LeaderGd[];
  selectedGdId: string | null;
  onSelect: (gd: LeaderGd) => void;
  /** Line under the GD name. `null` hides it — the supervisor/pastor list
   *  swaps it for the status summary, which is the more useful second line. */
  subtitle?: string | null;
  /** Optional status line per GD, keyed by id. Only supervisors/pastors get
   *  them — a leader sees the plain list, which is why this is a prop and not
   *  something the picker fetches itself. */
  badges?: Record<string, ReactNode>;
}

export function GdPicker({
  gds,
  selectedGdId,
  onSelect,
  subtitle = "Registro de presença e resumo",
  badges,
}: GdPickerProps) {
  if (gds.length === 0) return null;

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="mb-1 font-display text-[21px] font-bold tracking-[-0.03em] text-ink">
        Seus grupos
      </div>
      <div className="mb-4 font-body text-[13.5px] text-ink-soft">
        Escolhe o grupo que queres abrir agora.
      </div>

      <div className="flex flex-col gap-[10px]">
        {gds.map((gd) => (
          <button
            key={gd.gdId}
            onClick={() => onSelect(gd)}
            className="flex cursor-pointer items-center gap-3 rounded-[20px] border p-4 text-left transition-colors"
            style={{
              borderColor: selectedGdId === gd.gdId ? colors.primary : colors.line,
              background: selectedGdId === gd.gdId ? colors.primarySoft : colors.paper,
            }}
          >
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[14px] bg-primary-soft">
              <Church size={19} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[15px] font-bold tracking-[-0.02em] text-ink">
                {gd.gdName}
              </div>
              {subtitle && (
                <div className="mt-0.5 font-body text-[12px] text-ink-soft">{subtitle}</div>
              )}
              {badges?.[gd.gdId] && <div className="mt-1.5">{badges[gd.gdId]}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
