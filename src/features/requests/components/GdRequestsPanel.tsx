import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui";
import type { GdWithStaff } from "@/hooks/useGds";
import type { GdRequest } from "@/hooks/useGdRequests";
import type { GdRequestStatus } from "@/lib/constants";
import { AssignGdSheet } from "./AssignGdSheet";
import { GdRequestActions } from "./GdRequestActions";
import { GdRequestCard } from "./GdRequestCard";

type Tab = "new" | "open" | "closed";

const TABS: { key: Tab; label: string; statuses: GdRequestStatus[] }[] = [
  { key: "new", label: "Por encaminhar", statuses: ["new"] },
  { key: "open", label: "Em curso", statuses: ["assigned", "contacted"] },
  { key: "closed", label: "Fechados", statuses: ["joined", "declined"] },
];

const EMPTY: Record<Tab, string> = {
  new: "Nenhum pedido à espera. Os novos chegam do formulário de membro do Portal.",
  open: "Nenhum pedido com um GD a tratar dele agora.",
  closed: "Ainda nenhum pedido fechado.",
};

interface GdRequestsPanelProps {
  requests: GdRequest[];
  gds: GdWithStaff[];
  assigning: boolean;
  savingStatus: boolean;
  onAssign: (id: string, gdId: string | null) => Promise<unknown>;
  onSetStatus: (
    id: string,
    status: Exclude<GdRequestStatus, "new">,
    addPerson?: boolean,
  ) => Promise<unknown>;
}

/** The supervisor's/pastor's inbox of requests to join a GD: route the new
 *  ones, follow the ones in progress (and act on them, like the GD's staff
 *  can), and look back at what happened. */
export function GdRequestsPanel({
  requests,
  gds,
  assigning,
  savingStatus,
  onAssign,
  onSetStatus,
}: GdRequestsPanelProps) {
  const [tab, setTab] = useState<Tab>("new");
  const [picking, setPicking] = useState<GdRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  // One place to surface a refused write (e.g. a GD archived meanwhile) —
  // the mutations throw, and a silent failure would look like a frozen button.
  const attempt = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível gravar.");
      return false;
    }
  };

  const byTab = useMemo(() => {
    const out = { new: [], open: [], closed: [] } as Record<Tab, GdRequest[]>;
    for (const r of requests) {
      const t = TABS.find((x) => x.statuses.includes(r.status));
      if (t) out[t.key].push(r);
    }
    // Oldest first while waiting — whoever asked first is answered first.
    out.new.reverse();
    return out;
  }, [requests]);

  const list = byTab[tab];

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="mb-4 font-body text-[13.5px] text-ink-soft">
        Pediram no formulário de membro ajuda para encontrar um GD. Escolhe o GD de cada um — o
        pedido aparece logo aos líderes desse GD.
      </div>

      <div className="mb-4 flex gap-1.5 overflow-x-auto">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-pill border px-3 py-1.5 font-body text-[12.5px] font-semibold ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-card text-ink-soft"
              }`}
            >
              {t.label}
              <span
                className={`font-mono text-[11px] ${active ? "text-white/80" : "text-ink-faint"}`}
              >
                {byTab[t.key].length}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-3 rounded-xl bg-rose-soft px-3 py-2 font-body text-[12.5px] text-rose">
          Não gravou: {error}
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState icon={<Inbox size={28} />} title="Nada aqui" description={EMPTY[tab]} />
      ) : (
        <div className="flex flex-col gap-[10px]">
          {list.map((r) => (
            <GdRequestCard
              key={r.id}
              request={r}
              showGd
              actions={
                r.status === "new" ? (
                  <button onClick={() => setPicking(r)} className="btn full py-2.5 text-[14px]">
                    Escolher GD
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <GdRequestActions
                      request={r}
                      saving={savingStatus}
                      onSetStatus={(status, addPerson) =>
                        attempt(() => onSetStatus(r.id, status, addPerson))
                      }
                    />
                    {r.status !== "joined" && (
                      <button
                        onClick={() => setPicking(r)}
                        className="cursor-pointer border-none bg-transparent font-body text-[12.5px] font-semibold text-primary"
                      >
                        Mudar de GD
                      </button>
                    )}
                  </div>
                )
              }
            />
          ))}
        </div>
      )}

      <AssignGdSheet
        request={picking}
        gds={gds}
        saving={assigning}
        onClose={() => setPicking(null)}
        onAssign={async (gdId) => {
          if (!picking) return;
          await attempt(() => onAssign(picking.id, gdId));
          setPicking(null);
        }}
      />
    </div>
  );
}
