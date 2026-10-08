import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui";
import type { GdWithStaff } from "@/hooks/useGds";
import type { GdRequest } from "@/hooks/useGdRequests";
import type { GdRequestStatus } from "@/lib/constants";
import { AssignGdSheet } from "./AssignGdSheet";
import { GdRequestActions } from "./GdRequestActions";
import { GdRequestCard } from "./GdRequestCard";

type Tab = "new" | "claimed" | "open" | "closed";

const TABS: { key: Tab; label: string; statuses: GdRequestStatus[] }[] = [
  { key: "new", label: "Novos", statuses: ["new"] },
  { key: "claimed", label: "A tratar", statuses: ["claimed"] },
  { key: "open", label: "Com o GD", statuses: ["assigned", "contacted"] },
  { key: "closed", label: "Fechados", statuses: ["joined", "declined"] },
];

const EMPTY: Record<Tab, string> = {
  new: "Nenhum pedido novo. Chegam do formulário de membro do Portal.",
  claimed: "Nenhum supervisor está a tratar de um pedido agora.",
  open: "Nenhum pedido com um GD a tratar dele agora.",
  closed: "Ainda nenhum pedido fechado.",
};

const INTRO: Record<Tab, string> = {
  new: "Pediram no formulário de membro ajuda para encontrar um GD. Pega num pedido para os outros supervisores saberem que já estás a tratar dele.",
  claimed:
    "Quem pegou fala com a pessoa e escolhe o GD que lhe serve melhor. O pedido aparece logo aos líderes desse GD.",
  open: "Já têm GD. O líder fala com a pessoa e marca como correu.",
  closed: "Entraram num GD, ou não deu.",
};

interface GdRequestsPanelProps {
  requests: GdRequest[];
  gds: GdWithStaff[];
  /** Who is looking: "my" taken requests get the GD picker, and a pastor
   *  may also route one someone else took. */
  currentUserId: string | undefined;
  isPastor: boolean;
  claiming: boolean;
  assigning: boolean;
  onClaim: (id: string) => Promise<unknown>;
  onRelease: (id: string) => Promise<unknown>;
  savingStatus: boolean;
  onAssign: (id: string, gdId: string | null) => Promise<unknown>;
  onSetStatus: (
    id: string,
    status: Exclude<GdRequestStatus, "new" | "claimed">,
    addPerson?: boolean,
  ) => Promise<unknown>;
}

/** The supervisor's/pastor's inbox of requests to join a GD: route the new
 *  ones, follow the ones in progress (and act on them, like the GD's staff
 *  can), and look back at what happened. */
export function GdRequestsPanel({
  requests,
  gds,
  currentUserId,
  isPastor,
  claiming,
  assigning,
  savingStatus,
  onClaim,
  onRelease,
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
    const out = { new: [], claimed: [], open: [], closed: [] } as Record<Tab, GdRequest[]>;
    for (const r of requests) {
      const t = TABS.find((x) => x.statuses.includes(r.status));
      if (t) out[t.key].push(r);
    }
    // Oldest first while waiting — whoever asked first is answered first.
    out.new.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    // mine first, then the oldest
    out.claimed.sort(
      (a, b) =>
        Number(b.claimedById === currentUserId) - Number(a.claimedById === currentUserId) ||
        a.createdAt.localeCompare(b.createdAt),
    );
    return out;
  }, [requests, currentUserId]);

  const list = byTab[tab];

  return (
    <div className="px-5 pt-4 pb-6">
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

      <div className="mb-4 font-body text-[13px] text-ink-soft">{INTRO[tab]}</div>

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
                  <button
                    disabled={claiming}
                    onClick={() => attempt(() => onClaim(r.id))}
                    className="btn full py-2.5 text-[14px]"
                  >
                    Vou tratar deste pedido
                  </button>
                ) : r.status === "claimed" ? (
                  r.claimedById === currentUserId || isPastor ? (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => setPicking(r)} className="btn full py-2.5 text-[14px]">
                        Escolher GD
                      </button>
                      <button
                        onClick={() => attempt(() => onRelease(r.id))}
                        className="cursor-pointer border-none bg-transparent font-body text-[12.5px] font-semibold text-ink-faint"
                      >
                        {r.claimedById === currentUserId
                          ? "Largar o pedido (volta aos Novos)"
                          : `Tirar a ${r.claimedByName?.split(" ")[0] ?? "quem pegou"} (volta aos Novos)`}
                      </button>
                    </div>
                  ) : null
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
