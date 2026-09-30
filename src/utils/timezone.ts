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

/**
 * Prefer the signed-in user's profile timezone; fall back to the device IANA zone.
 * @param profileTimezone Optional `user.timezone` from auth/profile.
 */
export function resolveUserTimezone(
  profileTimezone?: string | null,
): string {
  if (typeof profileTimezone === 'string' && profileTimezone.trim()) {
    return profileTimezone.trim();
  }
  return getDeviceTimezone();
}

/**
 * Calendar date `YYYY-MM-DD` for `date` in the given IANA timezone.
 * Uses `en-CA` so the formatted string is always ISO-like `YYYY-MM-DD`.
 */
export function formatYmdInTimezone(
  date: Date = new Date(),
  timeZone?: string | null,
): string {
  const tz = resolveUserTimezone(timeZone);
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return formatLocalDateYmd(date);
  }
}

/**
 * UTC instant of local midnight for `ymd` (`YYYY-MM-DD`) in `timeZone`.
 * Corrects once for DST / offset so HealthKit / Health Connect day windows match the user TZ.
 */
export function startOfDayUtcMsForYmd(
  ymd: string,
  timeZone?: string | null,
): number {
  const tz = resolveUserTimezone(timeZone);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!match) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const desiredAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0, 0);

  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
  } catch {
    return desiredAsUtc;
  }

  const partsMs = (ms: number): number => {
    const parts = formatter.formatToParts(new Date(ms));
    const get = (type: Intl.DateTimeFormatPartTypes): number =>
      Number(parts.find(p => p.type === type)?.value ?? '0');
    return Date.UTC(
      get('year'),
      get('month') - 1,
      get('day'),
      get('hour'),
      get('minute'),
      get('second'),
    );
  };

  // utcGuess − (localAtGuess − desiredLocalMidnight) ≈ UTC of local midnight
  let startMs = desiredAsUtc - (partsMs(desiredAsUtc) - desiredAsUtc);
  startMs = startMs - (partsMs(startMs) - desiredAsUtc);
  return startMs;
}

/**
 * ISO range from midnight today through `now`, in the user's timezone.
 */
export function getDayRangeIsoInTimezone(
  timeZone?: string | null,
  now: Date = new Date(),
): { startIso: string; endIso: string } {
  const tz = resolveUserTimezone(timeZone);
  const ymd = formatYmdInTimezone(now, tz);
  const startMs = startOfDayUtcMsForYmd(ymd, tz);
  return {
    startIso: new Date(startMs).toISOString(),
    endIso: now.toISOString(),
  };
}

/**
 * Milliseconds until the next local midnight in `timeZone` (clamped ≥ 1s).
 * Used to force a day-end health refresh without waiting for the next poll.
 */
export function msUntilNextMidnight(
  timeZone?: string | null,
  now: Date = new Date(),
): number {
  const tz = resolveUserTimezone(timeZone);
  const todayYmd = formatYmdInTimezone(now, tz);
  const tomorrowStart =
    startOfDayUtcMsForYmd(todayYmd, tz) + 24 * 60 * 60 * 1000;
  // Recompute tomorrow from next calendar day in case of DST 23h/25h days
  const approxTomorrow = new Date(tomorrowStart + 12 * 60 * 60 * 1000);
  const nextYmd = formatYmdInTimezone(approxTomorrow, tz);
  const nextMidnight = startOfDayUtcMsForYmd(nextYmd, tz);
  return Math.max(1000, nextMidnight - now.getTime());
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

/** Wall-clock `HH:mm[:ss]` → `08:00 PM` (no timezone shift; display as-is). */
export function formatWallClockTo12h(time?: string | null): string {
  if (!time?.trim()) return '';
  const [h, m] = time.trim().split(':');
  const hours24 = Number(h);
  if (!Number.isFinite(hours24)) return '';
  const minutes = String(m ?? '00').padStart(2, '0');
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
