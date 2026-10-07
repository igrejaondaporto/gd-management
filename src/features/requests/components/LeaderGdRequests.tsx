import { useState } from "react";
import type { GdRequest } from "@/hooks/useGdRequests";
import type { GdRequestStatus } from "@/lib/constants";
import { GdRequestActions } from "./GdRequestActions";
import { GdRequestCard } from "./GdRequestCard";

interface LeaderGdRequestsProps {
  /** Already limited by RLS to the GDs this person serves on. */
  requests: GdRequest[];
  /** More than one GD → each card says which. */
  multipleGds: boolean;
  saving: boolean;
  onSetStatus: (
    id: string,
    status: Exclude<GdRequestStatus, "new">,
    addPerson?: boolean,
  ) => Promise<unknown>;
}

/** "Pedidos para o teu GD" — on the leader's home, above the GD list, so a
 *  request sent by the supervisor is the first thing they see. Only the open
 *  ones (`assigned`/`contacted`): once it is "Entrou" or "Não deu" it leaves
 *  the home screen, and the supervisor's "Fechados" keeps the record. */
export function LeaderGdRequests({
  requests,
  multipleGds,
  saving,
  onSetStatus,
}: LeaderGdRequestsProps) {
  const [error, setError] = useState<string | null>(null);
  const open = requests.filter((r) => r.status === "assigned" || r.status === "contacted");
  if (open.length === 0) return null;

  return (
    <div className="px-5 pt-4">
      <div className="mb-1 font-display text-[19px] font-bold tracking-[-0.03em] text-ink">
        {open.length === 1 ? "1 pedido para o teu GD" : `${open.length} pedidos para o teu GD`}
      </div>
      <div className="mb-3 font-body text-[13px] text-ink-soft">
        Querem entrar num GD e o supervisor escolheu o teu. Fala com eles e marca como correu.
      </div>
      {error && (
        <div className="mb-3 rounded-xl bg-rose-soft px-3 py-2 font-body text-[12.5px] text-rose">
          Não gravou: {error}
        </div>
      )}
      <div className="flex flex-col gap-[10px]">
        {open.map((r) => (
          <GdRequestCard
            key={r.id}
            request={r}
            showGd={multipleGds}
            actions={
              <GdRequestActions
                request={r}
                saving={saving}
                onSetStatus={async (status, addPerson) => {
                  setError(null);
                  try {
                    await onSetStatus(r.id, status, addPerson);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Não foi possível gravar.");
                  }
                }}
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
