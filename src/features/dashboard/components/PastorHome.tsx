import { useState, useMemo, useEffect, useRef } from "react";
import { TrendingUp, Check, SlidersHorizontal } from "lucide-react";
import { MiniStat } from "@/components/ui/MiniStat";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAllGds } from "@/hooks/useAllGds";
import { categoryColors, MONTHS_PT } from "@/lib/constants";
import type { Category } from "@/types";

// ── Helpers ──────────────────────────────────────────────

function buildMonths(): { key: string; short: string; year: string }[] {
  const now = new Date();
  const months: { key: string; short: string; year: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const short = MONTHS_PT[d.getMonth()];
    const year = String(d.getFullYear());
    months.push({ key, short, year });
  }
  return months;
}

const MONTHS = buildMonths();

function rangeLabel(startKey: string, endKey: string): string {
  if (startKey === endKey) {
    const m = MONTHS.find((x) => x.key === startKey);
    return m ? `${m.short} ${m.year}` : "";
  }
  const s = MONTHS.find((x) => x.key === startKey);
  const e = MONTHS.find((x) => x.key === endKey);
  return `${s?.short} ${s?.year} — ${e?.short} ${e?.year}`;
}

// ── Types ────────────────────────────────────────────────

interface StaffMember {
  id: string;
  name: string;
}

// ── Staff Drawer ─────────────────────────────────────────

