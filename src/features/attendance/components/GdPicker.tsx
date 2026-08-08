import { Church } from "lucide-react";
import type { LeaderGd } from "@/hooks/useLeaderGd";

interface GdPickerProps {
  gds: LeaderGd[];
  selectedGdId: string | null;
  onSelect: (gd: LeaderGd) => void;
}

export function GdPicker({ gds, selectedGdId, onSelect }: GdPickerProps) {
  if (gds.length === 0) return null;

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="mb-1 font-display text-[21px] font-bold text-ink">Seus Grupos</div>
      <div className="mb-4 font-body text-[13.5px] text-ink-soft">
        Selecione o GD que voce quer acessar agora.
      </div>

      <div className="flex flex-col gap-[10px]">
        {gds.map((gd) => (
          <button
            key={gd.gdId}
            onClick={() => onSelect(gd)}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-left transition-colors"
            style={{
              borderColor: selectedGdId === gd.gdId ? "#266BC6" : "#DFD8C0",
              background: selectedGdId === gd.gdId ? "#DCE7F8" : "#FFFFFF",
            }}
          >
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-primary-soft">
              <Church size={19} className="text-primary" />
            </div>
            <div>
              <div className="font-display text-[15px] font-bold text-ink">{gd.gdName}</div>
              <div className="mt-0.5 font-body text-[12px] text-ink-soft">
                Registro de presenca e resumo
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
