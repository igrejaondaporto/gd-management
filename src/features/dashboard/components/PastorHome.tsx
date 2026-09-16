import { useState, useMemo, useEffect, useRef } from "react";
import {
  Check,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAllGds } from "@/hooks/useAllGds";
import { useProfile } from "@/hooks/useProfile";
import { categoryColors, colors, MONTHS_PT } from "@/lib/constants";
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
  selectedGdIds,
  supervisors,
  gds,
  isPastor,
  onApply,
}: {
  open: boolean;
  selectedSupervisorIds: string[];
  selectedGdIds: string[];
  supervisors: StaffMember[];
  gds: StaffMember[];
  isPastor: boolean;
  onApply: (supervisorIds: string[], gdIds: string[]) => void;
}) {
  const [draftSup, setDraftSup] = useState(selectedSupervisorIds);
  const [draftGd, setDraftGd] = useState(selectedGdIds);

  useEffect(() => {
    if (open) {
      setDraftSup(selectedSupervisorIds);
      setDraftGd(selectedGdIds);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, selectedSupervisorIds, selectedGdIds]);

  if (!open) return null;

  const total = draftSup.length + draftGd.length;

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
              style={{ color: sel ? colors.primary : colors.ink }}
            >
              {p.name}
            </span>
            {sel && <Check size={16} color={colors.primary} />}
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
      onClick={() => onApply(draftSup, draftGd)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[400px] flex-col animate-slide-up rounded-t-[20px] bg-card shadow-lg sm:rounded-[20px]"
      >
        <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
          <div className="font-display text-[16px] font-bold text-ink">
            Filtrar
            {total > 0 && (
              <span className="ml-1.5 font-mono text-[13px] text-primary">({total})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {total > 0 && (
              <button
                onClick={() => {
                  setDraftSup([]);
                  setDraftGd([]);
                }}
                className="cursor-pointer rounded-lg border-none bg-transparent px-2 py-1 font-body text-[11px] font-semibold text-ink-faint"
              >
                Limpar
              </button>
            )}
            <button
              onClick={() => onApply(draftSup, draftGd)}
              className="cursor-pointer rounded-lg border-none bg-primary px-3 py-1.5 font-body text-[12px] font-bold text-white"
            >
              Aplicar
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {isPastor && supervisors.length > 0 && (
            <>
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
            </>
          )}
          <div>
            <div className="mb-2 font-body text-[11px] font-bold text-ink-faint uppercase tracking-[0.5px]">
              GDs {draftGd.length > 0 && <span className="text-primary">· {draftGd.length}</span>}
            </div>
            <Roll
              list={gds}
              ids={draftGd}
              toggle={(id) =>
                setDraftGd((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
              }
              label="GD"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stacked Bar Chart ────────────────────────────────────

function StackedBarChart({
  data,
  borderless,
}: {
  data: import("@/hooks/useDashboardStats").MonthlyPoint[];
  borderless?: boolean;
}) {
  const cats: { key: Category; color: string; bg: string; label: string }[] = [
    { key: "member", ...categoryColors.member, label: "Membros" },
    { key: "attender", ...categoryColors.attender, label: "Frequentadores" },
    { key: "visitor", ...categoryColors.visitor, label: "Visitantes" },
  ];

  if (data.length === 0) return null;

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const barMaxH = 104;
  const rowH = barMaxH + 42;

  return (
    <div
      className={`${borderless ? "" : "rounded-2xl border border-line-soft bg-card px-4 pt-3.5"} pb-4`}
    >
      {!borderless && (
        <div className="mb-3 font-body text-[10.5px] font-bold text-ink-faint uppercase tracking-[0.5px]">
          Presentes por mês
        </div>
      )}

      {/* Bars — max 4 visible, horizontal scroll for more */}
      <div className="scrollbar-none overflow-x-auto" style={{ paddingBottom: 4 }}>
        <div
          className="flex items-end gap-2"
          style={{ minWidth: data.length > 4 ? data.length * 78 : "100%", height: rowH }}
        >
          {data.map((pt) => {
            const barH = pt.total > 0 ? Math.max(6, (pt.total / maxTotal) * barMaxH) : 0;
            const segments = cats
              .map((c) => ({
                key: c.key,
                color: c.color,
                bg: c.bg,
                label: c.label,
                count: pt.byCat[c.key],
              }))
              .filter((s) => s.count > 0);
            const total = segments.reduce((s, c) => s + c.count, 0);

            return (
              <div
                key={pt.month}
                className="flex flex-col items-center"
                style={{ width: 66, height: rowH, justifyContent: "flex-end" }}
              >
                {/* Total above bar — plain black */}
                <span className="mb-1 font-mono text-[11px] font-bold text-ink">
                  {pt.total || ""}
                </span>

                {/* Bar */}
                {total > 0 ? (
                  <div
                    className="w-full overflow-hidden rounded-t-lg"
                    style={{ height: barH, maxHeight: barMaxH }}
                  >
                    {segments.map((seg) => {
                      const segPct = Math.round((seg.count / total) * 100);
                      const segH = `${((seg.count / total) * 100).toFixed(1)}%`;
                      const tall = barH * (seg.count / total) >= 20;
                      return (
                        <div
                          key={seg.key}
                          className="flex items-center justify-center"
                          style={{
                            height: segH,
                            background: seg.bg,
                            borderBottom: `1px solid ${colors.paper}`,
                          }}
                        >
                          {tall && (
                            <span
                              className="inline-flex items-center gap-1 font-mono text-[10px] font-bold"
                              style={{ color: seg.color }}
                            >
                              {seg.count}
                              <span className="opacity-40">—</span>
                              <span className="font-body text-[9px] opacity-60">{segPct}%</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="w-full rounded-t-lg"
                    style={{ height: 6, background: colors.lineSoft }}
                  />
                )}

                <span className="mt-1.5 font-body text-[10px] font-semibold text-ink-faint">
                  {pt.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex justify-center gap-4">
        {cats.map((c) => (
          <div key={c.key} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ background: c.bg }} />
            <span className="font-body text-[10.5px] font-semibold" style={{ color: c.color }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────

export function PastorHome() {
  const { data: allGds } = useAllGds();
  const { data: profile } = useProfile();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isPastor = profile?.role === "pastor";
  const currentUserId = profile?.id;

  const defaultKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [startKey, setStartKey] = useState(defaultKey);
  const [endKey, setEndKey] = useState(defaultKey);
  const [rangeStep, setRangeStep] = useState<1 | 2>(1);

  const [supervisorIds, setSupervisorIds] = useState<string[]>([]);
  const [gdIds, setGdIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: stats, isLoading } = useDashboardStats(startKey, endKey, supervisorIds, gdIds);

  const supervisors = useMemo(() => {
    if (!isPastor) return [];
    const map = new Map<string, StaffMember>();
    for (const g of allGds?.gds || []) {
      for (const s of g.staff || []) {
        if (s.profileName && s.profileRole === "supervisor" && !map.has(s.profileId)) {
          map.set(s.profileId, { id: s.profileId, name: s.profileName });
        }
      }
    }
    return Array.from(map.values());
  }, [allGds?.gds, isPastor]);

  const gds = useMemo(() => {
    const gdList = allGds?.gds || [];
    if (isPastor) return gdList.map((g) => ({ id: g.id, name: g.name }));
    if (!currentUserId) return [];
    return gdList
      .filter((g) => g.staff?.some((s) => s.profileId === currentUserId))
      .map((g) => ({ id: g.id, name: g.name }));
  }, [allGds?.gds, isPastor, currentUserId]);

  const staffCount = supervisorIds.length + gdIds.length;

  // Expand/collapse
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    visao: true,
    presentes: true,
  });
  const toggle = (k: string) => setOpenSections((p) => ({ ...p, [k]: !p[k] }));

  // Scroll month strip
  const scrollMonths = (dir: -1 | 1) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 120, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const idx = MONTHS.findIndex((m) => m.key === endKey);
      const el = scrollRef.current.children[idx] as HTMLElement | undefined;
      el?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
    }
  }, [endKey]);

  const SectionHeader = ({
    id,
    icon,
    label,
    badge,
  }: {
    id: string;
    icon: React.ReactNode;
    label: string;
    badge?: string;
  }) => {
    const isOpen = openSections[id];
    return (
      <button
        onClick={() => toggle(id)}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-2.5"
      >
        <div className="flex items-center gap-2">
          <span className="text-ink-faint">{icon}</span>
          <span className="font-body text-[11px] font-bold uppercase tracking-[0.5px] text-ink-faint">
            {label}
          </span>
          {badge && (
            <span className="rounded-full bg-primary-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={15}
          className="text-ink-faint transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
    );
  };

  return (
    <div className="px-5 pt-3 pb-6">
      <div className="mb-3 font-display text-2xl font-bold text-ink">Dashboards</div>

      {/* ── Period (filters first) ── */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="font-body text-[10.5px] font-bold text-ink-faint uppercase tracking-[0.5px]">
          Período
        </div>
        <div className="font-body text-[12px] font-semibold text-ink">
          {rangeLabel(startKey, endKey)}
        </div>
      </div>

      <div className="mb-5 flex items-center gap-1.5">
        <button
          onClick={() => scrollMonths(-1)}
          className="hidden shrink-0 cursor-pointer items-center rounded-full border-none bg-transparent p-0.5 text-ink-faint active:text-ink sm:flex"
        >
          <ChevronLeft size={14} />
        </button>

        <div
          ref={scrollRef}
          className="scrollbar-none flex flex-1 gap-1 overflow-x-auto py-0.5"
          style={{ scrollSnapType: "x proximity", WebkitOverflowScrolling: "touch" }}
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
                  background: isEdge
                    ? colors.primary
                    : inRange
                      ? colors.primarySoft
                      : "transparent",
                  color: isEdge ? colors.paper : inRange ? colors.primary : colors.inkFaint,
                  border: isEdge || inRange ? "none" : `1.5px solid ${colors.line}`,
                  scrollSnapAlign: "center",
                }}
              >
                {m.short}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scrollMonths(1)}
          className="hidden shrink-0 cursor-pointer items-center rounded-full border-none bg-transparent p-0.5 text-ink-faint active:text-ink sm:flex"
        >
          <ChevronRight size={14} />
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-[11.5px] font-semibold transition-colors active:bg-paper-alt"
          style={{
            background: staffCount > 0 ? colors.primarySoft : colors.paper,
            color: staffCount > 0 ? colors.primary : colors.inkFaint,
            borderColor: staffCount > 0 ? colors.primary : colors.line,
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

      {/* ── "Visão Geral" section (collapsible) ── */}
      {stats && !isLoading && (
        <div className="mb-1 rounded-2xl border border-line-soft bg-card px-4">
          <SectionHeader
            id="visao"
            icon={<Users size={15} />}
            label="Visão geral"
            badge={String(stats.total)}
          />
          {openSections.visao && (
            <div className="pb-4">
              <div className="mb-2 font-body text-[11px] text-ink-faint">
                Pessoas cadastradas nos GDs selecionados (independentemente de presença no período)
              </div>
              <div className="flex gap-1.5 sm:gap-2.5">
                {(["member", "attender", "visitor"] as Category[]).map((cat) => {
                  const count = stats.byCat[cat];
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  const c = categoryColors[cat];
                  return (
                    <div
                      key={cat}
                      className="flex-1 rounded-2xl px-2 py-2.5 text-center sm:px-3 sm:py-3"
                      style={{ background: c.bg }}
                    >
                      <div
                        className="font-mono text-[17px] font-bold leading-tight sm:text-[20px]"
                        style={{ color: c.color }}
                      >
                        {count}
                      </div>
                      <div
                        className="mt-0.5 truncate font-body text-[9.5px] font-semibold sm:text-[10.5px]"
                        style={{ color: c.color }}
                      >
                        {c.label}s
                      </div>
                      <div
                        className="mt-0.5 inline-block rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold sm:px-2 sm:text-[10px]"
                        style={{ background: c.color + "18", color: c.color }}
                      >
                        {pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── "Presentes" section (collapsible) ── */}
      {stats && !isLoading && stats.perMonth.length > 0 && (
        <div className="rounded-2xl border border-line-soft bg-card px-4">
          <SectionHeader id="presentes" icon={<BarChart3 size={15} />} label="Presentes por mês" />
          {openSections.presentes && (
            <div className="pb-4">
              <StackedBarChart data={stats.perMonth} borderless />
            </div>
          )}
        </div>
      )}

      {/* ── "Novos membros" banner (outside collapse) ── */}
      {stats && !isLoading && stats.perMonth.length > 0 && (
        <div className="mt-3">
          {stats.newMembers > 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-3">
              <TrendingUp size={16} className="text-primary" />
              <span className="font-body text-[12.5px] font-semibold text-primary">
                +{stats.newMembers} novo{stats.newMembers > 1 ? "s" : ""} membro
                {stats.newMembers > 1 ? "s" : ""} no período
              </span>
            </div>
          ) : (
            <div className="rounded-xl border border-line px-4 py-3 text-center font-body text-[12px] text-ink-faint">
              Nenhum novo membro no período
            </div>
          )}
        </div>
      )}

      {!stats && !isLoading && (
        <div className="py-8 text-center font-body text-[13px] text-ink-faint">
          Nenhum dado disponível.
        </div>
      )}

      <StaffDrawer
        open={drawerOpen}
        selectedSupervisorIds={supervisorIds}
        selectedGdIds={gdIds}
        supervisors={supervisors}
        gds={gds}
        isPastor={isPastor}
        onApply={(sup, gd) => {
          setSupervisorIds(sup);
          setGdIds(gd);
          setDrawerOpen(false);
        }}
      />
    </div>
  );
}
