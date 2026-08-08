import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { GD, Role, GdStaffMember } from "@/types";

export interface GdWithStaff extends GD {
  staff: GdStaffMember[];
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

      return (data || []).map((g) => ({
        id: g.id,
        name: g.name,
        active: g.active,
        createdAt: g.created_at,
        staff: ((g.gd_staff || []) as Record<string, unknown>[]).map((s) => {
          const profile = s.profiles as Record<string, unknown> | null;
          return {
            gdId: s.gd_id as string,
            profileId: s.profile_id as string,
            profileName: (profile?.full_name as string) || undefined,
            profileRole: (profile?.role as Role) || undefined,
          };
        }),
      }));
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
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("gds").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gds"] }),
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
