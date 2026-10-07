import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Search, X } from "lucide-react";
import { formatSchedule } from "@/lib/utils";
import type { GdWithStaff } from "@/hooks/useGds";
import type { GdRequest } from "@/hooks/useGdRequests";

interface AssignGdSheetProps {
  request: GdRequest | null;
  gds: GdWithStaff[];
  saving: boolean;
  onClose: () => void;
  onAssign: (gdId: string | null) => void;
}

/** Pick the GD a request goes to. Bottom sheet portalled into `body`, like
 *  `StatusUpdateSheet` (a fixed overlay inside `.crista` is trapped by its
 *  stacking context). Each GD shows its day/time and leaders — what a
 *  supervisor weighs when matching someone to a group. */
export function AssignGdSheet({ request, gds, saving, onClose, onAssign }: AssignGdSheetProps) {
  const [query, setQuery] = useState("");
  const open = !!request;

  useEffect(() => {
    if (!open) return;
    setQuery("");
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return gds.filter((g) => g.active).filter((g) => !q || g.name.toLowerCase().includes(q));
  }, [gds, query]);

  if (!request) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 animate-fade-in bg-ink/45" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-[560px] animate-slide-up flex-col overflow-hidden rounded-t-[26px] bg-card shadow-lg">
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-line" />

        <div className="flex shrink-0 items-start justify-between px-5 pt-4 pb-2">
          <div className="min-w-0">
            <div className="font-display text-[19px] font-bold tracking-[-0.03em] text-ink">
              Para que GD?
            </div>
            <div className="mt-0.5 font-body text-[12.5px] text-ink-faint">
              {request.name}
              {request.concelho ? ` · mora em ${request.concelho}` : ""}
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

        <div className="shrink-0 px-5 pb-2">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2">
            <Search size={15} className="text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar GD"
              className="min-w-0 flex-1 border-none bg-transparent font-body text-[14px] text-ink outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto px-5 pt-1 pb-6 pb-safe">
          {list.map((gd) => {
            const current = gd.id === request.gdId;
            const leaders = gd.staff
              .filter((s) => s.profileRole === "leader")
              .map((s) => s.profileName || "?");
            const schedule = formatSchedule(gd.weekday, gd.startTime);
            return (
              <button
                key={gd.id}
                disabled={saving}
                onClick={() => onAssign(gd.id)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors active:bg-paper-alt disabled:opacity-60 ${
                  current ? "border-primary bg-primary-soft" : "border-line bg-card"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[14.5px] font-bold tracking-[-0.02em] text-ink">
                    {gd.name}
                  </div>
                  <div className="mt-0.5 font-body text-[12px] text-ink-soft">
                    {[schedule, leaders.length ? `Líder: ${leaders.join(", ")}` : "Sem líder"]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                {current && <Check size={16} className="shrink-0 text-primary" />}
              </button>
            );
          })}
          {list.length === 0 && (
            <div className="py-6 text-center font-body text-[13px] text-ink-faint">
              Nenhum GD com esse nome.
            </div>
          )}

          {request.gdId && (
            <button disabled={saving} onClick={() => onAssign(null)} className="btn sec full mt-2">
              Tirar do GD (volta a “Por encaminhar”)
            </button>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
