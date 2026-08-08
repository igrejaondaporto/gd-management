import { useState } from "react";
import { Check, X, UserCheck, UserX } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role, Profile, ProfileStatus } from "@/types";
import type { UseMutationResult } from "@tanstack/react-query";

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface UserListProps {
  profiles: Profile[];
  isLoading: boolean;
  approveUser: UseMutationResult<void, Error, { id: string; role: Role }>;
  rejectUser: UseMutationResult<void, Error, string>;
}

export function UserList({ profiles, isLoading, approveUser, rejectUser }: UserListProps) {
  const [tab, setTab] = useState<ProfileStatus>("pending");
  const [selectedRoles, setSelectedRoles] = useState<Record<string, Role>>({});

  const filtered = profiles.filter((p) => p.status === tab);

  return (
    <>
      {/* Tabs */}
      <div className="mb-4 flex rounded-xl bg-paper-alt p-1">
        {STATUS_TABS.map((t) => {
          const count = profiles.filter((p) => p.status === t.key).length;
          return (
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
              {tab === t.key && (
                <span className="ml-1.5 text-[11px] text-ink-faint">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="py-8 text-center font-body text-sm text-ink-faint">
          Nenhum usuario {STATUS_TABS.find((t) => t.key === tab)?.label.toLowerCase()} no momento.
        </div>
      )}

      {/* List */}
      {!isLoading &&
        filtered.map((p) => (
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
                    approveUser.mutate({ id: p.id, role: selectedRoles[p.id] || "leader" })
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

            {tab === "approved" && <Check size={16} className="text-primary" />}
            {tab === "rejected" && <X size={16} className="text-rose" />}
          </div>
        ))}
    </>
  );
}
