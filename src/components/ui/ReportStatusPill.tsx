import { CHIP_TONE_CLASS } from "./chipTone";
import { reportLabel, reportShortLabel, reportTone } from "@/lib/reportStatus";

interface ReportStatusPillProps {
  /** Outstanding reports. 0 = green, 1 = amber, 2+ = red. */
  missing: number;
  /** `short` for dense rows ("3 em falta"), `full` to name the unit. */
  size?: "short" | "full";
  onClick?: () => void;
}

/** The status chip on a light surface. Reuses the header chip classes, so the
 *  colour for a given state is defined in exactly one place. */
export function ReportStatusPill({ missing, size = "short", onClick }: ReportStatusPillProps) {
  const text = size === "full" ? reportLabel(missing) : reportShortLabel(missing);
  const className = `${CHIP_TONE_CLASS[reportTone(missing)]} shrink-0 border-none font-body text-[11px] leading-none`;

  if (onClick) {
    return (
      <button onClick={onClick} className={`${className} cursor-pointer`}>
        {text}
      </button>
    );
  }

  return <span className={className}>{text}</span>;
}
