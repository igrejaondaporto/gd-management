import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { GdHealthPill } from "./GdHealthPill";
import { GdHealthSheet } from "./GdHealthSheet";
import { type GdStatus } from "@/lib/constants";
import { truncateAtWord } from "@/lib/utils";
import type { GdStatusUpdate } from "@/hooks/useGdStatus";

interface GdHealthPanelProps {
  /** GDs in the current team scope. */
  gds: { id: string; name: string }[];
  /** Newest-first entries per GD, from `useGdHealthOverview`. */
  health: Record<string, GdStatusUpdate[]>;
}

/** Characters of the current comment shown in the list before the ellipsis.
 *  Matches the collapse threshold of `ExpandableText`; the full text is in the
 *  sheet that opens on tap. */
const PREVIEW_LIMIT = 500;

/** Worst first, then GD without an entry, then alphabetical. */
const SEVERITY: Record<GdStatus, number> = { bad: 0, attention: 1, good: 2 };
function rank(status: GdStatus | null): number {
  return status ? SEVERITY[status] : 3;
}

/**
 * Dashboard list of every GD's health. Read-only: it answers "which groups
 * need attention" at a glance, and tapping a row opens the full entry with its
 * history. Assessing happens on the GD page.
 */
export function GdHealthPanel({ gds, health }: GdHealthPanelProps) {
  const [openGd, setOpenGd] = useState<{ id: string; name: string } | null>(null);

  const rows = useMemo(() => {
    return gds
      .map((gd) => {
        const updates = health[gd.id] ?? [];
        return { ...gd, current: updates[0] ?? null };
      })
      .sort(
        (a, b) =>
          rank(a.current?.status ?? null) - rank(b.current?.status ?? null) ||
          a.name.localeCompare(b.name),
      );
  }, [gds, health]);

  if (rows.length === 0) return null;

  return (
    <>
      <div className="flex flex-col gap-1.5">
        {rows.map((row) => {
          const status = row.current?.status ?? null;
          const comment = row.current?.comment ?? null;
          return (
            <button
              key={row.id}
              onClick={() => setOpenGd({ id: row.id, name: row.name })}
              className="w-full cursor-pointer rounded-xl border border-line-soft bg-card px-3.5 py-3 text-left transition-colors active:bg-paper-alt"
            >
              <div className="flex items-center gap-2">
                <GdHealthPill status={status} />
                <span className="min-w-0 flex-1 truncate font-body text-[13px] font-semibold text-ink">
                  {row.name}
                </span>
                <ChevronRight size={15} className="shrink-0 text-ink-faint" />
              </div>

              {comment && (
                <p className="mt-1.5 break-words font-body text-[11.5px] leading-snug text-ink-faint">
                  {truncateAtWord(comment, PREVIEW_LIMIT)}
                  {comment.length > PREVIEW_LIMIT ? "…" : ""}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <GdHealthSheet
        open={!!openGd}
        gdName={openGd?.name ?? ""}
        updates={openGd ? (health[openGd.id] ?? []) : []}
        onClose={() => setOpenGd(null)}
      />
    </>
  );
}
