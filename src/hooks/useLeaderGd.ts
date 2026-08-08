import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/features/auth/AuthProvider";

interface LeaderGd {
  gdId: string;
  gdName: string;
}

export function useLeaderGd() {
  const { user, loading: sessionLoading } = useSession();

  return useQuery({
    queryKey: ["leaderGd", user?.id],
    queryFn: async (): Promise<LeaderGd | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("gd_staff")
        .select("gd_id, gds:gd_id(name)")
        .eq("profile_id", user.id)
        .single();

      if (error || !data) return null;
      const gd = data.gds as unknown as { name: string } | null;
      return { gdId: data.gd_id, gdName: gd?.name || "GD" };
    },
    enabled: !!user && !sessionLoading,
  });
}
