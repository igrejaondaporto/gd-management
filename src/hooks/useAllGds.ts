import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Role } from "@/types";
import type { GdWithStaff } from "@/hooks/useGds";

interface AllGdsData {
  gds: GdWithStaff[];
  role: Role | null;
}

export function useAllGds() {
  return useQuery({
    queryKey: ["allGds"],
    queryFn: async (): Promise<AllGdsData> => {
      // Get current user's role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const role = profile?.role as Role | null;

      // Pastor sees all GDs, supervisor sees only linked GDs
      const query = supabase
        .from("gds")
        .select("*, gd_staff(*, profiles:profile_id(id, full_name, role))")
        .order("name");

      if (role === "supervisor") {
        const { data: staffRows } = await supabase
          .from("gd_staff")
          .select("gd_id")
          .eq("profile_id", (await supabase.auth.getUser()).data.user?.id);

        const gdIds = (staffRows || []).map((s) => s.gd_id);
        if (gdIds.length > 0) {
          query.in("id", gdIds);
        } else {
          return { gds: [], role };
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const gds: GdWithStaff[] = (data || []).map((g) => ({
        id: g.id,
        name: g.name,
        active: g.active,
        createdAt: g.created_at,
        staff: ((g.gd_staff || []) as Record<string, unknown>[]).map((s) => {
          const p = s.profiles as Record<string, unknown> | null;
          return {
            gdId: s.gd_id as string,
            profileId: s.profile_id as string,
            profileName: (p?.full_name as string) || undefined,
            profileRole: (p?.role as Role) || undefined,
          };
        }),
      }));

      return { gds, role };
    },
  });
}
