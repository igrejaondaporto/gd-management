import { MONTHS_PT, WEEKDAY_SHORT } from "./constants";

let counter = 100;
export function genId(prefix: string): string {
  return `${prefix}${counter++}`;
}

/** Formats a `Date` as "YYYY-MM-DD" from its LOCAL parts.
 *
 *  Do not reach for `toISOString()` here: it converts to UTC, and local
 *  midnight in Portugal (UTC+1 in summer) lands on the previous day in UTC.
 *  That bug silently pushed every computed date back one day — including the
 *  suggested date for a new week's attendance. */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parses "YYYY-MM-DD" as local midnight, never UTC. */
function fromISODate(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

/** Today, as "YYYY-MM-DD" in the user's own timezone. */
export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** First date strictly AFTER `iso` that falls on `weekday` (0 = Sunday).
 *  Used to jump from the last recorded week to the next meeting. */
export function nextWeekdayAfter(iso: string, weekday: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + (((weekday - d.getDay() + 6) % 7) + 1));
  return toISODate(d);
}

/** The date of `weekday` within the week that contains `iso`. Weeks run
 *  Monday → Sunday, the same convention as Postgres' `date_trunc('week')`.
 *
 *  Unlike a "next occurrence" helper this can return a date BEFORE `iso`:
 *  called on a Wednesday with a Tuesday GD it yields yesterday. That is the
 *  point — the GD already happened, and it belongs to the week we are in, not
 *  to the next one. */
export function weekdayInWeek(iso: string, weekday: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // back to Monday
  d.setDate(d.getDate() + ((weekday + 6) % 7)); // forward to the weekday
  return toISODate(d);
}

/**
 * The date to pre-fill when registering a new week.
 *
 * Starts from the GD's meeting day in the week we are in right now. If the
 * meeting already happened (today is Thursday, the GD is Tuesday) that date is
 * in the past, which is correct: attendance is recorded after the fact, so the
 * form should open on the meeting just gone rather than jump a week ahead.
 *
 * Only when that week is already recorded does it move forward to the next
 * meeting.
 *
 * `weeks` must be newest-first (the order `useWeeks` returns). `weekday` may
 * be null for a GD whose meeting day was never set, in which case it falls
 * back to simply one week after the last record.
 */
export function suggestWeekDate(weeks: { date: string }[], weekday: number | null): string {
  const last = weeks[0] ?? null;
  if (weekday === null) return last ? addDays(last.date, 7) : todayISO();

  const thisWeek = weekdayInWeek(todayISO(), weekday);

  // `>=` and not `>`: a record dated exactly on this week's meeting means that
  // meeting is done, so the next one is what is left to record.
  if (last && last.date >= thisWeek) return nextWeekdayAfter(last.date, weekday);

  return thisWeek;
}

export function formatWeekLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_PT[d.getMonth()]}`;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** First day of a "YYYY-MM" key, as "YYYY-MM-DD". */
export function startOfMonth(key: string): string {
  return `${key}-01`;
}

/**
 * Last day of a "YYYY-MM" key, as "YYYY-MM-DD".
 *
 * **Never hardcode this to `-31`.** September, April, June and November have 30
 * days and February has 28/29, and Postgres rejects `2026-09-31` outright
 * (error 22008 "date/time field value out of range") — which fails the whole
 * query, not just that bound. Day 0 of the following month is the last day of
 * this one, so the date object does the leap-year maths for us.
 */
export function endOfMonth(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return `${key}-${String(lastDay).padStart(2, "0")}`;
}

/**
 * NOTE: the outstanding-report count used to live here as `countMissingReports`.
 * It moved into the database (`gd_report_status`, migration 012) so the GD page
 * and the dashboard read one implementation — the two copies had already
 * drifted once, which is what made week-matching bugs possible.
 */

/** Postgres `time` arrives as "HH:MM:SS"; the UI only ever wants "HH:MM".
 *  Returns null for unset values so callers can fall back to their own copy. */
export function formatTime(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 5);
}

/** "Ter · 19:30" — when a GD meets. Either half on its own is a valid answer
 *  (a day with no time yet, or a time with no day), so they are not treated as
 *  a pair. Null when neither is set, so callers can skip the row entirely. */
export function formatSchedule(
  weekday: number | null | undefined,
  startTime: string | null | undefined,
): string | null {
  const time = formatTime(startTime);
  const day = weekday !== null && weekday !== undefined ? (WEEKDAY_SHORT[weekday] ?? null) : null;
  if (day && time) return `${day} · ${time}`;
  return day ?? time;
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS_PT[parseInt(m, 10) - 1]} de ${y}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}
