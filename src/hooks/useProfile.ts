import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import type { Profile } from "@/types";

async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) throw error;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    status: data.status,
    role: data.role,
    createdAt: data.created_at,
  };
}

export function useProfile() {
  const { user, loading: sessionLoading } = useSession();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user && !sessionLoading,
    staleTime: 1000 * 60 * 5,
  });
}
