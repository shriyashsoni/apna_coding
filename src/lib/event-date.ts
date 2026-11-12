// Date-only ("time to be announced") event convention.
//
// The events table stores `date` as a required epoch-milliseconds integer and
// has a free-text `timezone` column that nothing else in the app reads
// (verified: only the on-chain PROOF_FIELDS list references it). The schema
// cannot be changed from the app and no new column is needed:
//
//   A date-only event = `timezone` exactly "TBA" AND `date` at exact UTC
//   midnight of its day. BOTH conditions must hold.
//
// Why both: the explicit `timezone = "TBA"` marker means a genuine event
// whose start time really is 00:00 UTC (timezone left "UTC") keeps rendering
// as a real time - a bare midnight value is never silently reclassified.
// The UTC-midnight storage keeps the calendar day unambiguous; renderers
// format that day in UTC so it does not shift west of UTC.
//
// Both `date` and `timezone` are already in the on-chain content hash
// (src/lib/onchain-canonical.ts PROOF_FIELDS.event), so the marker survives
// canonical hashing: setting or clearing it changes the hash and the daily
// Sepolia sync records an update for that listing.

export const TIME_TBA_LABEL = "Time to be announced";
export const DATE_ONLY_TIMEZONE = "TBA";

const MS_PER_DAY = 86_400_000;

/** True only when the row carries the explicit TBA marker AND a UTC-midnight date. */
export function isDateOnlyEvent(date: unknown, timezone?: unknown): boolean {
  if (String(timezone ?? "") !== DATE_ONLY_TIMEZONE) return false;
  const ms = Number(date);
  if (!Number.isFinite(ms) || ms <= 0) return false;
  return ms % MS_PER_DAY === 0;
}

