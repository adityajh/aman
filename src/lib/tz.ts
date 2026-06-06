// Timezone helpers. The system source of truth is IST (Asia/Kolkata).
// All inputs the counselor types are interpreted as IST regardless of where
// the browser or server is running. Display can be overridden per-client.

import { format } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const IST = "Asia/Kolkata";

export type TimeZone = string;

// Common TZs surfaced in the client form. Labels match what a counselor would
// recognize; values are valid IANA identifiers.
export const TZ_OPTIONS: { value: TimeZone; label: string }[] = [
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "America/New_York", label: "US Eastern (ET)" },
  { value: "America/Chicago", label: "US Central (CT)" },
  { value: "America/Denver", label: "US Mountain (MT)" },
  { value: "America/Los_Angeles", label: "US Pacific (PT)" },
  { value: "Europe/London", label: "UK (GMT/BST)" },
  { value: "Europe/Berlin", label: "Central Europe (CET/CEST)" },
  { value: "Asia/Dubai", label: "Gulf (GST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
];

// Short label for a TZ (e.g. "IST", "ET"). Falls back to abbreviation derived
// from the IANA id.
export function tzShortLabel(tz: TimeZone | null | undefined): string {
  if (!tz) return "IST";
  const opt = TZ_OPTIONS.find(o => o.value === tz);
  if (opt) {
    const m = opt.label.match(/\(([^/)]+)/);
    if (m) return m[1];
  }
  // Fallback: take last segment.
  const last = tz.split("/").pop() ?? tz;
  return last.replace(/_/g, " ");
}

// Format a Date (or ISO string) in the given TZ.
export function formatTz(date: Date | string | null | undefined, tz: TimeZone, fmt: string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return formatInTimeZone(d, tz, fmt);
}

// IST shorthand.
export function formatIST(date: Date | string | null | undefined, fmt: string): string {
  return formatTz(date, IST, fmt);
}

// Combine a calendar date and a wall-clock time entered by the counselor
// (interpreted as IST) into an absolute UTC instant.
//
// `dateRef` provides only the calendar date (year/month/day) in IST.
// `hhmm` is "HH:mm" (24h).
export function istDateTimeToUTC(dateRef: Date | string, hhmm: string): Date {
  const dateOnly = formatIST(dateRef, "yyyy-MM-dd"); // IST calendar date
  const [h, m] = hhmm.split(":").map(Number);
  const wall = `${dateOnly}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  return fromZonedTime(wall, IST);
}

// Combine an explicit yyyy-MM-dd + HH:mm pair (entered as IST) into UTC.
export function istToUTC(dateStr: string, hhmm: string): Date {
  return fromZonedTime(`${dateStr}T${hhmm}:00`, IST);
}

// Format that omits the timezone tag — handy when the row already labels the
// column as IST.
export function formatISTBare(date: Date | string | null | undefined, fmt: string): string {
  return formatIST(date, fmt);
}

// Format an instant for a non-IST client, returning an empty string when the
// client is in IST so callers can branch with `tz && formatClientLocal(...)`.
export function formatClientLocal(
  date: Date | string | null | undefined,
  tz: TimeZone | null | undefined,
  fmt: string,
): string {
  if (!date || !tz || tz === IST) return "";
  return formatTz(date, tz, fmt);
}

// Re-export the local `format` for places that genuinely want browser-local
// behavior (charts, etc.) without forcing them to import date-fns separately.
export { format as formatLocal };

// ── IST "now" helpers ───────────────────────────────────────────────────────
// These let server code (which runs on Vercel/UTC) reason about *today in IST*
// instead of *today in UTC*. The whole system uses IST as the source of truth.

// Today's IST calendar parts.
export function istNowParts(): { year: number; month: number; day: number; hour: number; minute: number } {
  const s = formatInTimeZone(new Date(), IST, "yyyy-MM-dd-HH-mm");
  const [year, month, day, hour, minute] = s.split("-").map(Number);
  return { year, month, day, hour, minute };
}

// Today as IST yyyy-MM-dd (used for input defaults and DB date columns).
export function istTodayStr(): string {
  return formatInTimeZone(new Date(), IST, "yyyy-MM-dd");
}

// First instant of the IST calendar day containing `ref` (default: now).
// Used for the "Today" session filter.
export function istStartOfDayUTC(ref?: Date): Date {
  const ymd = formatInTimeZone(ref ?? new Date(), IST, "yyyy-MM-dd");
  return fromZonedTime(`${ymd}T00:00:00`, IST);
}

// First instant of the current IST week (Monday-anchored) relative to `ref`.
// Used for the "This Week" session filter.
export function istStartOfWeekUTC(ref?: Date): Date {
  // IST day-of-week: 1 (Mon) .. 7 (Sun) via date-fns-tz formatting.
  const dow = Number(formatInTimeZone(ref ?? new Date(), IST, "i")); // ISO day, 1=Mon
  const startOfDay = istStartOfDayUTC(ref);
  return new Date(startOfDay.getTime() - (dow - 1) * 24 * 60 * 60 * 1000);
}

// First instant of the IST calendar month containing `ref` (default: now).
export function istStartOfMonthUTC(ref?: Date): Date {
  const ymd = formatInTimeZone(ref ?? new Date(), IST, "yyyy-MM-01");
  return fromZonedTime(`${ymd}T00:00:00`, IST);
}

// First instant of the previous IST calendar month relative to `ref`.
export function istStartOfPrevMonthUTC(ref?: Date): Date {
  const { year, month } = (() => {
    const s = formatInTimeZone(ref ?? new Date(), IST, "yyyy-MM");
    const [y, m] = s.split("-").map(Number);
    return { year: y, month: m };
  })();
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  return fromZonedTime(`${prevYear}-${String(prevMonth).padStart(2, "0")}-01T00:00:00`, IST);
}

// First instant of the Indian Financial Year (Apr 1) containing `ref`
// (default: now). Pass a ref inside the next FY to get the next FY boundary.
export function istStartOfFYUTC(ref?: Date): Date {
  const s = formatInTimeZone(ref ?? new Date(), IST, "yyyy-MM");
  const [year, month] = s.split("-").map(Number);
  const fyStartYear = month >= 4 ? year : year - 1;
  return fromZonedTime(`${fyStartYear}-04-01T00:00:00`, IST);
}

// Add N days to an IST instant and return as UTC. (Used for "next 7 days".)
export function istAddDaysUTC(ref: Date, days: number): Date {
  return new Date(ref.getTime() + days * 24 * 60 * 60 * 1000);
}

// "yyyy-MM-DD" first-of-month string, IST. Useful for billing_month defaults.
export function istFirstOfMonthStr(ref?: Date): string {
  return formatInTimeZone(ref ?? new Date(), IST, "yyyy-MM-01");
}
