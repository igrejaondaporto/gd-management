import { CHIP_TONE_CLASS } from "@/components/ui/chipTone";
import { GD_STATUS, type GdStatus } from "@/lib/constants";

interface GdHealthPillProps {
  /** null when the GD has never been assessed. */
  status: GdStatus | null;
}

/** The health chip, in one place: the dashboard list, the health panel and the
 *  GD list all show the same three labels with the same colours. */
export function GdHealthPill({ status }: GdHealthPillProps) {
  if (!status) {
    return (
      <span className="shrink-0 rounded-pill border border-dashed border-line px-2 py-[3px] font-body text-[10.5px] font-semibold text-ink-faint">
        Sem avaliação
      </span>
    );
  }

  return (
    <span
      className={`${CHIP_TONE_CLASS[GD_STATUS[status].tone]} shrink-0 font-body text-[10.5px] leading-none`}
    >
      {GD_STATUS[status].label}
    </span>
  );
}
