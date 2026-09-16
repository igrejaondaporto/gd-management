import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Clock, X } from "lucide-react";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { CHIP_TONE_CLASS, CHIP_TONE_COLOR } from "@/components/ui/chipTone";
import { GD_STATUS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { GdStatusUpdate } from "@/hooks/useGdStatus";

interface GdHealthSheetProps {
  open: boolean;
  gdName: string;
  /** Newest first: `[0]` is the current entry, the rest is the history. */
  updates: GdStatusUpdate[];
  onClose: () => void;
}

function Meta({ at, edited, by }: { at: string; edited?: string | null; by: string | null }) {
  const [date, time] = formatDateTime(at).split(" · ");
  return (
    <div className="flex flex-wrap items-center gap-x-2 font-body text-[11.5px] text-ink-faint">
      <span className="font-semibold text-ink-soft">{date}</span>
      <span>{time}</span>
      {by && <span>· {by}</span>}
      {edited && <span className="italic">· editado</span>}
    </div>
  );
}

/**
 * Read-only view of one GD's health, opened from the dashboard.
 *
 * The current entry gets room to breathe — full text, no truncation — and the
 * history sits below it on a rail with a card per entry. Nothing here writes:
 * assessing a GD is done from the GD page, where the person is already looking
 * at the group's numbers.
 */
export function GdHealthSheet({ open, gdName, updates, onClose }: GdHealthSheetProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const current = updates[0] ?? null;
  const history = updates.slice(1);

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 animate-fade-in bg-ink/45" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-[560px] animate-slide-up flex-col overflow-hidden rounded-t-[26px] bg-card shadow-lg">
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-line" />

        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-4 pb-3">
          <div className="min-w-0">
            <div className="font-body text-[10.5px] font-bold tracking-[0.6px] text-ink-faint uppercase">
              Saúde do GD
            </div>
            <div className="truncate font-display text-[19px] font-bold tracking-[-0.03em] text-ink">
              {gdName}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 cursor-pointer rounded-full border-none bg-paper-alt p-2 text-ink-soft"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-6 pb-safe">
          {!current ? (
            <div className="rounded-2xl border border-dashed border-line px-4 py-6 text-center font-body text-[12.5px] text-ink-faint">
              Ainda sem saúde definida para este GD.
            </div>
          ) : (
            <>
              {/* ── current ── */}
              <div className="rounded-2xl bg-paper-alt px-4 py-4">
                <span
                  className={`${CHIP_TONE_CLASS[GD_STATUS[current.status].tone]} inline-block font-body text-[12px] leading-none`}
                >
                  {GD_STATUS[current.status].label}
                </span>
                <div className="mt-2.5">
                  <Meta
                    at={current.createdAt}
                    edited={current.updatedAt}
                    by={current.createdByName}
                  />
                </div>
                {current.comment ? (
                  <p className="mt-3 break-words font-body text-[13.5px] leading-relaxed whitespace-pre-line text-ink">
                    {current.comment}
                  </p>
                ) : (
                  <p className="mt-3 font-body text-[12.5px] text-ink-faint italic">
                    Sem comentário.
                  </p>
                )}
              </div>

              {/* ── history ── */}
              {history.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-center gap-1.5 font-body text-[10.5px] font-bold tracking-[0.6px] text-ink-faint uppercase">
                    <Clock size={12} />
                    Histórico ({history.length})
                  </div>

                  <div className="relative pl-[20px]">
                    <div className="absolute top-2 bottom-2 left-[4px] w-px bg-line" />
                    {history.map((u) => (
                      <div key={u.id} className="relative pb-3 last:pb-0">
                        <div
                          className="absolute top-[15px] -left-[20px] h-[9px] w-[9px] rounded-full ring-2 ring-card"
                          style={{ background: CHIP_TONE_COLOR[GD_STATUS[u.status].tone] }}
                        />
                        <div className="rounded-xl border border-line-soft px-3.5 py-3">
                          <span
                            className={`${CHIP_TONE_CLASS[GD_STATUS[u.status].tone]} inline-block font-body text-[11px] leading-none`}
                          >
                            {GD_STATUS[u.status].label}
                          </span>
                          <div className="mt-2">
                            <Meta at={u.createdAt} edited={u.updatedAt} by={u.createdByName} />
                          </div>
                          {u.comment && (
                            <ExpandableText
                              text={u.comment}
                              className="mt-2.5 font-body text-[12.5px] leading-relaxed text-ink-soft"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
