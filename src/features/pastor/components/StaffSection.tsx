import { useState } from "react";
import { Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ROLE_LABELS, ROLE_LABELS_PLURAL } from "@/lib/constants";
import { useApprovedProfiles } from "@/hooks/useProfiles";
import type { GdWithStaff } from "@/hooks/useGds";
import type { UseMutationResult } from "@tanstack/react-query";
import type { Role, GdStaffMember } from "@/types";

interface StaffSectionProps {
  gd: GdWithStaff;
  linkStaff: UseMutationResult<void, Error, { gdId: string; profileId: string }>;
  unlinkStaff: UseMutationResult<void, Error, { gdId: string; profileId: string }>;
}

export function StaffSection({ gd, linkStaff, unlinkStaff }: StaffSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: approvedProfiles } = useApprovedProfiles();

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
          {(["leader", "supervisor", "pastor"] as Role[]).map(
            (role) =>
              grouped[role].length > 0 && (
                <div key={role} className="mb-2">
                  <div className="mb-1 font-body text-[10.5px] font-bold text-ink-faint uppercase">
                    {ROLE_LABELS_PLURAL[role]} ({grouped[role].length})
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
              ),
          )}

          {availableProfiles.length > 0 && (
            <div className="mt-2 border-t border-line-soft pt-2">
              <div className="mb-1.5 font-body text-[10.5px] font-bold text-ink-faint uppercase">
                Adicionar
              </div>
              <div className="flex max-h-[180px] flex-wrap gap-1.5 overflow-y-auto">
                {availableProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => linkStaff.mutate({ gdId: gd.id, profileId: p.id })}
                    disabled={linkStaff.isPending}
                    className="flex cursor-pointer items-center gap-1 rounded-full border border-line bg-card px-2 py-1 font-body text-[11px] font-semibold text-ink transition-colors hover:border-primary"
                  >
                    <Plus size={11} />
                    {p.fullName || p.email}
                    {p.status === "pending" && (
                      <span className="text-[10px] text-gold">(pendente)</span>
                    )}
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
