import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Profile, Role, ProfileStatus } from "@/types";

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    email: row.email as string,
    fullName: row.full_name as string | null,
    avatarUrl: row.avatar_url as string | null,
    status: row.status as ProfileStatus,
    role: row.role as Role | null,
    createdAt: row.created_at as string,
  };
}

export function useProfilesByStatus(status: ProfileStatus) {
  return useQuery({
    queryKey: ["profiles", status],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(mapProfile);
    },
  });
}

export function useApprovedProfiles() {
  return useQuery({
    queryKey: ["profiles", "approved-and-pending"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("status", ["approved", "pending"])
        .order("full_name");

      if (error) throw error;
      return (data || []).map(mapProfile);
    },
  });
}

export function useApproveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "approved", role })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}

export function useRejectUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").update({ status: "rejected" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}
