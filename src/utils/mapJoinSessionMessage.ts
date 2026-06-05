const NOT_STARTED_PATTERNS = [
  'doctor has not started',
  'session not started yet',
  'has not started the session',
  'session has not been started',
];

const normalizeMessage = (message: unknown): string => {
  if (typeof message === 'string') return message.trim();
  if (message != null) return String(message).trim();
  return '';
};

export const isDoctorSessionNotStartedError = (err: {
  data?: { message?: unknown };
  message?: unknown;
}): boolean => {
  const message = normalizeMessage(err?.data?.message ?? err?.message).toLowerCase();
  if (!message) return false;
  return NOT_STARTED_PATTERNS.some(pattern => message.includes(pattern));
};

/** Patient-facing copy for join-session API errors. */
export const mapJoinSessionMessage = (message: unknown): string => {
  const raw = normalizeMessage(message);
  if (!raw) return 'Failed to join the session. Please try again.';

  const m = raw.toLowerCase();
  if (NOT_STARTED_PATTERNS.some(pattern => m.includes(pattern))) {
    return 'The doctor has not started the session yet. Please wait and try again shortly.';
  }
  if (m.includes('session has ended') || m.includes('session already ended')) {
    return 'This session has ended.';
  }
  if (m.includes('booking is cancelled')) {
    return 'This booking was cancelled.';
  }
  if (m.includes('booking is not confirmed')) {
    return 'This booking is not confirmed yet.';
  }

  return raw;
};
