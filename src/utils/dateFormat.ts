// src/utils/formatDate.ts

/**
 * Format a date-like string into MM-DD-YYYY.
 *
 * Accepts:
 *  - "YYYY-MM-DD"
 *  - ISO strings like "2025-11-29T01:36:37.646Z"
 * Falls back to the original string if parsing fails.
 */
export function formatDateToMMDDYYYY(
  rawDate: string | null | undefined,
): string {
  if (!rawDate) return "";

  // Fast path: plain ISO date "YYYY-MM-DD"
  const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;
  const m = rawDate.match(isoDateOnly);
  if (m) {
    const [, year, month, day] = m;
    return `${month}-${day}-${year}`;
  }

  // Fallback: let Date try (for ISO timestamps, etc.)
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) {
    // If it is truly unparseable, return as-is so we don't hide data.
    return rawDate;
  }

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = String(d.getFullYear());

  return `${mm}-${dd}-${yyyy}`;
}

/**
 * Format a time-like string into HH:MM AM/PM.
 *
 * Accepts:
 *  - "HH:MM"
 *  - "HH:MM:SS"
 *  - ISO strings like "2000-01-01T14:00:00.000Z"
 *
 * If parsing fails, returns the original string.
 */
export function formatTimeToHHMMAmPm(
  rawTime: string | null | undefined,
): string {
  if (!rawTime) return "";

  let hours: number | null = null;
  let minutes: number | null = null;

  // 1) Handle "HH:MM" or "HH:MM:SS" (what formatted-event-time gives you)
  const timeOnlyMatch = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(rawTime);
  if (timeOnlyMatch) {
    hours = Number(timeOnlyMatch[1]);
    minutes = Number(timeOnlyMatch[2]);
  } else {
    // 2) Try to parse as a Date (for "2000-01-01T14:00:00.000Z" style strings)
    const d = new Date(rawTime);
    if (!Number.isNaN(d.getTime())) {
      // NOTE: this uses local time. If you ever want to treat the time as
      // "raw clock time independent of timezone", we can adjust this logic.
      hours = d.getHours();
      minutes = d.getMinutes();
    }
  }

  if (hours == null || minutes == null) {
    // Could not parse; do not hide the underlying value.
    return rawTime;
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12; // 0 -> 12, 13 -> 1, etc.
  const hh = String(hour12).padStart(2, "0"); // "HH" as requested
  const mm = String(minutes).padStart(2, "0");

  return `${hh}:${mm} ${suffix}`;
}

/**
 * Convenience helper: given separate date/time fields from the API, you can
 * get a pair of display-ready strings.
 *
 * Example use:
 *   const { dateLabel, timeLabel } = formatEventDateTime(
 *     event.formatted_event_date ?? event.event_date,
 *     event.formatted_event_time ?? event.event_time,
 *   );
 */
export function formatEventDateTime(
  rawDate: string | null | undefined,
  rawTime: string | null | undefined,
): { dateLabel: string; timeLabel: string } {
  return {
    dateLabel: formatDateToMMDDYYYY(rawDate),
    timeLabel: formatTimeToHHMMAmPm(rawTime),
  };
}
