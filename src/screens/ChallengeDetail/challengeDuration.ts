/** Challenge-level duration fields from API. */
export type ChallengeDurationApi = {
  time_hour?: number;
  time_minute?: number;
  timer_duration_seconds?: number;
};

/**
 * Human label e.g. "1 Hour 5 Min" from `time_hour` / `time_minute`, or from
 * `timer_duration_seconds` when hour/minute are absent.
 */
export function formatSessionDurationLabel(
  meta?: ChallengeDurationApi | null,
): string {
  if (!meta) return '';
  let h = 0;
  let m = 0;
  const hasHour =
    typeof meta.time_hour === 'number' && !Number.isNaN(meta.time_hour);
  const hasMinute =
    typeof meta.time_minute === 'number' && !Number.isNaN(meta.time_minute);

  if (hasHour || hasMinute) {
    h = hasHour ? Math.max(0, meta.time_hour as number) : 0;
    m = hasMinute ? Math.max(0, meta.time_minute as number) : 0;
    if (
      h === 0 &&
      m === 0 &&
      meta.timer_duration_seconds != null &&
      meta.timer_duration_seconds > 0
    ) {
      const t = Math.floor(meta.timer_duration_seconds);
      h = Math.floor(t / 3600);
      m = Math.floor((t % 3600) / 60);
    }
  } else if (
    meta.timer_duration_seconds != null &&
    meta.timer_duration_seconds > 0
  ) {
    const t = Math.floor(meta.timer_duration_seconds);
    h = Math.floor(t / 3600);
    m = Math.floor((t % 3600) / 60);
  }

  const parts: string[] = [];
  if (h > 0) parts.push(`${h} Hour${h !== 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} Min`);
  if (
    parts.length === 0 &&
    meta.timer_duration_seconds != null &&
    meta.timer_duration_seconds > 0
  ) {
    const mins = Math.max(1, Math.ceil(meta.timer_duration_seconds / 60));
    parts.push(`${mins} Min`);
  }
  return parts.join(' ');
}
