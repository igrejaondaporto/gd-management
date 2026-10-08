import type { ReactNode } from "react";
import { MessageCircle, Mail, Clock } from "lucide-react";
import { formatDateTime, whatsappLink } from "@/lib/utils";
import type { GdRequest } from "@/hooks/useGdRequests";
import { GdRequestStatusPill } from "./GdRequestStatusPill";

interface GdRequestCardProps {
  request: GdRequest;
  /** Show which GD it went to (the supervisor list) — the leader card hides
   *  it, since every request there is already for their own GD. */
  showGd?: boolean;
  /** The buttons for whoever is looking: "Escolher GD" for a supervisor,
   *  "Contactei / Entrou / Não deu" for the GD's staff. */
  actions?: ReactNode;
}

/** Portal regions (`membros.regiao`) → label. */
const REGIONS: Record<string, string> = {
  norte: "Norte",
  lisboa: "Lisboa",
  sines: "Sines",
  "castelo-branco": "Castelo Branco",
};

const DAY = 86_400_000;

/** Whole days since `iso`, by calendar day in the viewer's timezone. */
function daysSince(iso: string): number {
  const d = new Date(iso);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.max(0, Math.round((today - start) / DAY));
}

/** "Há 5 dias sem contacto" — counts from the moment the person asked
 *  until someone marks "Contactei". Gold from 3 days, rose from 7: a
 *  person who asked for a group and hears nothing for a week is the
 *  failure this list exists to prevent. */
function WaitingBadge({ days }: { days: number }) {
  const tone =
    days >= 7
      ? "bg-rose-soft text-rose"
      : days >= 3
        ? "bg-gold-soft text-gold"
        : "bg-paper-alt text-ink-soft";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-pill px-2 py-[3px] font-body text-[11px] font-bold ${tone}`}
    >
      <Clock size={12} />
      {days === 0 ? "Hoje" : days === 1 ? "Há 1 dia" : `Há ${days} dias`}
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <div className="font-body text-[10px] font-bold tracking-[0.5px] text-ink-faint uppercase">
        {label}
      </div>
      <div className="mt-px truncate font-body text-[13px] font-semibold text-ink">
        {value ?? "—"}
      </div>
    </div>
  );
}

/** One request, as the person wrote it in the membership form: who, how to
 *  reach them and the little the form tells us that helps pick a GD (where
 *  they live, age, marital status). */
export function GdRequestCard({ request: r, showGd = false, actions }: GdRequestCardProps) {
  const wa = whatsappLink(r.phone);
  const waiting = r.status === "new" || r.status === "assigned";
  const days = daysSince(r.createdAt);
  const regionLabel = r.region ? (REGIONS[r.region] ?? r.region) : null;
  // "Sines · Sines" says nothing twice: the concelho only when it adds to the region
  const region =
    [regionLabel, r.concelho && r.concelho !== regionLabel ? r.concelho : null]
      .filter(Boolean)
      .join(" · ") || null;
  const children =
    r.hasChildren === false
      ? "Não"
      : r.hasChildren
        ? r.childrenNote
          ? `Sim · ${r.childrenNote}`
          : "Sim"
        : null;

  // Who moved it last — the audit line, in the same spirit as the GD status log.
  const trail =
    r.status === "claimed" && r.claimedAt
      ? `${r.claimedByName ?? "Um supervisor"} pegou a ${formatDateTime(r.claimedAt)} · pediu há ${days === 1 ? "1 dia" : `${days} dias`}`
      : r.status === "new"
        ? `Pediu a ${formatDateTime(r.createdAt)} · ainda ninguém falou com ${r.name.split(" ")[0]}`
        : r.statusByName && r.statusAt
          ? `${r.statusByName} · ${formatDateTime(r.statusAt)}`
          : r.assignedByName && r.assignedAt
            ? `Encaminhado por ${r.assignedByName} · ${formatDateTime(r.assignedAt)}`
            : null;

  return (
    <div className="caixa p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 font-display text-[15.5px] font-bold tracking-[-0.02em] text-ink">
          {r.name}
        </div>
        {waiting ? (
          <WaitingBadge days={days} />
        ) : (
          <GdRequestStatusPill
            status={r.status}
            who={r.status === "claimed" ? r.claimedByName?.split(" ")[0] : null}
          />
        )}
      </div>
      {waiting && (
        <div className="mt-0.5 font-body text-[12px] text-ink-faint">
          {days === 0 ? "Pediu hoje, ainda sem contacto" : "sem contacto desde que pediu"}
          {r.status === "assigned" && " · já tem GD"}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-2xl bg-paper-alt px-3.5 py-3">
        <Fact label="Região" value={region} />
        <Fact label="Estado civil" value={r.maritalStatus} />
        <Fact label="Filhos" value={children} />
        <Fact label="Idade" value={r.age != null ? `${r.age} anos` : null} />
      </div>

      {showGd && r.gdName && (
        <div className="mt-2 font-body text-[12.5px] font-semibold text-primary">{r.gdName}</div>
      )}
      {r.notes && (
        <div className="mt-2 font-body text-[12.5px] whitespace-pre-line text-ink-soft">
          {r.notes}
        </div>
      )}

      {(wa || r.email) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-pill bg-primary-soft px-3 py-1.5 font-body text-[12.5px] font-semibold text-primary no-underline"
            >
              <MessageCircle size={14} />
              {r.phone}
            </a>
          )}
          {r.email && (
            <a
              href={`mailto:${r.email}`}
              className="inline-flex min-w-0 items-center gap-1.5 rounded-pill bg-paper-alt px-3 py-1.5 font-body text-[12.5px] font-semibold text-ink-soft no-underline"
            >
              <Mail size={14} className="shrink-0" />
              <span className="truncate">{r.email}</span>
            </a>
          )}
        </div>
      )}

      {trail && <div className="mt-2.5 font-body text-[11.5px] text-ink-faint">{trail}</div>}
      {actions && <div className="mt-3">{actions}</div>}
    </div>
  );
}
