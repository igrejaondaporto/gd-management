import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/utils";

export interface GdReportStatus {
  gdId: string;
  gdName: string;
  active: boolean;
  weekday: number | null;
  /** Weeks in the window that contained the GD's meeting day. */
  expected: number;
  /** Of those, how many have a report. */
  reported: number;
  missing: number;
}

interface Row {
  gd_id: string;
  gd_name: string;
  active: boolean;
  weekday: number | null;
  expected: number;
  reported: number;
  missing: number;
}

/**
 * Outstanding weekly reports per GD, from `gd_report_status` (migration 012).
 *
 * The counting rule lives in the database, not here: the dashboard and the GD
 * page read the same function, so they cannot disagree — an earlier version
 * had the rule implemented twice in the client and one copy drifted.
 *
 * `gdIds` of `null` means every GD the caller may see. RLS on the function's
 * tables already limits a supervisor to their own GDs, so the team filter only
 * has to narrow things further.
 */
export function useReportStatus(gdIds: string[] | null, days = 30, enabled = true) {
  return useQuery({
    queryKey: ["reportStatus", gdIds, days],
    queryFn: async (): Promise<GdReportStatus[]> => {
      const { data, error } = await supabase.rpc("gd_report_status", {
        // The database runs in UTC, so its `current_date` is still yesterday
        // between 23:00 and midnight in Lisbon. Send the user's own date.
        p_today: todayISO(),
        p_days: days,
        p_gd_ids: gdIds,
      });
      if (error) throw error;

      return ((data || []) as Row[]).map((r) => ({
        gdId: r.gd_id,
        gdName: r.gd_name,
        active: r.active,
        weekday: r.weekday,
        expected: r.expected,
        reported: r.reported,
        missing: r.missing,
      }));
    },
    enabled,
  });
}
