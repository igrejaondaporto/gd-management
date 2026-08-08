import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Archive, Edit3, ChevronDown, ChevronUp, X, Users } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { NameInput } from "@/components/ui/NameInput";
import { Avatar } from "@/components/ui/Avatar";
import { supabase } from "@/lib/supabaseClient";
import { ROLE_LABELS } from "@/lib/constants";
import type { GD, Profile, Role, GdStaffMember } from "@/types";

/* ====== DATA HOOKS ====== */

interface GdWithStaff extends GD {
  staff: GdStaffMember[];
}

function useGds() {
  return useQuery({
    queryKey: ["gds"],
    queryFn: async (): Promise<GdWithStaff[]> => {
      const { data: gds, error } = await supabase
        .from("gds")
        .select("*, gd_staff(*, profiles:profile_id(id, full_name, role))")
        .order("name");

      if (error) throw error;

      return gds.map((g) => ({
        id: g.id,
        name: g.name,
        active: g.active,
        createdAt: g.created_at,
        staff: (g.gd_staff || []).map((s: Record<string, unknown>) => {
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

function useCreateGd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("gds").insert({ name });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gds"] }),
  });
}

function useUpdateGd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("gds").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gds"] }),
  });
}

function useToggleGdActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("gds").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gds"] }),
  });
}

function useApprovedProfiles() {
  return useQuery({
    queryKey: ["profiles", "approved"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", "approved")
        .order("full_name");

      if (error) throw error;
      return data.map((p) => ({
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        avatarUrl: p.avatar_url,
        status: p.status,
        role: p.role,
        createdAt: p.created_at,
      }));
    },
  });
}

