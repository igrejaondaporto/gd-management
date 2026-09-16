import { CHIP_TONE_COLOR } from "@/components/ui/chipTone";
import { GD_STATUS, colors, type GdStatus } from "@/lib/constants";
import { reportTone } from "@/lib/reportStatus";

interface GdStatusSummaryProps {
  /** null when the GD has never been assessed. */
  status: GdStatus | null;
  missingReports: number;
}

/**
 * Inline "Saúde: Bom · Relatórios: 4 em falta" for a dense list.
 *
 * Plain coloured text rather than chips: two filled pills on every row was
 * heavy, and a label in front of each value makes the colour unambiguous
 * without needing a background to carry it. Both halves are always shown, so
 * every row has the same shape and the list scans vertically.
 */
export function GdStatusSummary({ status, missingReports }: GdStatusSummaryProps) {
  const healthLabel = status ? GD_STATUS[status].label : "Sem avaliação";
  const healthColor = status ? CHIP_TONE_COLOR[GD_STATUS[status].tone] : colors.inkFaint;
  const reportLabel = missingReports > 0 ? `${missingReports} em falta` : "em dia";
  const reportColor = CHIP_TONE_COLOR[reportTone(missingReports)];

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-body text-[11.5px] leading-snug">
      {/* `whitespace-nowrap` keeps "Saúde: Bom" together — wrapping between the
          label and its value would break the pairing. */}
      <span className="whitespace-nowrap">
        <span className="font-semibold text-ink-faint">Saúde:</span>{" "}
        <span className="font-bold" style={{ color: healthColor }}>
          {healthLabel}
        </span>
      </span>
      <span aria-hidden="true" className="text-line">
        ·
      </span>
      <span className="whitespace-nowrap">
        <span className="font-semibold text-ink-faint">Relatórios:</span>{" "}
        <span className="font-bold" style={{ color: reportColor }}>
          {reportLabel}
        </span>
      </span>
    </div>
  );
}
