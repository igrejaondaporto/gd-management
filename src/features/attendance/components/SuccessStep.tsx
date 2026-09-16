import { CheckCircle2 } from "lucide-react";
import { MiniStat } from "@/components/ui/MiniStat";
import { colors } from "@/lib/constants";

interface SuccessStepProps {
  total: number;
  delta: number | null;
  gdName: string;
  nextLabel: string;
  onExit: () => void;
}

export function SuccessStep({ total, delta, gdName, nextLabel, onExit }: SuccessStepProps) {
  const deltaColor =
    delta === null
      ? colors.inkFaint
      : delta > 0
        ? colors.green
        : delta < 0
          ? colors.gold
          : colors.inkFaint;
  const deltaText =
    delta === null ? "—" : delta > 0 ? `+${delta}` : delta < 0 ? String(delta) : "0";
  const deltaLabel =
    delta === null ? "Variacao" : delta > 0 ? "A mais" : delta < 0 ? "A menos" : "Igual";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="stamp-pop-big mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-primary-soft">
        <CheckCircle2 size={40} color={colors.primary} strokeWidth={2.2} />
      </div>
      <div className="font-display text-[22px] font-bold text-ink">Presenca registrada</div>
      <div className="mt-[6px] mb-5 font-body text-[13.5px] text-ink-soft">
        Semana de {nextLabel} — {gdName}
      </div>
      <div className="mb-[22px] flex gap-[10px]">
        <MiniStat label="Presentes" value={total} color={colors.primary} />
        <MiniStat label={deltaLabel} value={deltaText} color={deltaColor} />
      </div>
      <button onClick={onExit} className="btn">
        Voltar ao início
      </button>
    </div>
  );
}
