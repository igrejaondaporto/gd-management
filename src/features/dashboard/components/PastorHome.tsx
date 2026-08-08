import { MiniStat } from "@/components/ui/MiniStat";
import { colors } from "@/lib/constants";
import type { GdWithStaff } from "@/hooks/useGds";

interface PastorHomeProps {
  gds: GdWithStaff[];
}

export function PastorHome({ gds }: PastorHomeProps) {
  const totalPeople = gds.reduce((s, g) => s + (g.staff?.length || 0), 0);
  const activeGds = gds.filter((g) => g.active).length;
  const mediaGeral = null;

  return (
    <div className="px-5 pt-[18px] pb-6">
      <div className="font-body text-[12.5px] font-bold text-ink-faint uppercase tracking-[0.5px]">
        Visao geral
      </div>
      <div className="mt-0.5 mb-[18px] font-display text-2xl font-bold text-ink">
        Painel do pastor
      </div>

      <div className="grid grid-cols-2 gap-[10px]">
        <MiniStat label="Pessoas nos GDs" value={totalPeople} />
        <MiniStat label="GDs ativos" value={`${activeGds}/${gds.length}`} />
        <MiniStat
          label="Media geral de presenca"
          value={mediaGeral !== null ? `${mediaGeral}%` : "—"}
          color={colors.primary}
        />
      </div>
    </div>
  );
}
