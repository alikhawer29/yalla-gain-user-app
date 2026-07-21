/**
 * IANA timezone from the device (e.g. "Asia/Karachi").
 * Required by backend on signup, login, profile update, and book appointment.
 */
export function getDeviceTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof tz === 'string' && tz.trim()) {
      return tz.trim();
    }
  } catch {
    // fall through
  }
  return 'UTC';
}

/** Append or merge `timezone` onto a JSON body or FormData payload. */
export function withTimezone<T extends Record<string, unknown> | FormData>(
  body: T,
): T {
  const timezone = getDeviceTimezone();
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    body.append('timezone', timezone);
    return body;
  }
  return { ...(body as Record<string, unknown>), timezone } as T;
}

/** Local calendar date as `YYYY-MM-DD` (avoids UTC shift from `toISOString()`). */
export function formatLocalDateYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Convert a UTC ISO timestamp (e.g. `2026-07-21T16:00:00Z`) to device-local time.
 * Always 12-hour AM/PM, e.g. `08:00 PM` (never 24h like `20:00`).
 */
export function formatUtcIsoToLocalTime(iso?: string | null): string {
  if (!iso?.trim()) return '';
  const date = new Date(iso.trim());
  if (Number.isNaN(date.getTime())) return '';

  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;
}

/** Local time range from UTC ISO start/end, e.g. `08:00 PM - 09:00 PM`. */
export function formatUtcIsoLocalRange(
  startIso?: string | null,
  endIso?: string | null,
): string {
  const start = formatUtcIsoToLocalTime(startIso);
  const end = formatUtcIsoToLocalTime(endIso);
  if (start && end) return `${start} - ${end}`;
  return start || end;
}
