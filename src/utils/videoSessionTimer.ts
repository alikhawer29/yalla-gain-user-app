export type VideoSessionTiming = {
  scheduled_start_at?: string | null;
  scheduled_end_at?: string | null;
  duration_minutes?: number | null;
  started_at?: string | null;
  session_status?: string | null;
  appointment_date?: string | null;
  appointment_end_time?: string | null;
};

const parseIsoMs = (value?: string | null): number | null => {
  if (!value?.trim()) return null;
  const ms = Date.parse(value.trim());
  return Number.isFinite(ms) ? ms : null;
};

/** MM/DD/YYYY + HH:mm:ss (booking appointment fields). */
const parseAppointmentEndMs = (
  date?: string | null,
  time?: string | null,
): number | null => {
  if (!date?.trim() || !time?.trim()) return null;

  const parts = date.trim().split('/');
  if (parts.length !== 3) return null;

  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const [hours, minutes, seconds = '0'] = time.trim().split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  const second = parseInt(seconds, 10);

  if (
    [month, day, year, hour, minute, second].some(n => Number.isNaN(n))
  ) {
    return null;
  }

  const ms = new Date(year, month - 1, day, hour, minute, second).getTime();
  return Number.isFinite(ms) ? ms : null;
};

const endFromStartAndDuration = (
  startMs: number | null,
  durationMinutes: number,
): number | null => {
  if (startMs == null || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return null;
  }
  return startMs + durationMinutes * 60 * 1000;
};

/**
 * Resolve session end time from API fields.
 * For started sessions, prefer started_at + duration_minutes (actual session window).
 */
export const getSessionEndMs = (timing: VideoSessionTiming): number | null => {
  const duration = Number(timing.duration_minutes);
  const hasDuration = Number.isFinite(duration) && duration > 0;
  const isStarted = timing.session_status?.trim().toLowerCase() === 'started';

  if (hasDuration && (isStarted || timing.started_at)) {
    const fromStarted = endFromStartAndDuration(
      parseIsoMs(timing.started_at),
      duration,
    );
    if (fromStarted != null) return fromStarted;
  }

  const scheduledEndMs = parseIsoMs(timing.scheduled_end_at);
  if (scheduledEndMs != null) return scheduledEndMs;

  const appointmentEndMs = parseAppointmentEndMs(
    timing.appointment_date,
    timing.appointment_end_time,
  );
  if (appointmentEndMs != null) return appointmentEndMs;

  const fromScheduledStart = endFromStartAndDuration(
    parseIsoMs(timing.scheduled_start_at),
    duration,
  );
  if (fromScheduledStart != null) return fromScheduledStart;

  return endFromStartAndDuration(parseIsoMs(timing.started_at), duration);
};

export const getRemainingSeconds = (endMs: number, nowMs = Date.now()): number =>
  Math.max(0, Math.floor((endMs - nowMs) / 1000));

export const formatCountdown = (totalSeconds: number): string => {
  const clamped = Math.max(0, totalSeconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;

  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