function StaffDrawer({
  open,
  selectedSupervisorIds,
  selectedLeaderIds,
  supervisors,
  leaders,
  onApply,
  onClose,
}: {
  open: boolean;
  selectedSupervisorIds: string[];
  selectedLeaderIds: string[];
  supervisors: StaffMember[];
  leaders: StaffMember[];
  onApply: (supervisorIds: string[], leaderIds: string[]) => void;
  onClose: () => void;
}) {
  const [draftSup, setDraftSup] = useState(selectedSupervisorIds);
  const [draftLead, setDraftLead] = useState(selectedLeaderIds);

  useEffect(() => {
    if (open) {
      setDraftSup(selectedSupervisorIds);
      setDraftLead(selectedLeaderIds);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, selectedSupervisorIds, selectedLeaderIds]);

  if (!open) return null;

  const total = draftSup.length + draftLead.length;

  const Roll = ({
    list,
    ids,
    toggle,
    label,
  }: {
    list: StaffMember[];
    ids: string[];
    toggle: (id: string) => void;
    label: string;
  }) => (
    <div className="space-y-0.5">
      {list.map((p) => {
        const sel = ids.includes(p.id);
        return (
          <button
            key={p.id}
            onClick={() => toggle(p.id)}
            className="flex w-full cursor-pointer items-center justify-between rounded-lg border-none bg-transparent px-3 py-2"
          >
            <span
              className="font-body text-[13.5px] font-semibold"
              style={{ color: sel ? "#266BC6" : "#232A21" }}
            >
              {p.name}
            </span>
            {sel && <Check size={16} color="#266BC6" />}
          </button>
        );
      })}
      {list.length === 0 && (
        <div className="py-2 text-center font-body text-[12px] text-ink-faint">
          Nenhum {label} encontrado
        </div>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/20 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[400px] flex-col animate-slide-up rounded-t-[20px] bg-card shadow-lg sm:rounded-[20px]"
      >
        <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
          <div className="font-display text-[16px] font-bold text-ink">
            Filtrar equipe
            {total > 0 && (
              <span className="ml-1.5 font-mono text-[13px] text-primary">({total})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {total > 0 && (
              <button
                onClick={() => {
                  setDraftSup([]);
                  setDraftLead([]);
                }}
                className="cursor-pointer rounded-lg border-none bg-transparent px-2 py-1 font-body text-[11px] font-semibold text-ink-faint"
              >
                Limpar
              </button>
            )}
            <button
              onClick={() => onApply(draftSup, draftLead)}
              className="cursor-pointer rounded-lg border-none bg-primary px-3 py-1.5 font-body text-[12px] font-bold text-white"
            >
              Aplicar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="mb-4">
            <div className="mb-2 font-body text-[11px] font-bold text-ink-faint uppercase tracking-[0.5px]">
              Supervisão{" "}
              {draftSup.length > 0 && <span className="text-primary">· {draftSup.length}</span>}
            </div>
            <Roll
              list={supervisors}
              ids={draftSup}
              toggle={(id) =>
                setDraftSup((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
              }
              label="supervisor"
            />
          </div>
          <div className="mb-4 h-px bg-line-soft" />
          <div>
            <div className="mb-2 font-body text-[11px] font-bold text-ink-faint uppercase tracking-[0.5px]">
              Liderança{" "}
              {draftLead.length > 0 && <span className="text-primary">· {draftLead.length}</span>}
            </div>
            <Roll
              list={leaders}
              ids={draftLead}
              toggle={(id) =>
                setDraftLead((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
              }
              label="líder"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────

export function PastorHome() {
  const { data: allGds } = useAllGds();
  const scrollRef = useRef<HTMLDivElement>(null);

  const defaultKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  // Period: two-key range via inline month pills (two-tap flow)
  const [startKey, setStartKey] = useState(defaultKey);
  const [endKey, setEndKey] = useState(defaultKey);
  const [rangeStep, setRangeStep] = useState<1 | 2>(1);

  // Staff: multi-select via drawer
  const [supervisorIds, setSupervisorIds] = useState<string[]>([]);
  const [leaderIds, setLeaderIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: stats, isLoading } = useDashboardStats(startKey, endKey, supervisorIds, leaderIds);

  const { supervisors, leaders } = useMemo(() => {
    const sm = new Map<string, StaffMember>();
    const lm = new Map<string, StaffMember>();
    for (const g of allGds?.gds || []) {
      for (const s of g.staff || []) {
        if (!s.profileName) continue;
        if (s.profileRole === "supervisor" && !sm.has(s.profileId))
          sm.set(s.profileId, { id: s.profileId, name: s.profileName });
        if (s.profileRole === "leader" && !lm.has(s.profileId))
          lm.set(s.profileId, { id: s.profileId, name: s.profileName });
      }
    }
    return { supervisors: Array.from(sm.values()), leaders: Array.from(lm.values()) };
  }, [allGds?.gds]);

  const staffCount = supervisorIds.length + leaderIds.length;

  // Scroll to selected month on change
  useEffect(() => {
    if (scrollRef.current) {
      const idx = MONTHS.findIndex((m) => m.key === endKey);
      const el = scrollRef.current.children[idx] as HTMLElement | undefined;
      el?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
    }
  }, [endKey]);

  const cats: Category[] = ["member", "attender", "visitor"];

  // ── Render ────────────────────────────────────────────

  return (
    <div className="px-5 pt-3 pb-6">
      <div className="mb-3 font-display text-2xl font-bold text-ink">Dashboards</div>

      {/* ── Period: inline month strip ── */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="font-body text-[10.5px] font-bold text-ink-faint uppercase tracking-[0.5px]">
          Período
        </div>
        <div className="font-body text-[12px] font-semibold text-ink">
          {rangeLabel(startKey, endKey)}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div
          ref={scrollRef}
          className="flex flex-1 gap-1 overflow-x-auto scrollbar-none"
          style={{ scrollSnapType: "x proximity" }}
        >
          {MONTHS.map((m) => {
            const si = MONTHS.findIndex((x) => x.key === startKey);
            const ei = MONTHS.findIndex((x) => x.key === endKey);
            const mi = MONTHS.findIndex((x) => x.key === m.key);
            const inRange = mi >= Math.min(si, ei) && mi <= Math.max(si, ei);
            const isEdge = mi === si || mi === ei;

            return (
              <button
                key={m.key}
                onClick={() => {
                  if (rangeStep === 1) {
                    setStartKey(m.key);
                    setEndKey(m.key);
                    setRangeStep(2);
                  } else {
                    const a = MONTHS.findIndex((x) => x.key === startKey);
                    const b = MONTHS.findIndex((x) => x.key === m.key);
                    setStartKey(MONTHS[Math.max(a, b)].key);
                    setEndKey(MONTHS[Math.min(a, b)].key);
                    setRangeStep(1);
                  }
                }}
                className="shrink-0 cursor-pointer rounded-full border-none px-3 py-1.5 font-body text-[11.5px] font-semibold transition-all"
                style={{
                  background: isEdge ? "#266BC6" : inRange ? "#DCE7F8" : "transparent",
                  color: isEdge ? "#fff" : inRange ? "#266BC6" : "#9A9A8A",
                  border: isEdge || inRange ? "none" : "1.5px solid #DFD8C0",
                  scrollSnapAlign: "center",
                }}
              >
                {m.short}
              </button>
            );
          })}
        </div>

        {/* ── Staff filter chip ── */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-[11.5px] font-semibold transition-colors active:bg-paper-alt"
          style={{
            background: staffCount > 0 ? "#DCE7F8" : "#FFFFFF",
            color: staffCount > 0 ? "#266BC6" : "#9A9A8A",
            borderColor: staffCount > 0 ? "#266BC6" : "#DFD8C0",
          }}
        >
          <SlidersHorizontal size={12} />
          {staffCount > 0 ? `${staffCount}` : "Equipe"}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
        </div>
      )}

      {/* Stats */}
      {stats && !isLoading && (
        <div className="space-y-4">
          <div className="flex gap-2.5">
            {cats.map((cat) => {
              const count = stats.byCat[cat];
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              const c = categoryColors[cat];
              return (
                <div
                  key={cat}
                  className="flex-1 rounded-2xl px-3 py-3.5 text-center"
                  style={{ background: c.bg }}
                >
                  <div
                    className="font-mono text-[22px] font-bold leading-tight"
                    style={{ color: c.color }}
                  >
                    {count}
                  </div>
                  <div
                    className="mt-0.5 font-body text-[10.5px] font-semibold"
                    style={{ color: c.color }}
                  >
                    {c.label}s
                  </div>
                  <div
                    className="mt-0.5 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-bold"
                    style={{ background: c.color + "18", color: c.color }}
                  >
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-[10px]">
            <MiniStat
              label="Novos membros"
              value={stats.newMembers}
              color={stats.newMembers > 0 ? "#2D8A4E" : undefined}
            />
            <MiniStat label="Total de pessoas" value={stats.total} />
          </div>

          {stats.newMembers > 0 && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3"
              style={{ background: "#DCE7F8" }}
            >
              <TrendingUp size={16} className="text-primary" />
              <span className="font-body text-[12.5px] font-semibold text-primary">
                +{stats.newMembers} novo{stats.newMembers > 1 ? "s" : ""} membro
                {stats.newMembers > 1 ? "s" : ""} no período
              </span>
            </div>
          )}
        </div>
      )}

      {!stats && !isLoading && (
        <div className="py-8 text-center font-body text-[13px] text-ink-faint">
          Nenhum dado disponível para este período.
        </div>
      )}

      <StaffDrawer
        open={drawerOpen}
        selectedSupervisorIds={supervisorIds}
        selectedLeaderIds={leaderIds}
        supervisors={supervisors}
        leaders={leaders}
        onApply={(sup, lead) => {
          setSupervisorIds(sup);
          setLeaderIds(lead);
          setDrawerOpen(false);
        }}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
