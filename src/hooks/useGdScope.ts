import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

/**
 * Resolves the dashboard's team filter into a set of GD ids.
 *
 * `supervisorIds` are expanded through `gd_staff` and unioned with the directly
 * selected `gdIds`. Returns `null` when nothing is selected, which means "no
 * filter" — the same convention the RPCs and the stats query use, so every
 * section of the dashboard scopes itself identically.
 */
export function useGdScope(supervisorIds: string[], gdIds: string[]) {
  return useQuery({
    queryKey: ["gdScope", supervisorIds, gdIds],
    queryFn: async (): Promise<string[] | null> => {
      const ids = new Set(gdIds);
      if (supervisorIds.length > 0) {
        const { data } = await supabase
          .from("gd_staff")
          .select("gd_id")
          .in("profile_id", supervisorIds);
        for (const link of data || []) ids.add(link.gd_id);
      }
      return ids.size > 0 ? [...ids] : null;
    },
  });
}
