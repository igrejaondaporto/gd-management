import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Avatar } from "@/components/ui/Avatar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { supabase } from "@/lib/supabaseClient";
import { monthKey, monthLabel } from "@/lib/utils";
import { categoryColors } from "@/lib/constants";
import type { Person, Week, Category } from "@/types";

const CAT_ORDER: Record<Category, number> = { member: 0, attender: 1, visitor: 2 };

interface WeekAttendance {
  total: number;
  delta: number | null;
  byCat: Record<Category, number>;
}

interface Props {
  weeks: Week[];
  people: Person[];
}

function useWeekAttendanceCounts(weekId: string | undefined) {
  return useQuery({
    queryKey: ["attendance-counts", weekId],
    queryFn: async (): Promise<WeekAttendance> => {
      if (!weekId) return { total: 0, delta: null, byCat: { visitor: 0, attender: 0, member: 0 } };
      const { data, error } = await supabase
        .from("attendance")
        .select("category_at_time")
        .eq("week_id", weekId);

      if (error) throw error;
      const byCat: Record<Category, number> = { visitor: 0, attender: 0, member: 0 };
      (data || []).forEach((r: Record<string, unknown>) => {
        const cat = r.category_at_time as Category;
        if (cat in byCat) byCat[cat]++;
      });
      return { total: data?.length || 0, delta: null, byCat };
    },
    enabled: !!weekId,
  });
}

export function WeeklySummary({ weeks, people }: Props) {
  const [idx, setIdx] = useState(weeks.length > 0 ? weeks.length - 1 : 0);

  // Compute prev
  const prevWeek = idx > 0 ? weeks[idx - 1] : null;

  // Current week attendance
  const week = weeks[idx];
  const { data: currAttendance, isLoading } = useWeekAttendanceCounts(week?.id);
  const { data: prevAttendance } = useWeekAttendanceCounts(prevWeek?.id);

  const delta =
    currAttendance && prevAttendance ? currAttendance.total - prevAttendance.total : null;

  // Per-person stats in selected month
  const mKey = week ? monthKey(week.date) : "2026-08";
  const weeksInMonth = weeks.filter((w) => monthKey(w.date) === mKey);
  const personRows = useMemo(
    () =>
      [...people]
        .sort(
          (a, b) => CAT_ORDER[a.category] - CAT_ORDER[b.category] || a.name.localeCompare(b.name),
        )
        .map((p) => {
          // We'd need per-person present count — placeholder for now
          return { ...p, present: 0, totalWeeks: weeksInMonth.length };
        }),
    [people, weeksInMonth.length],
  );

  if (!week) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-2 h-8 w-8 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
        <div className="font-body text-sm text-ink-faint">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-6">
      {/* Week navigation */}
      <div className="mb-[18px] flex items-center justify-between">
        <IconButton onClick={() => setIdx((i) => Math.max(0, i - 1))} label="Semana anterior">
          <ChevronLeft size={20} color={idx === 0 ? "#9A9A8A" : "#232A21"} />
        </IconButton>
        <div className="text-center">
          <div className="font-body text-[11px] font-bold text-ink-faint uppercase">Semana de</div>
          <div className="font-display text-[19px] font-bold text-ink">{week.label}</div>
        </div>
        <IconButton
          onClick={() => setIdx((i) => Math.min(weeks.length - 1, i + 1))}
          label="Proxima semana"
        >
          <ChevronRight size={20} color={idx === weeks.length - 1 ? "#9A9A8A" : "#232A21"} />
        </IconButton>
      </div>

      {/* Total card */}
      <div className="mb-[14px] rounded-2xl bg-primary px-5 py-[18px] text-white">
        <div className="font-body text-[11.5px] font-bold opacity-80 uppercase tracking-[0.5px]">
          Total de presentes
        </div>
        <div className="mt-0.5 flex items-baseline gap-[10px]">
          <div className="font-mono text-4xl font-bold">
            {isLoading ? "—" : (currAttendance?.total ?? "—")}
          </div>
          {delta !== null && (
            <span className="flex items-center gap-[3px] font-body text-[12.5px] font-bold opacity-90">
              {delta > 0 ? (
                <ArrowUp size={13} />
              ) : delta < 0 ? (
                <ArrowDown size={13} />
              ) : (
                <Minus size={13} />
              )}
              {delta === 0 ? "igual a semana anterior" : `${Math.abs(delta)} vs. semana anterior`}
            </span>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mb-5 flex gap-[10px]">
        {(["visitor", "attender", "member"] as Category[]).map((cat) => (
          <div
            key={cat}
            className="flex flex-1 flex-col rounded-xl px-3 py-[10px]"
            style={{ background: categoryColors[cat].bg }}
          >
            <div
              className="font-body text-[10.5px] font-bold"
              style={{ color: categoryColors[cat].color }}
            >
              {categoryColors[cat].label}s
            </div>
            <div
              className="mt-0.5 font-mono text-lg font-bold"
              style={{ color: categoryColors[cat].color }}
            >
              {isLoading ? "—" : (currAttendance?.byCat[cat] ?? "—")}
            </div>
          </div>
        ))}
      </div>

      {/* Per-person frequency */}
      <SectionLabel hint={`Presencas em ${monthLabel(mKey)}`}>Frequencia por pessoa</SectionLabel>
      <div>
        {personRows.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between border-b border-line-soft py-[9px]"
          >
            <div className="flex items-center gap-[9px]">
              <Avatar
                name={p.name}
                color={categoryColors[p.category].color}
                bg={categoryColors[p.category].bg}
                size={28}
              />
              <div>
                <div className="font-body text-[13.5px] font-semibold text-ink">{p.name}</div>
                <div
                  className="font-body text-[11px] font-bold"
                  style={{ color: categoryColors[p.category].color }}
                >
                  {categoryColors[p.category].label}
                </div>
              </div>
            </div>
            <div className="font-mono text-[13px] font-bold text-ink">
              {p.present}/{p.totalWeeks || 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
