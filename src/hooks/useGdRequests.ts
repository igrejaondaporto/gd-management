import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { GdRequestStatus } from "@/lib/constants";

export interface GdRequest {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  concelho: string | null;
  age: number | null;
  maritalStatus: string | null;
  notes: string | null;
  gdId: string | null;
  gdName: string | null;
  status: GdRequestStatus;
  personId: string | null;
  assignedByName: string | null;
  assignedAt: string | null;
  statusByName: string | null;
  statusAt: string | null;
  createdAt: string;
}

interface Row {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  concelho: string | null;
  age: number | null;
  marital_status: string | null;
  notes: string | null;
  gd_id: string | null;
  gds: { name: string } | null;
  status: GdRequestStatus;
  person_id: string | null;
  assigned_by_name: string | null;
  assigned_at: string | null;
  status_by_name: string | null;
  status_at: string | null;
  created_at: string;
}

const COLUMNS =
  "id, name, phone, email, concelho, age, marital_status, notes, gd_id, gds:gd_id(name), status, person_id, assigned_by_name, assigned_at, status_by_name, status_at, created_at";

function mapRow(r: Row): GdRequest {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    concelho: r.concelho,
    age: r.age,
    maritalStatus: r.marital_status,
    notes: r.notes,
    gdId: r.gd_id,
    gdName: r.gds?.name ?? null,
    status: r.status,
    personId: r.person_id,
    assignedByName: r.assigned_by_name,
    assignedAt: r.assigned_at,
    statusByName: r.status_by_name,
    statusAt: r.status_at,
    createdAt: r.created_at,
  };
}

/**
 * Requests to join a GD (migration 015), newest first.
 *
 * No filter here on purpose: RLS already returns every request to a
 * supervisor/pastor and only their own GDs' requests to a leader, so the same
 * query serves the "Pedidos" page and the leader card — and shares one cache.
 */
export function useGdRequests(enabled = true) {
  return useQuery({
    queryKey: ["gdRequests"],
    queryFn: async (): Promise<GdRequest[]> => {
      const { data, error } = await supabase
        .from("gd_requests")
        .select(COLUMNS)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return ((data || []) as unknown as Row[]).map(mapRow);
    },
    enabled,
  });
}

/** Supervisor/pastor sends a request to a GD (`null` = back to unrouted). */
export function useAssignGdRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, gdId }: { id: string; gdId: string | null }) => {
      // Through the function, never `update()`: the table has no write
      // policy, and the function checks the role and stamps who routed it.
      const { error } = await supabase.rpc("assign_gd_request", { p_id: id, p_gd_id: gdId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gdRequests"] }),
  });
}

/** The GD's staff record how it went. `addPerson` with `joined` adds them to
 *  the GD's people as a visitor (once — the function remembers it). */
export function useSetGdRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      addPerson = false,
    }: {
      id: string;
      status: Exclude<GdRequestStatus, "new">;
      addPerson?: boolean;
    }) => {
      const { error } = await supabase.rpc("set_gd_request_status", {
        p_id: id,
        p_status: status,
        p_add_person: addPerson,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gdRequests"] });
      // "Entrou" may have added a person to the GD
      qc.invalidateQueries({ queryKey: ["people"] });
    },
  });
}
