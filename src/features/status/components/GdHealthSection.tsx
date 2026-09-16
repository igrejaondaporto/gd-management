import { useState } from "react";
import { Clock, Pencil, Plus } from "lucide-react";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { CHIP_TONE_CLASS, CHIP_TONE_COLOR } from "@/components/ui/chipTone";
import { StatusUpdateSheet } from "./StatusUpdateSheet";
import {
  useAddGdStatusUpdate,
  useEditGdStatusUpdate,
  useGdStatusUpdates,
  type GdStatusUpdate,
} from "@/hooks/useGdStatus";
import { GD_STATUS, type GdStatus } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

interface GdHealthSectionProps {
  gdId: string;
}

/** "12 set 2026 · 19:30" split so the date reads first and the time is quiet. */
function Meta({ at, edited, by }: { at: string; edited?: string | null; by: string | null }) {
  const [date, time] = formatDateTime(at).split(" · ");
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-body text-[11px] text-ink-faint">
      <span className="font-semibold text-ink-soft">{date}</span>
      <span>{time}</span>
      {by && <span>· {by}</span>}
      {edited && <span className="italic">· editado</span>}
    </div>
  );
}

function StatusPill({ status }: { status: GdStatus }) {
  return (
    <span
      className={`${CHIP_TONE_CLASS[GD_STATUS[status].tone]} inline-block shrink-0 font-body text-[11px] leading-none`}
    >
      {GD_STATUS[status].label}
    </span>
  );
}

/**
 * Supervisor/pastor view of how a GD is doing: the latest assessment plus the
 * log behind it.
 *
 * `updates[0]` is the current status and the rest is the history, so the timeline
 * below lists only the *previous* entries — the newest is already the card, and
 * repeating it would just add noise.
 */
export function GdHealthSection({ gdId }: GdHealthSectionProps) {
  const { data: updates = [], isLoading } = useGdStatusUpdates(gdId);
  const addUpdate = useAddGdStatusUpdate(gdId);
  const editUpdate = useEditGdStatusUpdate(gdId);
  const [sheetOpen, setSheetOpen] = useState(false);
  /** Non-null when the sheet is correcting an existing entry. */
  const [editing, setEditing] = useState<GdStatusUpdate | null>(null);

  const current = updates[0] ?? null;
  const history = updates.slice(1);

  const openNew = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (entry: GdStatusUpdate) => {
    setEditing(entry);
    setSheetOpen(true);
  };

  const handleSubmit = (status: GdStatus, comment: string) => {
    const done = { onSuccess: () => setSheetOpen(false) };
    if (editing) editUpdate.mutate({ id: editing.id, status, comment }, done);
    else addUpdate.mutate({ status, comment }, done);
  };

  return (
    <div className="mt-1">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="font-body text-[12.5px] font-bold tracking-[0.6px] text-ink-soft uppercase">
          Saúde do GD
        </div>
        {!isLoading && (
          <button
            onClick={openNew}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-pill border-none bg-primary-soft px-3 py-1.5 font-body text-[11.5px] font-bold text-primary"
          >
            <Plus size={13} />
            {current ? "Atualizar" : "Definir"}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : current ? (
        <div className="rounded-2xl border border-line-soft bg-card px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <StatusPill status={current.status} />
            <button
              onClick={() => openEdit(current)}
              aria-label="Editar este estado"
              className="flex shrink-0 cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-body text-[11.5px] font-bold text-ink-faint"
            >
              <Pencil size={12} />
              Editar
            </button>
          </div>
          <div className="mt-2">
            <Meta at={current.createdAt} edited={current.updatedAt} by={current.createdByName} />
          </div>
          {current.comment && (
            <ExpandableText
              text={current.comment}
              className="mt-3 font-body text-[13px] leading-relaxed text-ink-soft"
            />
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line px-4 py-4 text-center font-body text-[12.5px] text-ink-faint">
          Ainda sem estado definido para este GD.
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4">
          <div className="mb-2.5 flex items-center gap-1.5 font-body text-[10.5px] font-bold tracking-[0.6px] text-ink-faint uppercase">
            <Clock size={12} />
            Histórico ({history.length})
          </div>

          {/* Vertical rail: a dot per entry with a line joining them. */}
          <div className="relative pl-[18px]">
            <div className="absolute top-1.5 bottom-1.5 left-[4px] w-px bg-line" />
            {history.map((u) => (
              <div key={u.id} className="relative pb-5 last:pb-0">
                <div
                  className="absolute top-[3px] -left-[18px] h-[9px] w-[9px] rounded-full ring-2 ring-card"
                  style={{ background: CHIP_TONE_COLOR[GD_STATUS[u.status].tone] }}
                />
                <StatusPill status={u.status} />
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
            ))}
          </div>
        </div>
      )}

      <StatusUpdateSheet
        open={sheetOpen}
        editing={editing}
        currentStatus={current?.status ?? null}
        saving={addUpdate.isPending || editUpdate.isPending}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
