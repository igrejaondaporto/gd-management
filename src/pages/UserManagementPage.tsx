import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, UserCheck, UserX } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { Avatar } from "@/components/ui/Avatar";
import { supabase } from "@/lib/supabaseClient";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role, Profile, ProfileStatus } from "@/types";

const STATUS_TABS: { key: ProfileStatus; label: string }[] = [
  { key: "pending", label: "Pendentes" },
  { key: "approved", label: "Aprovados" },
  { key: "rejected", label: "Rejeitados" },
];

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "leader", label: ROLE_LABELS.leader },
  { value: "supervisor", label: ROLE_LABELS.supervisor },
  { value: "pastor", label: ROLE_LABELS.pastor },
];

function useProfiles(status: ProfileStatus) {
  return useQuery({
    queryKey: ["profiles", status],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

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

function useApproveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "approved", role })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

function useRejectUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").update({ status: "rejected" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

export default function UserManagementPage() {
  const [tab, setTab] = useState<ProfileStatus>("pending");
  const [selectedRoles, setSelectedRoles] = useState<Record<string, Role>>({});
  const { data: profiles, isLoading } = useProfiles(tab);
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame title="Usuarios" badge={{ label: "pastor", color: "#A9822C", bg: "#F1E2B8" }}>
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4">
          <div className="mb-4 font-display text-lg font-bold text-ink">Gestao de Usuarios</div>

          {/* Tabs */}
          <div className="mb-4 flex rounded-xl bg-paper-alt p-1">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 cursor-pointer rounded-lg border-none px-3 py-2 font-body text-[12.5px] font-semibold transition-colors"
                style={{
                  background: tab === t.key ? "#fff" : "transparent",
                  color: tab === t.key ? "#232A21" : "#9A9A8A",
                }}
              >
                {t.label}
                {tab === t.key && profiles && (
                  <span className="ml-1.5 text-[11px] text-ink-faint">({profiles.length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          )}

          {/* Empty */}
          {!isLoading && profiles?.length === 0 && (
            <div className="py-8 text-center font-body text-sm text-ink-faint">
              Nenhum usuario {STATUS_TABS.find((t) => t.key === tab)?.label.toLowerCase()} no
              momento.
            </div>
          )}

          {/* List */}
          {!isLoading &&
            profiles?.map((p) => (
              <div
                key={p.id}
                className="mb-2 flex items-center gap-3 rounded-xl border border-line bg-card p-3"
              >
                <Avatar
                  name={p.fullName || p.email}
                  color={p.role ? "#266BC6" : "#9A9A8A"}
                  bg={p.role ? "#DCE7F8" : "#EAE4D0"}
                  size={36}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-body text-[13px] font-semibold text-ink">
                    {p.fullName || "Sem nome"}
                  </div>
                  <div className="truncate font-body text-[11.5px] text-ink-soft">{p.email}</div>
                  <div className="mt-0.5 font-body text-[10.5px] text-ink-faint">
                    {formatDate(p.createdAt)}
                    {p.role && (
                      <span className="ml-2 font-semibold text-primary">{ROLE_LABELS[p.role]}</span>
                    )}
                  </div>
                </div>

                {/* Actions for pending */}
                {tab === "pending" && (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={selectedRoles[p.id] || "leader"}
                      onChange={(e) =>
                        setSelectedRoles((prev) => ({
                          ...prev,
                          [p.id]: e.target.value as Role,
                        }))
                      }
                      className="cursor-pointer rounded-lg border border-line bg-card px-2 py-1.5 font-body text-[11.5px] font-semibold text-ink outline-none"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        approveUser.mutate({
                          id: p.id,
                          role: selectedRoles[p.id] || "leader",
                        })
                      }
                      disabled={approveUser.isPending}
                      className="flex cursor-pointer items-center gap-1 rounded-lg border-none bg-primary px-2.5 py-1.5 font-body text-[11.5px] font-bold text-white transition-opacity disabled:opacity-50"
                    >
                      <UserCheck size={13} />
                    </button>
                    <button
                      onClick={() => rejectUser.mutate(p.id)}
                      disabled={rejectUser.isPending}
                      className="flex cursor-pointer items-center gap-1 rounded-lg border border-rose bg-card px-2.5 py-1.5 font-body text-[11.5px] font-bold text-rose transition-opacity disabled:opacity-50"
                    >
                      <UserX size={13} />
                    </button>
                  </div>
                )}

                {/* Indicator for approved */}
                {tab === "approved" && <Check size={16} className="text-primary" />}

                {/* Indicator for rejected */}
                {tab === "rejected" && <X size={16} className="text-rose" />}
              </div>
            ))}
        </div>
      </PhoneFrame>
    </div>
  );
}
