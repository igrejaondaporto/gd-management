import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CHIP_TONE_CLASS } from "@/components/ui/chipTone";
import { GD_STATUS, GD_STATUS_ORDER, type GdStatus } from "@/lib/constants";
import type { GdStatusUpdate } from "@/hooks/useGdStatus";

interface StatusUpdateSheetProps {
  open: boolean;
  /** When set, the sheet edits this entry instead of appending a new one. */
  editing: GdStatusUpdate | null;
  /** Pre-selects the current status so "just adding a comment" is one tap. */
  currentStatus: GdStatus | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (status: GdStatus, comment: string) => void;
}

const MAX_COMMENT = 2000;

/** Bottom sheet to record a new assessment. Follows the same pattern as
 *  `AdminDrawer`/`AddPeopleSheet`: portalled into `document.body`, because a
 *  fixed overlay rendered inside the `.crista` header is trapped by its
 *  stacking context. */
export function StatusUpdateSheet({
  open,
  editing,
  currentStatus,
  saving,
  onClose,
  onSubmit,
}: StatusUpdateSheetProps) {
  const isEditing = !!editing;
  const [status, setStatus] = useState<GdStatus | null>(currentStatus);
  const [comment, setComment] = useState("");

  // Reset on every open, seeding from the entry being edited when there is one.
  useEffect(() => {
    if (!open) return;
    setStatus(editing?.status ?? currentStatus);
    setComment(editing?.comment ?? "");
  }, [open, editing, currentStatus]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const canSave = !!status && !saving;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 animate-fade-in bg-ink/45" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-[560px] animate-slide-up flex-col overflow-hidden rounded-t-[26px] bg-card shadow-lg">
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-line" />

        <div className="flex shrink-0 items-start justify-between px-5 pt-4 pb-2">
          <div>
            <div className="font-display text-[19px] font-bold tracking-[-0.03em] text-ink">
              {isEditing ? "Editar registo" : "Saúde do GD"}
            </div>
            <div className="mt-0.5 font-body text-[12.5px] text-ink-faint">
              {isEditing
                ? "Corrige o que ficou mal escrito. Não cria uma entrada nova."
                : "Fica registado no histórico com a data e o teu nome."}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="cursor-pointer rounded-full border-none bg-paper-alt p-2 text-ink-soft"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 pt-2 pb-4">
          <div>
            <div className="mb-2 font-body text-[10.5px] font-bold tracking-[0.6px] text-ink-faint uppercase">
              Como está o grupo?
            </div>
            <div className="flex gap-2">
              {GD_STATUS_ORDER.map((key) => {
                const active = status === key;
                return (
                  <button
                    key={key}
                    onClick={() => setStatus(key)}
                    aria-pressed={active}
                    className={`${CHIP_TONE_CLASS[GD_STATUS[key].tone]} flex-1 cursor-pointer border-none py-3 font-body text-[13px] font-bold transition-opacity ${
                      active ? "opacity-100 ring-2 ring-ink/25" : "opacity-45"
                    }`}
                  >
                    {GD_STATUS[key].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <div className="font-body text-[10.5px] font-bold tracking-[0.6px] text-ink-faint uppercase">
                Comentário
              </div>
              <div className="font-body text-[10.5px] text-ink-faint">
                {comment.length}/{MAX_COMMENT}
              </div>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
              rows={5}
              placeholder="O que está a correr bem, o que precisa de atenção…"
              className="w-full resize-none rounded-[14px] border border-line bg-card px-4 py-3 font-body text-[13.5px] leading-relaxed text-ink outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* `pb-safe` handles the notch inset, but it is 0 on a desktop browser,
            which left the button flush against the bottom edge. The inner
            `pb-4` guarantees visible space in both cases. */}
        <div className="shrink-0 border-t border-line-soft px-5 pt-4 pb-safe">
          <div className="pb-4">
            <button
              onClick={() => status && onSubmit(status, comment)}
              disabled={!canSave}
              className="w-full cursor-pointer rounded-xl border-none bg-primary px-[13px] py-3 font-body text-[14.5px] font-bold text-white disabled:opacity-40"
            >
              {saving
                ? "Salvando…"
                : isEditing
                  ? "Guardar alterações"
                  : status
                    ? "Guardar estado"
                    : "Escolhe um estado"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
