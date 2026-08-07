import { MONTHS_PT } from "./constants";

let counter = 100;
export function genId(prefix: string): string {
  return `${prefix}${counter++}`;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatWeekLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_PT[d.getMonth()]}`;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS_PT[parseInt(m, 10) - 1]} de ${y}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

export function nextWeekISO(weeks: { dateISO: string }[]): string {
  if (weeks.length === 0) return "2026-08-04";
  return addDays(weeks[weeks.length - 1].dateISO, 7);
}
