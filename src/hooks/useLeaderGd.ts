import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/features/auth/AuthProvider";

export interface LeaderGd {
  gdId: string;
  gdName: string;
}

export function useLeaderGd() {
  const { user, loading: sessionLoading } = useSession();

  return useQuery({
    queryKey: ["leaderGd", user?.id],
    queryFn: async (): Promise<LeaderGd[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("gd_staff")
        .select("gd_id, gds:gd_id(name)")
        .eq("profile_id", user.id);

      if (error || !data) return [];
      return data.map((d) => {
        const gd = d.gds as unknown as { name: string } | null;
        return { gdId: d.gd_id, gdName: gd?.name || "GD" };
      });
    },
    enabled: !!user && !sessionLoading,
  });
}

/** Returns the first GD the user is linked to (convenience for single-GD contexts) */
export function useFirstLeaderGd() {
  const { data: gds, ...rest } = useLeaderGd();
  return { ...rest, data: gds && gds.length > 0 ? gds[0] : null };
}