/** Long calendar date, e.g. "Wednesday, March 24, 2027". UTC for date-only events. */
export function formatEventDate(date: unknown, weekday = true, timezone?: unknown): string {
  const ms = Number(date);
  if (!Number.isFinite(ms) || ms <= 0) return "TBA";
  const options: Intl.DateTimeFormatOptions = {
    ...(weekday ? { weekday: "long" as const } : {}),
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  if (isDateOnlyEvent(ms, timezone)) options.timeZone = "UTC";
  return new Date(ms).toLocaleDateString("en-US", options);
}

/** Clock time for timed events; TIME_TBA_LABEL for date-only events. */
export function formatEventTime(date: unknown, timezone?: unknown): string {
  const ms = Number(date);
  if (!Number.isFinite(ms) || ms <= 0) return TIME_TBA_LABEL;
  if (isDateOnlyEvent(ms, timezone)) return TIME_TBA_LABEL;
  return new Date(ms).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/**
 * schema.org startDate value: "YYYY-MM-DD" (a Date) for date-only events,
 * full ISO 8601 for timed events. Never a bare epoch number.
 */
export function eventStartDateISO(date: unknown, timezone?: unknown): string {
  const ms = Number(date);
  if (!Number.isFinite(ms) || ms <= 0) return "";
  if (isDateOnlyEvent(ms, timezone)) {
    const d = new Date(ms);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }
  return new Date(ms).toISOString();
}

/**
 * True while the event should read as "Upcoming": a date-only event stays
 * upcoming through its whole UTC day.
 */
export function isEventUpcoming(date: unknown, timezone?: unknown, now = Date.now()): boolean {
  const ms = Number(date);
  if (!Number.isFinite(ms) || ms <= 0) return false;
  return isDateOnlyEvent(ms, timezone) ? ms + MS_PER_DAY > now : ms > now;
}

/** True when `tz` is an IANA zone Intl understands (so "TBA"/""/garbage are rejected). */
export function isValidTimeZone(tz: unknown): tz is string {
  if (!tz || typeof tz !== "string") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The browser's own IANA zone, e.g. "Asia/Kolkata" ("UTC" as last resort). */
export function browserTimeZone(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return isValidTimeZone(tz) ? tz : "UTC";
}

function wallPartsInZone(ms: number, timeZone: string): { y: number; mo: number; d: number; h: number; mi: number; s: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(ms));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  return { y: get("year"), mo: get("month"), d: get("day"), h: get("hour") % 24, mi: get("minute"), s: get("second") };
}

/** Convert a wall time in a named IANA zone to the UTC instant (DST-safe, iterated). */
export function zonedWallTimeToUtc(
  year: number, month: number, day: number, hour: number, minute: number, timeZone: string,
): number {
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;
  for (let i = 0; i < 3; i++) {
    const p = wallPartsInZone(guess, timeZone);
    const offset = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - guess;
    const candidate = target - offset;
    if (candidate === guess) break;
    guess = candidate;
  }
  return guess;
}

/**
 * Resolve a wall time in a named zone with honesty checks: returns the UTC
 * instant, or an error when the wall time does not exist (spring-forward
 * gap) or exists twice (fall-back overlap) in that zone, or input is bad.
 */
export function resolveZonedTimestamp(
  dateStr: string, timeStr: string, timeZone: string,
): { ms: number | null; error?: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  const t = /^(\d{2}):(\d{2})$/.exec(timeStr.trim());
  if (!m || !t) return { ms: null, error: "Invalid date or time format." };
  const year = Number(m[1]); const month = Number(m[2]); const day = Number(m[3]);
  const hour = Number(t[1]); const minute = Number(t[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    return { ms: null, error: "Invalid date or time format." };
  }
  const ms = zonedWallTimeToUtc(year, month, day, hour, minute, timeZone);
  const back = wallPartsInZone(ms, timeZone);
  const same = (p: { y: number; mo: number; d: number; h: number; mi: number }) =>
    p.y === year && p.mo === month && p.d === day && p.h === hour && p.mi === minute;
  if (!same(back)) {
    return {
      ms: null,
      error: `${dateStr} ${timeStr} does not exist in ${timeZone} (clocks spring forward that day). Pick a time after the clock change, or the next hour.`,
    };
  }
  const H = 3600000;
  if (same(wallPartsInZone(ms - H, timeZone)) || same(wallPartsInZone(ms + H, timeZone))) {
    return {
      ms: null,
      error: `${dateStr} ${timeStr} happens twice in ${timeZone} (clocks fall back that day). Pick a time outside 01:00-02:00 or enter it in UTC.`,
    };
  }
  return { ms };
}

/**
 * Build the stored epoch-ms value from the create/edit form fields.
 * `dateStr` is "YYYY-MM-DD" (required); `timeStr` is "HH:MM" or "".
 * No time -> exact UTC midnight of that day (pair with timezone "TBA").
 * With a time -> the wall time interpreted in `timeZone` (venue zone chosen
 * in the form, defaulting to the browser zone, which matches the previous
 * datetime-local behavior); the chosen zone is stored in `timezone` so the
 * instant stays unambiguous and the on-chain hash records it.
 */
export function buildEventTimestamp(dateStr: string, timeStr: string, timeZone?: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (!timeStr) {
    return Date.UTC(year, month - 1, day);
  }
  const t = /^(\d{2}):(\d{2})$/.exec(timeStr.trim());
  if (!t) return null;
  const hour = Number(t[1]);
  const minute = Number(t[2]);
  if (hour > 23 || minute > 59) return null;
  if (isValidTimeZone(timeZone)) {
    return resolveZonedTimestamp(dateStr, timeStr, timeZone).ms;
  }
  const ms = new Date(year, month - 1, day, hour, minute).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/**
 * The timezone value a form submit should store for the chosen time mode:
 * "TBA" for date-only, otherwise the zone the wall time was entered in.
 */
export function timezoneForSubmit(timeStr: string, timeZone?: string): string {
  if (!timeStr) return DATE_ONLY_TIMEZONE;
  return isValidTimeZone(timeZone) ? timeZone : browserTimeZone();
}

/** Split a stored row back into form fields (date-only -> empty time). */
export function timestampToFormFields(date: unknown, timezone?: unknown): { date: string; time: string; timeZone: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fallbackZone = browserTimeZone();
  const ms = Number(date);
  if (!Number.isFinite(ms) || ms <= 0) return { date: "", time: "", timeZone: fallbackZone };
  if (isDateOnlyEvent(ms, timezone)) {
    const d = new Date(ms);
    return {
      date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
      time: "",
      timeZone: fallbackZone,
    };
  }
  // Timed event: show the wall time in the zone the row declares. UTC is a
  // real declared zone and round-trips as UTC. Only a missing/invalid zone
  // (rows from before this convention) falls back to the browser zone.
  const zone = isValidTimeZone(timezone) ? timezone : fallbackZone;
  const p = wallPartsInZone(ms, zone);
  return {
    date: `${p.y}-${pad(p.mo)}-${pad(p.d)}`,
    time: `${pad(p.h)}:${pad(p.mi)}`,
    timeZone: zone,
  };
}

/** Common venue zones offered by the create/edit forms (browser zone is added on top). */
export const COMMON_TIMEZONES = [
  "UTC",
  "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Asia/Hong_Kong", "Asia/Shanghai",
  "Asia/Tokyo", "Asia/Seoul",
  "Europe/London", "Europe/Lisbon", "Europe/Paris", "Europe/Berlin", "Europe/Amsterdam",
  "Europe/Madrid", "Europe/Rome", "Europe/Zurich",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Sao_Paulo", "America/Toronto", "America/Vancouver", "America/Mexico_City",
  "Australia/Sydney", "Pacific/Auckland",
];

/** Browser zone first, then the common list, deduped. */
export function timeZoneOptions(): string[] {
  return [...new Set([browserTimeZone(), ...COMMON_TIMEZONES])];
}
