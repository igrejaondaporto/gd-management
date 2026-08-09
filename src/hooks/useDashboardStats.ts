import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Category } from "@/types";

export interface DashboardStats {
  byCat: Record<Category, number>;
  total: number;
  newMembers: number;
}

function endOfMonth(date: string): string {
  const [y, m] = date.split("-").map(Number);
  return `${y}-${String(m).padStart(2, "0")}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
}

export function useDashboardStats(
  startKey: string,
  endKey: string,
  supervisorIds: string[],
  leaderIds: string[],
) {
  return useQuery({
    queryKey: ["dashboardStats", startKey, endKey, supervisorIds, leaderIds],
    queryFn: async (): Promise<DashboardStats> => {
      const empty: DashboardStats = {
        byCat: { visitor: 0, attender: 0, member: 0 },
        total: 0,
        newMembers: 0,
      };

      const allStaffIds = [...new Set([...supervisorIds, ...leaderIds])];
      let gdIds: string[] | null = null;

      if (allStaffIds.length > 0) {
        const { data: links } = await supabase
          .from("gd_staff")
          .select("gd_id")
          .in("profile_id", allStaffIds);

        const uniqueIds = [...new Set((links || []).map((l) => l.gd_id))];
        if (!uniqueIds.length) return empty;
        gdIds = uniqueIds;
      }

      const endDate = endOfMonth(endKey);

      let query = supabase
        .from("people")
        .select("id, category, member_since")
        .lte("created_at", endDate);

      if (gdIds) {
        query = query.in("gd_id", gdIds);
      }

      const { data: people, error } = await query;

      if (error || !people) return empty;

      const byCat: Record<Category, number> = { visitor: 0, attender: 0, member: 0 };
      let newMembers = 0;
      const startDate = `${startKey}-01`;

      for (const p of people) {
        const cat = p.category as Category;
        if (cat in byCat) byCat[cat]++;

        if (cat === "member" && p.member_since) {
          const ms = p.member_since as string;
          if (ms >= startDate && ms <= endDate) {
            newMembers++;
          }
        }
      }

      return {
        byCat,
        total: (people as unknown[]).length,
        newMembers,
      };
    },
    enabled: !!startKey && !!endKey,
  });
}
