/**
 * Chat API sends `date` + `time` as UTC (often date "YYYY-MM-DD" and time "HH:mm:ss"
 * without a timezone). Convert to the user's device timezone for display.
 *
 * Expected shapes (chat list `last_message` and chat details messages):
 * - `date`: "YYYY-MM-DD"
 * - `time`: "HH:mm" or "HH:mm:ss"
 * Example: { "date": "2026-05-11", "time": "10:24" } → interpreted as UTC instant,
 *   then formatted in the device locale/timezone.
 *
 * If `date` already includes `T` (full ISO), it is parsed with `new Date(date)` as-is.
 */

function pad2(n: string | undefined, fallback: string) {
  const v = Math.max(0, parseInt(n ?? fallback, 10) || 0);
  return String(v).padStart(2, '0');
}

export function parseUtcChatDateTime(
  dateStr: string,
  timeStr?: string | null,
): Date | null {
  if (!dateStr?.trim()) return null;
  const d = dateStr.trim();
  if (d.includes('T')) {
    const parsed = new Date(d);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const datePart = d.split(/\s|T/)[0];
  const t = (timeStr || '00:00:00').trim();
  const parts = t.split(':');
  const isoUtc = `${datePart}T${pad2(parts[0], '0')}:${pad2(parts[1], '0')}:${pad2(parts[2], '0')}Z`;
  const parsed = new Date(isoUtc);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Local calendar day key for grouping (YYYY-MM-DD in local tz). */
export function localCalendarKey(dateStr: string, timeStr?: string | null): string {
  const dt = parseUtcChatDateTime(dateStr, timeStr);
  if (!dt) return dateStr;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatChatTime12h(dateStr: string, timeStr?: string | null): string {
  const dt = parseUtcChatDateTime(dateStr, timeStr);
  if (!dt) {
    return (timeStr || '').trim();
  }
  return dt.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole calendar days between message (local) and now (local). */
export function localWholeDaysFromNow(dateStr: string, timeStr?: string | null): number {
  const dt = parseUtcChatDateTime(dateStr, timeStr);
  if (!dt) return NaN;
  const diffMs =
    startOfLocalDay(new Date()).getTime() - startOfLocalDay(dt).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function formatChatListTimeLabel(params: {
  dateStr: string;
  timeStr?: string | null;
}): string {
  const { dateStr, timeStr } = params;
  const diffDays = localWholeDaysFromNow(dateStr, timeStr);
  if (Number.isNaN(diffDays)) return '';

  if (diffDays === 0) return formatChatTime12h(dateStr, timeStr);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

export function formatChatDetailSeparatorLabel(dateStr: string, timeStr?: string | null): string {
  const dt = parseUtcChatDateTime(dateStr, timeStr);
  if (!dt) return '';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dt.toDateString() === today.toDateString()) return 'Today';
  if (dt.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return dt.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
