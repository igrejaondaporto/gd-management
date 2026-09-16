import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Minus, X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Avatar } from "@/components/ui/Avatar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { supabase } from "@/lib/supabaseClient";
import { monthKey } from "@/lib/utils";
import { categoryColors, colors } from "@/lib/constants";
import type { Week, Category } from "@/types";

interface Props {
  weeks: Week[];
  gdId: string;
}

interface AttendeeRow {
  personId: string;
  name: string;
  categoryAtTime: Category;
}

function useWeekAttendance(weekId: string | undefined) {
  return useQuery({
    queryKey: ["weekAttendance", weekId],
    queryFn: async (): Promise<{
      total: number;
      byCat: Record<Category, number>;
      attendees: AttendeeRow[];
    }> => {
      const empty = {
        total: 0,
        byCat: { visitor: 0, attender: 0, member: 0 } as Record<Category, number>,
        attendees: [] as AttendeeRow[],
      };
      if (!weekId) return empty;
      const { data, error } = await supabase
        .from("attendance")
        .select("person_id, category_at_time, people:person_id(name)")
        .eq("week_id", weekId)
        .order("category_at_time");
      if (error) throw error;
      const byCat: Record<Category, number> = { visitor: 0, attender: 0, member: 0 };
      const attendees: AttendeeRow[] = (data || []).map((r: Record<string, unknown>) => {
        const cat = r.category_at_time as Category;
        byCat[cat]++;
        const p = r.people as unknown as Record<string, unknown> | null;
        return {
          personId: r.person_id as string,
          name: (p?.name as string) || "?",
          categoryAtTime: cat,
        };
      });
      return { total: data?.length || 0, byCat, attendees };
    },
    enabled: !!weekId,
  });
}

function useMonthAttendance(gdId: string | undefined, mKey: string) {
  return useQuery({
    queryKey: ["monthAttendance", gdId, mKey],
    queryFn: async (): Promise<{ weekCount: number; personCounts: Record<string, number> }> => {
      if (!gdId) return { weekCount: 0, personCounts: {} };
      const { data: monthWeeks } = await supabase
        .from("weeks")
        .select("id")
        .eq("gd_id", gdId)
        .gte("date", `${mKey}-01`)
        .lte("date", `${mKey}-31`);
      if (!monthWeeks?.length) return { weekCount: 0, personCounts: {} };
      const weekIds = monthWeeks.map((w) => w.id);
      const { data: att } = await supabase
        .from("attendance")
        .select("person_id")
        .in("week_id", weekIds);
      const counts: Record<string, number> = {};
      (att || []).forEach((a) => {
        counts[a.person_id] = (counts[a.person_id] || 0) + 1;
      });
      return { weekCount: monthWeeks.length, personCounts: counts };
    },
    enabled: !!gdId,
  });
}