function useLinkStaff() {
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

function useUnlinkStaff() {
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

/* ====== COMPONENTS ====== */

function StaffSection({ gd }: { gd: GdWithStaff }) {
  const [expanded, setExpanded] = useState(false);
  const { data: approvedProfiles } = useApprovedProfiles();
  const linkStaff = useLinkStaff();
  const unlinkStaff = useUnlinkStaff();

  const linkedIds = new Set(gd.staff.map((s) => s.profileId));

  // Group staff by role
  const grouped = {
    leader: [] as GdStaffMember[],
    supervisor: [] as GdStaffMember[],
    pastor: [] as GdStaffMember[],
  };
  gd.staff.forEach((s) => {
    if (s.profileRole && grouped[s.profileRole]) grouped[s.profileRole].push(s);
  });

  const availableProfiles = (approvedProfiles || []).filter((p) => !linkedIds.has(p.id));

  return (
    <div className="mt-1">
      {/* Staff summary chips */}
      <div className="flex flex-wrap items-center gap-2">
        {gd.staff.map((s) => (
          <div
            key={s.profileId}
            className="flex items-center gap-[5px] rounded-full bg-primary-soft py-[3px] pl-1.5 pr-2"
          >
            <Avatar name={s.profileName || "?"} color="#266BC6" bg="#fff" size={18} />
            <span className="font-body text-[11px] font-semibold text-ink">
              {s.profileName || "Sem nome"}
            </span>
            <button
              onClick={() => unlinkStaff.mutate({ gdId: gd.id, profileId: s.profileId })}
              disabled={unlinkStaff.isPending}
              className="flex cursor-pointer border-none bg-transparent p-0 text-ink-faint"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        {/* Expand to manage */}
        {approvedProfiles && approvedProfiles.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex cursor-pointer items-center gap-1 rounded-full border-[1.5px] border-dashed border-line px-2.5 py-1 font-body text-[11px] font-semibold text-ink-faint"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Fechar" : "Gerenciar equipe"}
          </button>
        )}
      </div>

      {/* Expanded: add/remove staff */}
      {expanded && (
        <div className="mt-3 rounded-xl border border-line bg-paper-alt p-3">
          {/* Linked staff by role */}
          {(["leader", "supervisor", "pastor"] as Role[]).map((role) =>
            grouped[role].length > 0 ? (
              <div key={role} className="mb-2">
                <div className="mb-1 font-body text-[10.5px] font-bold text-ink-faint uppercase">
                  {ROLE_LABELS[role]}s ({grouped[role].length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {grouped[role].map((s) => (
                    <span
                      key={s.profileId}
                      className="rounded-full bg-card px-2 py-0.5 font-body text-[11px] font-semibold text-ink"
                    >
                      {s.profileName}
                    </span>
                  ))}
                </div>
              </div>
            ) : null,
          )}

          {/* Add more */}
          {availableProfiles.length > 0 && (
            <div className="mt-2 border-t border-line-soft pt-2">
              <div className="mb-1.5 font-body text-[10.5px] font-bold text-ink-faint uppercase">
                Adicionar
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableProfiles.slice(0, 10).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => linkStaff.mutate({ gdId: gd.id, profileId: p.id })}
                    disabled={linkStaff.isPending}
                    className="flex cursor-pointer items-center gap-1 rounded-full border border-line bg-card px-2 py-1 font-body text-[11px] font-semibold text-ink transition-colors hover:border-primary"
                  >
                    <Plus size={11} />
                    {p.fullName || p.email}
                    {p.role && (
                      <span className="text-[10px] text-ink-faint">({ROLE_LABELS[p.role]})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ====== MAIN PAGE ====== */

export default function GdManagementPage() {
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { data: gds, isLoading } = useGds();
  const createGd = useCreateGd();
  const updateGd = useUpdateGd();
  const toggleActive = useToggleGdActive();

  const filteredGds = (gds || []).filter((g) => (showArchived ? !g.active : g.active));

  const handleEdit = (gd: GD) => {
    setEditingId(gd.id);
    setEditName(gd.name);
  };

  const handleSave = () => {
    if (!editingId || !editName.trim()) return;
    updateGd.mutate({ id: editingId, name: editName.trim() });
    setEditingId(null);
    setEditName("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame title="GDs" badge={{ label: "pastor", color: "#A9822C", bg: "#F1E2B8" }}>
        <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-4 pb-4">
          <div className="mb-4 font-display text-lg font-bold text-ink">Grupos de Discipulos</div>

          {/* Create GD */}
          <div className="mb-4">
            <NameInput placeholder="Nome do novo GD" onAdd={(name) => createGd.mutate(name)} />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          )}

          {/* GD List */}
          {filteredGds.map((gd) => (
            <div key={gd.id} className="mb-2 rounded-xl border border-line bg-card p-3">
              {/* Name row */}
              <div className="flex items-center gap-2">
                {editingId === gd.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSave()}
                      className="flex-1 rounded-lg border-[1.5px] border-primary bg-card px-2 py-1.5 font-body text-[13px] font-semibold text-ink outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSave}
                      className="cursor-pointer rounded-lg border-none bg-primary px-2.5 py-1.5 font-body text-[11px] font-bold text-white"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="cursor-pointer rounded-lg border-none bg-paper-alt px-2.5 py-1.5 font-body text-[11px] font-bold text-ink-faint"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-primary-soft">
                        <Users size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-body text-[13px] font-semibold text-ink">
                          {gd.name}
                        </div>
                        <div className="font-body text-[10.5px] text-ink-faint">
                          {gd.staff.length} pessoa{gd.staff.length !== 1 ? "s" : ""} vinculada
                          {gd.staff.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(gd)}
                      className="cursor-pointer border-none bg-transparent p-1 text-ink-faint"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => toggleActive.mutate({ id: gd.id, active: false })}
                      className="cursor-pointer border-none bg-transparent p-1 text-ink-faint"
                    >
                      <Archive size={14} />
                    </button>
                  </>
                )}
              </div>

              {/* Staff */}
              <StaffSection gd={gd} />
            </div>
          ))}

          {/* Empty */}
          {!isLoading && filteredGds.length === 0 && (
            <div className="py-8 text-center font-body text-sm text-ink-faint">
              {showArchived
                ? "Nenhum GD arquivado."
                : "Nenhum GD cadastrado. Crie o primeiro acima."}
            </div>
          )}

          {/* Show archived toggle */}
          {(gds || []).some((g) => !g.active) && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="mt-2 cursor-pointer border-none bg-transparent p-2 text-center font-body text-[11.5px] font-semibold text-ink-faint"
            >
              {showArchived ? "Mostrar ativos" : "Mostrar arquivados"}
            </button>
          )}
        </div>
      </PhoneFrame>
    </div>
  );
}
