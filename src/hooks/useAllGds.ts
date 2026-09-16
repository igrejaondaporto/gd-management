import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { mapGd, type GdWithStaff } from "@/hooks/useGds";
import type { Role } from "@/types";

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

      const gds = ((data || []) as unknown as Record<string, unknown>[]).map(mapGd);

      return { gds, role };
    },
  });
}
