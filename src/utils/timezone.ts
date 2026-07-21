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
