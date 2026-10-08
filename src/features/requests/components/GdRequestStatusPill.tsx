import { CHIP_TONE_CLASS } from "@/components/ui/chipTone";
import { GD_REQUEST_STATUS, type GdRequestStatus } from "@/lib/constants";

/** The request's status chip. The neutral steps ("Encaminhado",
 *  "Contactado") use the soft primary pill: the plain `.chip` is the
 *  translucent white header chip and disappears on a white card. */
export function GdRequestStatusPill({
  status,
  who,
}: {
  status: GdRequestStatus;
  /** "A tratar · Wilka" — whose request it is while a supervisor deals with it. */
  who?: string | null;
}) {
  const { tone } = GD_REQUEST_STATUS[status];
  const label = who
    ? `${GD_REQUEST_STATUS[status].label} · ${who}`
    : GD_REQUEST_STATUS[status].label;
  if (tone === "default") {
    return (
      <span className="shrink-0 rounded-pill bg-primary-soft px-2 py-[3px] font-body text-[10.5px] font-bold text-primary">
        {label}
      </span>
    );
  }
  return (
    <span className={`${CHIP_TONE_CLASS[tone]} shrink-0 font-body text-[10.5px] leading-none`}>
      {label}
    </span>
  );
}
