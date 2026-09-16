import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { GdStatus } from "@/lib/constants";

export interface GdStatusUpdate {
  id: string;
  gdId: string;
  status: GdStatus;
  comment: string | null;
  /** Snapshot of the author's name at the time of writing (see migration 013). */
  createdByName: string | null;
  createdAt: string;
  /** When the entry was edited, or null if never (see migration 014). */
  updatedAt: string | null;
}

interface Row {
  id: string;
  gd_id: string;
  status: GdStatus;
  comment: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string | null;
}

function mapRow(r: Row): GdStatusUpdate {
  return {
    id: r.id,
    gdId: r.gd_id,
    status: r.status,
    comment: r.comment,
    createdByName: r.created_by_name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/**
 * The GD's status log, newest first.
 *
 * The table is append-only with no "current" row to keep in sync: the current
 * status IS `updates[0]`, and everything below it is the history. One query
 * serves both the summary card and the timeline.
 */
export function useGdStatusUpdates(gdId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["gdStatusUpdates", gdId],
    queryFn: async (): Promise<GdStatusUpdate[]> => {
      if (!gdId) return [];
      const { data, error } = await supabase
        .from("gd_status_updates")
        .select("id, gd_id, status, comment, created_by_name, created_at, updated_at")
        .eq("gd_id", gdId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return ((data || []) as Row[]).map(mapRow);
    },
    enabled: !!gdId && enabled,
  });
}

/**
 * Health entries for several GDs at once, grouped by GD and newest-first.
 *
 * One query for the whole dashboard instead of one per GD. `gdIds` of `null`
 * means "every GD the caller may see" — RLS already limits a supervisor to
 * their own, and the component filters the rest by the team scope.
 */
export function useGdHealthOverview(gdIds: string[] | null, enabled = true) {
  return useQuery({
    queryKey: ["gdHealthOverview", gdIds],
    queryFn: async (): Promise<Record<string, GdStatusUpdate[]>> => {
      let query = supabase
        .from("gd_status_updates")
        .select("id, gd_id, status, comment, created_by_name, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (gdIds && gdIds.length > 0) query = query.in("gd_id", gdIds);

      const { data, error } = await query;
      if (error) throw error;

      const byGd: Record<string, GdStatusUpdate[]> = {};
      for (const row of (data || []) as Row[]) {
        const entry = mapRow(row);
        (byGd[entry.gdId] ??= []).push(entry);
      }
      return byGd;
    },
    enabled,
  });
}

export function useAddGdStatusUpdate(gdId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ status, comment }: { status: GdStatus; comment: string }) => {
      if (!gdId) return;
      // `created_by`, `created_by_name` and `created_at` are all set by a
      // trigger, not sent from here — the client must not be able to claim an
      // author it is not.
      const { error } = await supabase.from("gd_status_updates").insert({
        gd_id: gdId,
        status,
        comment: comment.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gdStatusUpdates", gdId] }),
  });
}

/**
 * Fixes the text of an existing entry — a typo should not read as a new
 * assessment. Only the newest entry and only its author may be edited (RLS,
 * migration 014); anything older is frozen history.
 */
export function useEditGdStatusUpdate(gdId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      comment,
    }: {
      id: string;
      status: GdStatus;
      comment: string;
    }) => {
      // Only the content: `created_by`, `created_at` and `gd_id` are reset by
      // the trigger, so an edit can never backdate an entry or move it.
      const { error } = await supabase
        .from("gd_status_updates")
        .update({ status, comment: comment.trim() || null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gdStatusUpdates", gdId] }),
  });
}
