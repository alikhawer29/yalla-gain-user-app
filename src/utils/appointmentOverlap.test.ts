import {
  doAppointmentRangesOverlap,
  findOverlappingBooking,
  getEffectiveBookingWindow,
  isBlockingBookingStatus,
  isSlotConflictingWithBookings,
  parseAppointmentDate,
  parseTimeToMinutes,
} from './appointmentOverlap';

describe('appointmentOverlap', () => {
  describe('parseTimeToMinutes', () => {
    it('parses HH:mm and HH:mm:ss', () => {
      expect(parseTimeToMinutes('14:00')).toBe(840);
      expect(parseTimeToMinutes('14:30:00')).toBe(870);
    });
  });

  describe('parseAppointmentDate', () => {
    it('normalizes supported date formats to YYYY-MM-DD', () => {
      expect(parseAppointmentDate('2026-07-08')).toBe('2026-07-08');
      expect(parseAppointmentDate('07/08/2026')).toBe('2026-07-08');
      expect(parseAppointmentDate('2026/07/08')).toBe('2026-07-08');
    });
  });

  describe('isBlockingBookingStatus', () => {
    it('includes active statuses and excludes completed ones', () => {
      expect(isBlockingBookingStatus('upcoming')).toBe(true);
      expect(isBlockingBookingStatus('in-progress')).toBe(true);
      expect(isBlockingBookingStatus('rescheduled')).toBe(true);
      expect(isBlockingBookingStatus('past')).toBe(false);
      expect(isBlockingBookingStatus('completed')).toBe(false);
      expect(isBlockingBookingStatus('rejected')).toBe(false);
    });
  });

  describe('getEffectiveBookingWindow', () => {
    it('uses rescheduled fields when booking is rescheduled', () => {
      expect(
        getEffectiveBookingWindow({
          is_rescheduled: true,
          appointment_date: '07/01/2026',
          appointment_start_time: '10:00:00',
          appointment_end_time: '11:00:00',
          rescheduled_appointment_date: '07/08/2026',
          rescheduled_appointment_start_time: '15:00:00',
          rescheduled_appointment_end_time: '16:00:00',
        }),
      ).toEqual({
        date: '2026-07-08',
        startTime: '15:00:00',
        endTime: '16:00:00',
      });
    });
  });

  describe('doAppointmentRangesOverlap', () => {
    const base = {
      date: '2026-07-08',
      startTime: '14:00:00',
      endTime: '15:00:00',
    };

    it('detects exact overlap', () => {
      expect(
        doAppointmentRangesOverlap(base, {
          date: '2026-07-08',
          startTime: '14:00:00',
          endTime: '15:00:00',
        }),
      ).toBe(true);
    });

    it('detects partial overlap at the end', () => {
      expect(
        doAppointmentRangesOverlap(base, {
          date: '2026-07-08',
          startTime: '14:30:00',
          endTime: '15:30:00',
        }),
      ).toBe(true);
    });

    it('detects partial overlap at the start', () => {
      expect(
        doAppointmentRangesOverlap(base, {
          date: '2026-07-08',
          startTime: '13:30:00',
          endTime: '14:15:00',
        }),
      ).toBe(true);
    });

    it('detects contained overlap', () => {
      expect(
        doAppointmentRangesOverlap(base, {
          date: '2026-07-08',
          startTime: '14:15:00',
          endTime: '14:45:00',
        }),
      ).toBe(true);
    });

    it('does not treat adjacent slots as overlapping', () => {
      expect(
        doAppointmentRangesOverlap(base, {
          date: '2026-07-08',
          startTime: '15:00:00',
          endTime: '16:00:00',
        }),
      ).toBe(false);
    });

    it('does not overlap on different dates', () => {
      expect(
        doAppointmentRangesOverlap(base, {
          date: '2026-07-09',
          startTime: '14:00:00',
          endTime: '15:00:00',
        }),
      ).toBe(false);
    });
  });

  describe('findOverlappingBooking', () => {
    const bookings = [
      {
        id: 1,
        status: 'upcoming',
        appointment_date: '07/08/2026',
        appointment_start_time: '17:00:00',
        appointment_end_time: '18:00:00',
      },
      {
        id: 2,
        status: 'rejected',
        appointment_date: '07/08/2026',
        appointment_start_time: '17:00:00',
        appointment_end_time: '18:00:00',
      },
      {
        id: 3,
        status: 'past',
        appointment_date: '07/08/2026',
        appointment_start_time: '17:00:00',
        appointment_end_time: '18:00:00',
      },
    ];

    it('returns the first blocking booking that overlaps', () => {
      expect(
        findOverlappingBooking(
          bookings,
          '2026-07-08',
          '17:30:00',
          '18:30:00',
        )?.id,
      ).toBe(1);
    });

    it('ignores rejected and past bookings', () => {
      expect(
        findOverlappingBooking(
          bookings.filter(booking => booking.id !== 1),
          '2026-07-08',
          '17:30:00',
          '18:30:00',
        ),
      ).toBeUndefined();
    });
  });

  describe('isSlotConflictingWithBookings', () => {
    it('returns true when a blocking overlap exists', () => {
      expect(
        isSlotConflictingWithBookings(
          [
            {
              status: 'upcoming',
              appointment_date: '2026-07-08',
              appointment_start_time: '14:00:00',
              appointment_end_time: '15:00:00',
            },
          ],
          '2026-07-08',
          '14:30:00',
          '15:30:00',
        ),
      ).toBe(true);
    });
  });
});
