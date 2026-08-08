import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { formatWeekLabel } from "@/lib/utils";
import type { Week, Category } from "@/types";

function mapWeek(row: Record<string, unknown>): Week {
  return {
    id: row.id as string,
    gdId: row.gd_id as string,
    date: row.date as string,
    label: formatWeekLabel(row.date as string),
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string,
  };
}

export function useWeeks(gdId: string | undefined) {
  return useQuery({
    queryKey: ["weeks", gdId],
    queryFn: async (): Promise<Week[]> => {
      if (!gdId) return [];
      const { data, error } = await supabase
        .from("weeks")
        .select("*")
        .eq("gd_id", gdId)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data || []).map(mapWeek);
    },
    enabled: !!gdId,
  });
}

interface AttendanceEntry {
  personId: string;
  categoryAtTime: Category;
}

interface CreateWeekInput {
  gdId: string;
  date: string;
  newPeople: { name: string; category: Category; memberSince?: string | null }[];
  promotions: { personId: string; newCategory: Category; memberSince?: string | null }[];
  attendance: AttendanceEntry[];
}

export function useCreateWeek() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateWeekInput) => {
      // Convert camelCase to snake_case for Postgres composite types
      const newPeople = input.newPeople.map((p) => ({
        name: p.name,
        category: p.category,
        member_since: p.memberSince ?? null,
      }));
      const promotions = input.promotions.map((p) => ({
        person_id: p.personId,
        new_category: p.newCategory,
        member_since: p.memberSince ?? null,
      }));
      const attendance = input.attendance.map((a) => ({
        person_id: a.personId,
        category_at_time: a.categoryAtTime,
      }));

      // Use the RPC function for atomicity
      const { error } = await supabase.rpc("confirm_week_attendance", {
        p_gd_id: input.gdId,
        p_date: input.date,
        p_new_people: newPeople,
        p_promotions: promotions,
        p_attendance: attendance,
      });

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["weeks", variables.gdId] });
      qc.invalidateQueries({ queryKey: ["people", variables.gdId] });
      qc.invalidateQueries({ queryKey: ["attendance", variables.gdId] });
    },
  });
}

export function useWeekAttendance(weekId: string | undefined) {
  return useQuery({
    queryKey: ["attendance", weekId],
    queryFn: async () => {
      if (!weekId) return [];
      const { data, error } = await supabase
        .from("attendance")
        .select("*, people:person_id(id, name, category)")
        .eq("week_id", weekId);

      if (error) throw error;
      return (data || []).map((a: Record<string, unknown>) => {
        const person = a.people as Record<string, unknown> | null;
        return {
          weekId: a.week_id as string,
          personId: a.person_id as string,
          categoryAtTime: a.category_at_time as Category,
          personName: (person?.name as string) || "?",
          personCategory: (person?.category as Category) || "visitor",
        };
      });
    },
    enabled: !!weekId,
  });
}
