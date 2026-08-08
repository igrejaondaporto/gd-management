import { useNavigate } from "react-router-dom";
import { MiniStat } from "@/components/ui/MiniStat";
import { Delta } from "@/components/ui/Delta";
import { colors } from "@/lib/constants";
import type { GdWithStaff } from "@/hooks/useGds";

interface PastorHomeProps {
  gds: GdWithStaff[];
}

export function PastorHome({ gds }: PastorHomeProps) {
  const navigate = useNavigate();

  const totalPeople = gds.reduce((s, g) => s + (g.staff?.length || 0), 0);
  const activeGds = gds.filter((g) => g.active).length;

  // Average attendance (placeholder for now)
  const mediaGeral = null;

  return (
    <div className="px-5 pt-[18px] pb-6">
      <div className="font-body text-[12.5px] font-bold text-ink-faint uppercase tracking-[0.5px]">
        Visao geral
      </div>
      <div className="mt-0.5 mb-[18px] font-display text-2xl font-bold text-ink">
        Painel do pastor
      </div>

      <div className="mb-[22px] grid grid-cols-2 gap-[10px]">
        <MiniStat label="Pessoas nos GDs" value={totalPeople} />
        <MiniStat label="GDs ativos" value={`${activeGds}/${gds.length}`} />
        <MiniStat
          label="Media geral de presenca"
          value={mediaGeral !== null ? `${mediaGeral}%` : "—"}
          color={colors.primary}
        />
      </div>

      <div className="mb-3 font-body text-[12.5px] font-bold text-ink-soft uppercase tracking-[0.6px]">
        Grupos de discipulos
      </div>

      <div className="flex flex-col gap-[10px]">
        {gds.map((g) => {
          const lastWeek = null; // placeholder until attendance query
          const delta = null;

          return (
            <button
              key={g.id}
              onClick={() => navigate(`/gd/${g.id}`)}
              className="flex cursor-pointer items-center justify-between rounded-[14px] border border-line bg-card px-[15px] py-[13px] text-left"
            >
              <div>
                <div className="font-display text-[15.5px] font-bold text-ink">{g.name}</div>
                <div className="mt-px font-body text-xs text-ink-faint">
                  {g.staff
                    .filter((s) => s.profileRole === "leader")
                    .map((s) => s.profileName)
                    .join(" e ") || "Sem lider"}
                </div>
              </div>
              <div className="text-right">
                {lastWeek ? (
                  <>
                    <div className="font-mono text-[17px] font-bold text-primary">
                      {/* attendance count here */}?
                    </div>
                    <Delta value={delta} />
                  </>
                ) : (
                  <span className="font-body text-[11.5px] font-semibold text-ink-faint">
                    — sem dados
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {gds.length === 0 && (
          <div className="py-8 text-center font-body text-sm text-ink-faint">
            Nenhum GD encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