export function WeeklySummary({ weeks, gdId }: Props) {
  const qc = useQueryClient();
  // weeks are sorted by date desc (newest first). idx 0 = most recent week.
  const [idx, setIdx] = useState(0);
  const week = weeks[idx];
  // The "previous" week for comparison is the next one in the list (older)
  const prevWeek = idx < weeks.length - 1 ? weeks[idx + 1] : null;
  const { data: curr, isLoading } = useWeekAttendance(week?.id);
  const { data: prev } = useWeekAttendance(prevWeek?.id);
  const delta = curr && prev ? curr.total - prev.total : null;
  const mKey = week ? monthKey(week.date) : "2026-08";
  const { data: monthData } = useMonthAttendance(gdId, mKey);

  // Modal state — attendee removal
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);

  // Modal state — week deletion
  const [deleteWeekConfirm, setDeleteWeekConfirm] = useState(false);

  const removeAttendance = useMutation({
    mutationFn: async (personId: string) => {
      if (!week?.id) return;
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("week_id", week.id)
        .eq("person_id", personId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekAttendance", week?.id] });
      qc.invalidateQueries({ queryKey: ["monthAttendance", gdId, mKey] });
      setRemoveTarget(null);
    },
  });

  const deleteWeek = useMutation({
    mutationFn: async () => {
      if (!week?.id) return;
      const { error: attErr } = await supabase.from("attendance").delete().eq("week_id", week.id);
      if (attErr) throw attErr;
      const { error } = await supabase.from("weeks").delete().eq("id", week.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weeks", gdId] });
      qc.invalidateQueries({ queryKey: ["weekAttendance", week?.id] });
      setDeleteWeekConfirm(false);
      if (idx > 0) setIdx(idx - 1);
    },
  });

  if (!week)
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
      </div>
    );

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="mb-[18px] flex items-center justify-between">
        <IconButton
          onClick={() => setIdx((i) => Math.min(weeks.length - 1, i + 1))}
          label="Semana anterior"
        >
          <ChevronLeft size={20} color={idx === weeks.length - 1 ? colors.inkFaint : colors.ink} />
        </IconButton>
        <div className="text-center">
          <div className="font-body text-[11px] font-bold text-ink-faint uppercase">Semana de</div>
          <div className="font-display text-[19px] font-bold text-ink">{week.label}</div>
        </div>
        <IconButton onClick={() => setIdx((i) => Math.max(0, i - 1))} label="Proxima semana">
          <ChevronRight size={20} color={idx === 0 ? colors.inkFaint : colors.ink} />
        </IconButton>
      </div>

      <div className="mb-[14px] rounded-[22px] bg-brand-grad px-5 py-[18px] text-white">
        <div className="font-body text-[11.5px] font-bold uppercase tracking-[0.5px] opacity-80">
          Total de presentes
        </div>
        <div className="mt-0.5 flex items-baseline gap-[10px]">
          <div className="font-mono text-4xl font-extrabold">
            {isLoading ? "—" : (curr?.total ?? "—")}
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
              {isLoading ? "—" : (curr?.byCat[cat] ?? "—")}
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>Presentes nesta semana</SectionLabel>
      {curr?.attendees.map((a) => {
        const monthCount = monthData?.personCounts[a.personId] ?? 0;
        const totalWeeks = monthData?.weekCount ?? 1;
        return (
          <div
            key={a.personId}
            className="flex items-center justify-between border-b border-line-soft py-[9px]"
          >
            <div className="flex items-center gap-[9px]">
              <Avatar
                name={a.name}
                color={categoryColors[a.categoryAtTime].color}
                bg={categoryColors[a.categoryAtTime].bg}
                size={28}
              />
              <div>
                <div className="font-body text-[13.5px] font-semibold text-ink">{a.name}</div>
                <div
                  className="font-body text-[11px] font-bold"
                  style={{ color: categoryColors[a.categoryAtTime].color }}
                >
                  {categoryColors[a.categoryAtTime].label}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="font-mono text-[13px] font-bold text-ink">
                {monthCount}/{totalWeeks}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRemoveTarget({ id: a.personId, name: a.name });
                }}
                className="cursor-pointer rounded-lg border-none bg-transparent p-1 text-rose/60 active:text-rose sm:hover:text-rose"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        );
      })}
      {(!curr || curr.attendees.length === 0) && (
        <div className="py-3 text-center font-body text-[13px] text-ink-faint">
          Nenhum presente registrado.
        </div>
      )}

      {/* Delete week — subtle action at the bottom */}
      <div className="mt-4 border-t border-line-soft pt-3">
        <button
          onClick={() => setDeleteWeekConfirm(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose/60 bg-transparent px-4 py-2.5 font-body text-[12.5px] font-bold text-rose transition-colors active:bg-rose/10 sm:hover:bg-rose/5"
        >
          Excluir semana de {week.label}
        </button>
      </div>

      <ConfirmModal
        open={!!removeTarget}
        title="Remover presença"
        message={
          <>
            Tem certeza que deseja remover <strong>{removeTarget?.name}</strong>?
          </>
        }
        confirmLabel="Remover"
        onConfirm={() => removeTarget && removeAttendance.mutate(removeTarget.id)}
        onCancel={() => setRemoveTarget(null)}
        loading={removeAttendance.isPending}
        variant="danger"
      />

      <ConfirmModal
        open={deleteWeekConfirm}
        title="Excluir semana"
        message={
          <>
            Tem certeza que deseja excluir a semana de <strong>{week.label}</strong>? Todos os
            registros de presença dessa data serão removidos.
          </>
        }
        confirmLabel="Excluir"
        onConfirm={() => deleteWeek.mutate()}
        onCancel={() => setDeleteWeekConfirm(false)}
        loading={deleteWeek.isPending}
        variant="danger"
      />
    </div>
  );
}
