import { useState } from "react";
import type { GdRequestStatus } from "@/lib/constants";
import type { GdRequest } from "@/hooks/useGdRequests";

type NextStatus = Exclude<GdRequestStatus, "new" | "claimed">;

interface GdRequestActionsProps {
  request: GdRequest;
  saving: boolean;
  onSetStatus: (status: NextStatus, addPerson?: boolean) => void;
}

const small = "btn sec flex-1 px-3 py-2 text-[13px]";

/** "Contactei / Entrou / Não deu" — what the GD's staff do with a request.
 *  "Entrou" asks once whether to add the person to the GD's list as a
 *  visitor, so the first attendance is one tap away (the database adds them
 *  only once, even if this is tapped twice). Closed requests can be reopened:
 *  "Não deu" is often "not yet". */
export function GdRequestActions({ request: r, saving, onSetStatus }: GdRequestActionsProps) {
  const [askAdd, setAskAdd] = useState(false);

  if (r.status === "joined" || r.status === "declined") {
    return (
      <button
        disabled={saving}
        onClick={() => onSetStatus("contacted")}
        className={`${small} w-full`}
      >
        Reabrir
      </button>
    );
  }

  if (askAdd) {
    return (
      <div className="rounded-2xl bg-paper-alt p-3">
        <div className="mb-2 font-body text-[13px] text-ink">
          Adicionar {r.name.split(" ")[0]} às pessoas do GD, como visitante?
        </div>
        <div className="flex gap-2">
          <button
            disabled={saving}
            onClick={() => onSetStatus("joined", true)}
            className="btn flex-1 px-3 py-2 text-[13px]"
          >
            Sim, adicionar
          </button>
          <button disabled={saving} onClick={() => onSetStatus("joined", false)} className={small}>
            Só marcar
          </button>
        </div>
        <button
          onClick={() => setAskAdd(false)}
          className="mt-2 w-full cursor-pointer border-none bg-transparent font-body text-[12px] text-ink-faint"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {r.status === "assigned" && (
        <button disabled={saving} onClick={() => onSetStatus("contacted")} className={small}>
          Contactei
        </button>
      )}
      <button
        disabled={saving}
        onClick={() => (r.personId ? onSetStatus("joined") : setAskAdd(true))}
        className={small}
      >
        Entrou
      </button>
      <button disabled={saving} onClick={() => onSetStatus("declined")} className={small}>
        Não deu
      </button>
    </div>
  );
}
