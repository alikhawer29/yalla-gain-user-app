import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export interface AppointmentWindow {
  date: string;
  startTime: string;
  endTime: string;
}

export interface BookingLike {
  status?: string | null;
  is_rescheduled?: boolean;
  appointment_date?: string | null;
  appointment_start_time?: string | null;
  appointment_end_time?: string | null;
  rescheduled_appointment_date?: string | null;
  rescheduled_appointment_start_time?: string | null;
  rescheduled_appointment_end_time?: string | null;
}

const BLOCKING_STATUSES = new Set([
  'upcoming',
  'pending',
  'in_progress',
  'inprogress',
  'rescheduled',
]);

const DATE_FORMATS = [
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  'MM/DD/YYYY',
  'M/D/YYYY',
  'DD/MM/YYYY',
];

export const parseTimeToMinutes = (time: string): number | null => {
  if (!time?.trim()) {
    return null;
  }

  const parts = time.trim().split(':');
  if (parts.length < 2) {
    return null;
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

export const parseAppointmentDate = (dateStr: string): string | null => {
  if (!dateStr?.trim()) {
    return null;
  }

  const trimmed = dateStr.trim();

  for (const format of DATE_FORMATS) {
    const parsed = dayjs(trimmed, format, true);
    if (parsed.isValid()) {
      return parsed.format('YYYY-MM-DD');
    }
  }

  const fallback = dayjs(trimmed);
  return fallback.isValid() ? fallback.format('YYYY-MM-DD') : null;
};

export const isBlockingBookingStatus = (status?: string | null): boolean => {
  if (!status) {
    return false;
  }

  return BLOCKING_STATUSES.has(status.toLowerCase().replace(/-/g, '_'));
};

export const getEffectiveBookingWindow = (
  booking: BookingLike,
): AppointmentWindow | null => {
  const useRescheduled = Boolean(booking.is_rescheduled);

  const date = parseAppointmentDate(
    (useRescheduled
      ? booking.rescheduled_appointment_date
      : booking.appointment_date) ?? '',
  );
  const startTime = useRescheduled
    ? booking.rescheduled_appointment_start_time
    : booking.appointment_start_time;
  const endTime = useRescheduled
    ? booking.rescheduled_appointment_end_time
    : booking.appointment_end_time;

  if (!date || !startTime || !endTime) {
    return null;
  }

  return {
    date,
    startTime,
    endTime,
  };
};

export const doAppointmentRangesOverlap = (
  first: AppointmentWindow,
  second: AppointmentWindow,
): boolean => {
  if (first.date !== second.date) {
    return false;
  }

  const firstStart = parseTimeToMinutes(first.startTime);
  const firstEnd = parseTimeToMinutes(first.endTime);
  const secondStart = parseTimeToMinutes(second.startTime);
  const secondEnd = parseTimeToMinutes(second.endTime);

  if (
    firstStart === null ||
    firstEnd === null ||
    secondStart === null ||
    secondEnd === null
  ) {
    return false;
  }

  return firstStart < secondEnd && secondStart < firstEnd;
};

export const findOverlappingBooking = <T extends BookingLike>(
  bookings: T[],
  candidateDate: string,
  candidateStart: string,
  candidateEnd: string,
): T | undefined => {
  const normalizedDate = parseAppointmentDate(candidateDate);
  if (!normalizedDate) {
    return undefined;
  }

  const candidate: AppointmentWindow = {
    date: normalizedDate,
    startTime: candidateStart,
    endTime: candidateEnd,
  };

  return bookings.find(booking => {
    if (!isBlockingBookingStatus(booking.status)) {
      return false;
    }

    const existing = getEffectiveBookingWindow(booking);
    if (!existing) {
      return false;
    }

    return doAppointmentRangesOverlap(existing, candidate);
  });
};

export const isSlotConflictingWithBookings = (
  bookings: BookingLike[],
  candidateDate: string,
  candidateStart: string,
  candidateEnd: string,
): boolean =>
  Boolean(
    findOverlappingBooking(
      bookings,
      candidateDate,
      candidateStart,
      candidateEnd,
    ),
  );

export const isAppointmentOverlapApiError = (message?: string | null): boolean => {
  if (!message?.trim()) {
    return false;
  }

  const lower = message.toLowerCase();
  return (
    lower.includes('overlap') ||
    lower.includes('conflict') ||
    lower.includes('already booked') ||
    lower.includes('already have') ||
    lower.includes('scheduling conflict') ||
    lower.includes('time slot') && lower.includes('unavailable')
  );
};
