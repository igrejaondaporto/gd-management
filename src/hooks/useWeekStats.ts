import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { endOfMonth, startOfMonth } from "@/lib/utils";
import type { Category } from "@/types";

export interface WeekStats {
  total: number;
  byCat: Record<Category, number>;
  personIds: Set<string>;
}

export function useWeekStats(weekId: string | undefined) {
  return useQuery({
    queryKey: ["weekStats", weekId],
    queryFn: async (): Promise<WeekStats> => {
      const empty = {
        total: 0,
        byCat: { visitor: 0, attender: 0, member: 0 } as Record<Category, number>,
        personIds: new Set<string>(),
      };
      if (!weekId) return empty;

      const { data, error } = await supabase
        .from("attendance")
        .select("person_id, category_at_time")
        .eq("week_id", weekId);

      if (error) throw error;

      const byCat: Record<Category, number> = { visitor: 0, attender: 0, member: 0 };
      const personIds = new Set<string>();
      (data || []).forEach((r) => {
        const cat = r.category_at_time as Category;
        if (cat in byCat) byCat[cat]++;
        personIds.add(r.person_id as string);
      });
      return { total: (data || []).length, byCat, personIds };
    },
    enabled: !!weekId,
  });
}

export function useMonthPersonAttendance(gdId: string | undefined, monthKey: string) {
  return useQuery({
    queryKey: ["monthPersonAttendance", gdId, monthKey],
    queryFn: async () => {
      if (!gdId) return {} as Record<string, number>;

      // Get all weeks in the month for this GD
      const { data: monthWeeks, error: weekErr } = await supabase
        .from("weeks")
        .select("id, date")
        .eq("gd_id", gdId)
        .gte("date", startOfMonth(monthKey))
        .lte("date", endOfMonth(monthKey));

      if (weekErr || !monthWeeks?.length) return {} as Record<string, number>;

      const weekIds = monthWeeks.map((w) => w.id);

      // Get attendance for those weeks
      const { data: attendance, error: attErr } = await supabase
        .from("attendance")
        .select("person_id")
        .in("week_id", weekIds);

      if (attErr || !attendance) return {} as Record<string, number>;

      const counts: Record<string, number> = {};
      attendance.forEach((a) => {
        const pid = a.person_id as string;
        counts[pid] = (counts[pid] || 0) + 1;
      });
      return counts;
    },
    enabled: !!gdId && !!monthKey,
  });
}
