import type { ReactNode } from "react";
import { MessageCircle, Mail } from "lucide-react";
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

/** One request, as the person wrote it in the membership form: who, how to
 *  reach them and the little the form tells us that helps pick a GD (where
 *  they live, age, marital status). */
export function GdRequestCard({ request: r, showGd = false, actions }: GdRequestCardProps) {
  const wa = whatsappLink(r.phone);
  const facts = [
    r.concelho && `Mora em ${r.concelho}`,
    r.age != null && `${r.age} anos`,
    r.maritalStatus,
  ].filter(Boolean);

  // Who moved it last — the audit line, in the same spirit as the GD status log.
  const trail =
    r.status === "new"
      ? `Chegou a ${formatDateTime(r.createdAt)}`
      : r.statusByName && r.statusAt
        ? `${r.statusByName} · ${formatDateTime(r.statusAt)}`
        : r.assignedByName && r.assignedAt
          ? `Encaminhado por ${r.assignedByName} · ${formatDateTime(r.assignedAt)}`
          : null;

  return (
    <div className="caixa p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-[15.5px] font-bold tracking-[-0.02em] text-ink">
            {r.name}
          </div>
          {facts.length > 0 && (
            <div className="mt-0.5 font-body text-[12.5px] text-ink-soft">{facts.join(" · ")}</div>
          )}
        </div>
        <GdRequestStatusPill status={r.status} />
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
