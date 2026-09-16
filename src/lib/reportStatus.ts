import type { StatusTone } from "@/components/ui/chipTone";

/**
 * How many outstanding reports map to which tone. The single rule shared by
 * the GD header chip and the dashboard:
 *
 *   0 → green "em dia" · 1 → amber · 2+ → red
 *
 * The *count* itself comes from the `gd_report_status` function in the
 * database, so this file only decides how it is presented.
 */
export function reportTone(missing: number): StatusTone {
  if (missing <= 0) return "success";
  return missing === 1 ? "warning" : "danger";
}

export function reportLabel(missing: number): string {
  if (missing <= 0) return "Relatórios em dia";
  return `${missing} relatório${missing !== 1 ? "s" : ""} em falta`;
}

/** Shorter form for dense rows (the dashboard list). */
export function reportShortLabel(missing: number): string {
  return missing <= 0 ? "Em dia" : `${missing} em falta`;
}
