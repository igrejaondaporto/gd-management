import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { GD, Role, GdStaffMember } from "@/types";

export interface GdWithStaff extends GD {
  staff: GdStaffMember[];
}

/** Maps a `gds` row (with the joined `gd_staff`/`profiles`) to `GdWithStaff`.
 *  `useGds` and `useAllGds` query the same shape, so the mapping lives here —
 *  a new column is then added in exactly one place. */
export function mapGd(row: Record<string, unknown>): GdWithStaff {
  return {
    id: row.id as string,
    name: row.name as string,
    active: row.active as boolean,
    weekday: (row.weekday as number | null) ?? null,
    startTime: (row.start_time as string | null) ?? null,
    createdAt: row.created_at as string,
    staff: ((row.gd_staff || []) as Record<string, unknown>[]).map((s) => {
      const profile = s.profiles as Record<string, unknown> | null;
      return {
        gdId: s.gd_id as string,
        profileId: s.profile_id as string,
        profileName: (profile?.full_name as string) || undefined,
        profileRole: (profile?.role as Role) || undefined,
      };
    }),
  };
}

export function useGds() {
  return useQuery({
    queryKey: ["gds"],
    queryFn: async (): Promise<GdWithStaff[]> => {
      const { data, error } = await supabase
        .from("gds")
        .select("*, gd_staff(*, profiles:profile_id(id, full_name, role))")
        .order("name");

      if (error) throw error;

      return ((data || []) as unknown as Record<string, unknown>[]).map(mapGd);
    },
  });
}

export function useCreateGd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("gds").insert({ name });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gds"] }),
  });
}

export function useUpdateGd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      weekday,
      startTime,
    }: {
      id: string;
      name?: string;
      /** 0 = Sunday … 6 = Saturday; null clears it. */
      weekday?: number | null;
      /** "HH:MM"; null clears it. */
      startTime?: string | null;
    }) => {
      // Only send what was actually provided, so an edit that touches the name
      // never rewrites the schedule (and vice versa).
      const patch: { name?: string; weekday?: number | null; start_time?: string | null } = {};
      if (name !== undefined) patch.name = name;
      if (weekday !== undefined) patch.weekday = weekday;
      if (startTime !== undefined) patch.start_time = startTime;
      if (Object.keys(patch).length === 0) return;

      const { error } = await supabase.from("gds").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gds"] });
      qc.invalidateQueries({ queryKey: ["allGds"] });
    },
  });
}

export function useToggleGdActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("gds").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gds"] }),
  });
}

export function useLinkStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ gdId, profileId }: { gdId: string; profileId: string }) => {
      const { error } = await supabase
        .from("gd_staff")
        .insert({ gd_id: gdId, profile_id: profileId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gds"] }),
  });
}

export function useUnlinkStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ gdId, profileId }: { gdId: string; profileId: string }) => {
      const { error } = await supabase
        .from("gd_staff")
        .delete()
        .eq("gd_id", gdId)
        .eq("profile_id", profileId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gds"] }),
  });
}
