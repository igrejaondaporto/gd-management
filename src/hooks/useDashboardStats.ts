import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { MONTHS_PT } from "@/lib/constants";
import { endOfMonth, startOfMonth } from "@/lib/utils";
import type { Category } from "@/types";

export interface MonthlyPoint {
  month: string;
  label: string;
  total: number;
  byCat: Record<Category, number>;
}

export interface DashboardStats {
  byCat: Record<Category, number>;
  total: number;
  attendanceByCat: Record<Category, number>;
  attendanceTotal: number;
  newMembers: number;
  perMonth: MonthlyPoint[];
}

function monthKeyFromDate(date: string): string {
  return date.slice(0, 7);
}

export function useDashboardStats(
  startKey: string,
  endKey: string,
  supervisorIds: string[],
  gdIds: string[],
) {
  return useQuery({
    queryKey: ["dashboardStats", startKey, endKey, supervisorIds, gdIds],
    queryFn: async (): Promise<DashboardStats> => {
      // Resolve GD ids
      const linkedGdIds = new Set(gdIds);
      if (supervisorIds.length > 0) {
        const { data: links } = await supabase
          .from("gd_staff")
          .select("gd_id")
          .in("profile_id", supervisorIds);
        for (const l of links || []) linkedGdIds.add(l.gd_id);
      }
      const finalGdIds = [...linkedGdIds];

      const endDate = endOfMonth(endKey);
      const startDate = startOfMonth(startKey);

      // ── Absolutes (all people) ──
      let peopleQuery = supabase
        .from("people")
        .select("id, category, member_since")
        .lte("created_at", endDate);

      if (finalGdIds.length > 0) peopleQuery = peopleQuery.in("gd_id", finalGdIds);

      const { data: people, error: peopleErr } = await peopleQuery;
      if (peopleErr) throw peopleErr;

      const byCat: Record<Category, number> = { visitor: 0, attender: 0, member: 0 };
      let newMembers = 0;

      for (const p of people || []) {
        const cat = p.category as Category;
        if (cat in byCat) byCat[cat]++;
        if (cat === "member" && p.member_since) {
          const ms = p.member_since as string;
          if (ms >= startDate && ms <= endDate) newMembers++;
        }
      }

      // ── Attendance frequency ──
      // Get weeks in the period linked to these GDs
      let weeksQuery = supabase
        .from("weeks")
        .select("id, date")
        .gte("date", startDate)
        .lte("date", endDate);

      if (finalGdIds.length > 0) weeksQuery = weeksQuery.in("gd_id", finalGdIds);

      const { data: periodWeeks } = await weeksQuery;
      const weekIds = (periodWeeks || []).map((w) => w.id);

      const attendanceByCat: Record<Category, number> = { visitor: 0, attender: 0, member: 0 };
      let attendanceTotal = 0;

      if (weekIds.length > 0) {
        const { data: att } = await supabase
          .from("attendance")
          .select("person_id, category_at_time")
          .in("week_id", weekIds);

        // Deduplicate by person (count each person only once)
        const seen = new Set<string>();
        for (const a of att || []) {
          if (seen.has(a.person_id)) continue;
          seen.add(a.person_id);
          const cat = a.category_at_time as Category;
          if (cat in attendanceByCat) attendanceByCat[cat]++;
          attendanceTotal++;
        }
      }

      // ── Per-month breakdown (always generated) ──
      const perMonth: MonthlyPoint[] = [];
      const byMonthCat = new Map<string, Record<Category, Set<string>>>();

      if (weekIds.length > 0) {
        const weekDateMap = new Map(periodWeeks!.map((w) => [w.id, w.date]));
        const { data: allAtt } = await supabase
          .from("attendance")
          .select("person_id, category_at_time, week_id")
          .in("week_id", weekIds);

        for (const a of allAtt || []) {
          const date = weekDateMap.get(a.week_id);
          if (!date) continue;
          const mk = monthKeyFromDate(date);
          if (!byMonthCat.has(mk)) {
            byMonthCat.set(mk, { visitor: new Set(), attender: new Set(), member: new Set() });
          }
          const cat = a.category_at_time as Category;
          const rec = byMonthCat.get(mk)!;
          if (cat in rec) rec[cat].add(a.person_id);
        }
      }

      const [sy, sm] = startKey.split("-").map(Number);
      const [ey, em] = endKey.split("-").map(Number);
      const startMNum = sy * 12 + sm;
      const endMNum = ey * 12 + em;
      for (let m = startMNum; m <= endMNum; m++) {
        const y = Math.floor(m / 12);
        const mo = m % 12 || 12;
        const mk = `${y}-${String(mo).padStart(2, "0")}`;
        const rec = byMonthCat.get(mk);
        const byCat: Record<Category, number> = { visitor: 0, attender: 0, member: 0 };
        let total = 0;
        if (rec) {
          for (const cat of Object.keys(rec) as Category[]) {
            byCat[cat] = rec[cat].size;
            total += rec[cat].size;
          }
        }
        perMonth.unshift({ month: mk, label: MONTHS_PT[mo - 1], total, byCat });
      }

      return {
        byCat,
        total: (people || []).length,
        attendanceByCat,
        attendanceTotal,
        newMembers,
        perMonth,
      };
    },
    enabled: !!startKey && !!endKey,
  });
}
