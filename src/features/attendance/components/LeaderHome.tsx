import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { MiniStat } from "@/components/ui/MiniStat";
import { endOfMonth, monthKey, startOfMonth } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { MONTHS_PT, colors } from "@/lib/constants";
import type { Person, Week } from "@/types";

interface LeaderHomeProps {
  gdId: string;
  people: Person[];
  weeks: Week[];
  onStartFlow: () => void;
  readOnly?: boolean;
  onViewSummary?: () => void;
}

function useWeekPresentCount(weekId: string | undefined) {
  return useQuery({
    queryKey: ["weekPresentCount", weekId],
    queryFn: async () => {
      if (!weekId) return 0;
      const { count, error } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("week_id", weekId);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!weekId,
  });
}

function useMonthStats(gdId: string | undefined, mKey: string) {
  return useQuery({
    queryKey: ["monthStats", gdId, mKey],
    queryFn: async () => {
      if (!gdId) return { weekCount: 0, avg: 0 };
      const { data: monthWeeks, error: weeksErr } = await supabase
        .from("weeks")
        .select("id")
        .eq("gd_id", gdId)
        .gte("date", startOfMonth(mKey))
        .lte("date", endOfMonth(mKey));
      if (weeksErr) throw weeksErr;
      if (!monthWeeks?.length) return { weekCount: 0, avg: 0 };

      let total = 0;
      for (const w of monthWeeks) {
        const { count } = await supabase
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .eq("week_id", w.id);
        total += count ?? 0;
      }
      return { weekCount: monthWeeks.length, avg: Math.round(total / monthWeeks.length) };
    },
    enabled: !!gdId,
  });
}

export function LeaderHome({
  gdId,
  people,
  weeks,
  onStartFlow,
  readOnly = false,
  onViewSummary,
}: LeaderHomeProps) {
  const navigate = useNavigate();
  const lastWeek = weeks.length > 0 ? weeks[0] : null;

  const currentMonthKey = lastWeek ? monthKey(lastWeek.date) : "2026-08";
  const newMembers = people.filter(
    (p) => p.category === "member" && p.memberSince && monthKey(p.memberSince) === currentMonthKey,
  ).length;
  const monthName = MONTHS_PT[parseInt(currentMonthKey.split("-")[1], 10) - 1];

  const { data: presentCount } = useWeekPresentCount(lastWeek?.id);
  const { data: monthStats } = useMonthStats(gdId, currentMonthKey);

  return (
    <div className="px-5 pt-[18px] pb-6">
      {!readOnly && (
        <button
          onClick={onStartFlow}
          className="mb-4 flex w-full cursor-pointer items-center justify-between rounded-[22px] border-none bg-brand-grad px-[18px] py-[18px] text-white"
        >
          <div className="text-left">
            <div className="font-body text-[11px] font-bold uppercase tracking-[0.5px] opacity-75">
              Registro semanal
            </div>
            <div className="mt-0.5 font-display text-[19px] font-extrabold tracking-[-0.03em]">
              Registrar <em className="destaque">presença</em>
            </div>
          </div>
          <ClipboardList size={26} />
        </button>
      )}

      <button
        onClick={onViewSummary}
        className="mb-4 w-full cursor-pointer rounded-[22px] border-none bg-primary-soft px-4 py-[16px] text-left"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-body text-[11.5px] font-bold text-primary/70">
              {lastWeek ? "Última semana registrada" : "Nenhuma semana"}
            </div>
            <div className="mt-px font-display text-base font-bold tracking-[-0.02em] text-ink">
              {lastWeek ? lastWeek.label : "toque para ver"}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[22px] font-bold text-primary">
              {presentCount ?? "—"}
            </div>
            <div className="font-body text-[10.5px] text-ink-soft">presentes</div>
          </div>
        </div>
      </button>

      <div className="mb-5 flex gap-[10px]">
        <MiniStat
          label="Pessoas no GD"
          value={people.length}
          onClick={() => navigate(`/gd/${gdId}/people`)}
        />
        <MiniStat
          label={`Media em ${monthName}`}
          value={monthStats?.weekCount ? monthStats.avg : "—"}
          color={colors.primary}
        />
        <MiniStat label="Novos membros" value={newMembers} color={colors.gold} />
      </div>
    </div>
  );
}
