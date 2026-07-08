# Double-Booking Fix Guide

Use this document in the **doctor app repo** (and optionally `yalla-backend`) to implement the same overlap validation that was added to the YallaGain **user app**.

---

## Problem

### Doctor-side double booking

If Doctor A already has a service/session from **2:00 PM – 3:00 PM**, the system still allows creating another service in the same or overlapping window:

| Scenario | Example |
|----------|---------|
| Exact overlap | 2:00–3:00 and 2:00–3:00 |
| Partial overlap | 2:00–3:00 and 2:30–3:30 |
| Contained overlap | 2:00–4:00 and 3:00–3:30 |

**Expected:** Block save and show a validation message.

### User-side double booking

A user can book multiple sessions that overlap in time:

| Scenario | Example |
|----------|---------|
| Exact overlap | 5:00–6:00 and 5:00–6:00 |
| Partial overlap | 5:00–6:00 and 5:30–6:30 |
| Start overlap | 4:30–5:15 and 5:00–6:00 |
| Fully inside | 5:15–5:45 inside 5:00–6:00 |

**Expected:** Block booking before confirm and show a validation message.

---

## Root cause

There is **no interval overlap validation** before saving appointments or service slots.

The only existing guard on the user app was `slot.is_booked` from `GET service-slots/{id}`, which prevents booking a slot another user already took — but it does **not** check whether the **current user** already has another session at that time.

---

## Overlap algorithm

Two time ranges on the **same date** overlap when:

```
startA < endB  AND  startB < endA
```

**Adjacent slots do NOT overlap** (e.g. 2:00–3:00 and 3:00–4:00 is allowed).

### Blocking statuses

Only count appointments with active statuses:

- `upcoming`
- `pending`
- `in_progress` / `inprogress`
- `rescheduled`

Ignore: `past`, `completed`, `rejected`.

### Rescheduled bookings

When `is_rescheduled === true`, use:

- `rescheduled_appointment_date`
- `rescheduled_appointment_start_time`
- `rescheduled_appointment_end_time`

---

## Shared utility (copy into doctor app)

Create `src/utils/appointmentOverlap.ts` with this exact file:

```typescript
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
```

### Optional: unit tests

Copy `src/utils/appointmentOverlap.test.ts` from the user app repo and run:

```bash
npm test -- --testPathPattern=appointmentOverlap.test.ts
```

---

## User app reference implementation (already done)

These files were changed in the YallaGain user app:

| File | Change |
|------|--------|
| `src/utils/appointmentOverlap.ts` | Shared overlap utility |
| `src/utils/appointmentOverlap.test.ts` | Unit tests |
| `src/screens/AppointmentBooking/useAppointmentBookingController.ts` | Fetch bookings + validate before save |
| `src/screens/AppointmentBooking/index.tsx` | Disable conflicting slots in UI |
| `src/screens/AppointmentBooking/styles.ts` | `slot_item_conflict` style |

### User app integration pattern

1. **Fetch existing bookings for selected date** via `GET my-bookings`:
   - `from_date` / `to_date` = selected date (`YYYY-MM-DD`)
   - `per_page: 100`
   - Fetch **both** `type=doctor` and `type=trainer` (merge results) so cross-type conflicts are caught

2. **Before confirm modal** in `onBook()`:
   ```typescript
   const conflict = findOverlappingBooking(
     existingBookingsForDate,
     appointmentDate,
     selectedSlot.start,
     selectedSlot.end,
   );
   if (conflict) {
     showOkModal({
       type: 'error',
       title: 'Scheduling Conflict',
       message: 'You already have a session booked during this time. Please choose a different slot.',
     });
     return;
   }
   ```

3. **Disable slots in UI**:
   ```typescript
   const isUserConflict = isSlotConflictingWithBookings(
     existingBookingsForDate,
     formattedDate,
     slot.start_time,
     slot.end_time,
   );
   const isDisabled = isBooked || isPassed || isUserConflict;
   ```

4. **Handle backend overlap errors** in the `book/appointment` catch block using `isAppointmentOverlapApiError()`.

### User app API endpoints

Base URL: `https://custom-dev.onlinetestingserver.com/yalla-backend/api/user/`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `my-bookings?from_date=&to_date=&type=&per_page=100` | Existing user bookings |
| GET | `service-slots/{serviceId}?date=YYYY-MM-DD` | Available slots |
| POST | `book/appointment` | Create booking |

---

## Doctor app implementation checklist

> **Cursor agent instructions:** Follow these steps in the doctor/provider app repo.

### Step 1 — Locate service/slot creation flow

Search the doctor repo for:

- `create service`, `add slot`, `service slot`, `schedule`, `availability`
- Screens like `CreateService`, `ServiceDetails`, `AddSlot`, `ManageSchedule`
- RTK Query / API files under `redux/Apis` or `api/doctor`

Expected API base: `.../yalla-backend/api/doctor/`

### Step 2 — Add the shared utility

1. Create `src/utils/appointmentOverlap.ts` (copy from above)
2. Optionally copy `src/utils/appointmentOverlap.test.ts`
3. Ensure `dayjs` is installed (`npm install dayjs`)

### Step 3 — Fetch doctor's existing slots/services for the target date

Before saving a new service or slot, load all of the **logged-in doctor's** existing appointments/slots for that date.

Look for endpoints such as (names may differ):

| Likely endpoint | Purpose |
|-----------------|---------|
| `GET my-services` | Doctor's services |
| `GET my-bookings` or `GET doctor-appointments` | Doctor's booked sessions |
| `GET service-slots/{serviceId}?date=` | Slots for a service on a date |

**Important:** Overlap check must be scoped to the **same doctor** — compare against all of that doctor's services/slots on the date, not just the current service.

If the API returns slot objects instead of bookings, map them to `BookingLike`:

```typescript
{
  status: 'upcoming', // or omit status filter if all returned slots are active
  appointment_date: slot.date,
  appointment_start_time: slot.start_time,
  appointment_end_time: slot.end_time,
}
```

When editing an existing slot, **exclude the current slot's ID** from the comparison list.

### Step 4 — Validate before save

In the create/update service controller (equivalent of `useAppointmentBookingController.ts`):

```typescript
import {
  findOverlappingBooking,
  isAppointmentOverlapApiError,
  isSlotConflictingWithBookings,
} from '../../utils/appointmentOverlap';

const DOCTOR_SCHEDULING_CONFLICT_MESSAGE =
  'You already have a service scheduled during this time. Please choose a different slot.';

// Before showing confirm modal or calling create API:
const conflict = findOverlappingBooking(
  existingDoctorSlotsForDate,
  selectedDate,        // YYYY-MM-DD
  selectedStartTime,   // HH:mm:ss
  selectedEndTime,
);

if (conflict) {
  showOkModal({
    type: 'error',
    title: 'Scheduling Conflict',
    message: DOCTOR_SCHEDULING_CONFLICT_MESSAGE,
  });
  return;
}
```

### Step 5 — Disable overlapping slots in the picker UI

In the slot selection screen:

```typescript
const isDoctorConflict = isSlotConflictingWithBookings(
  existingDoctorSlotsForDate,
  formattedDate,
  slot.start_time,
  slot.end_time,
);

const isDisabled = isBooked || isPassed || isDoctorConflict;
```

Add a visual style (e.g. `slot_item_conflict`) so doctors see unavailable slots before submitting.

### Step 6 — Handle API overlap errors

In the create/update mutation catch block:

```typescript
if (isAppointmentOverlapApiError(err?.data?.message)) {
  showOkModal({
    type: 'error',
    title: 'Scheduling Conflict',
    message: DOCTOR_SCHEDULING_CONFLICT_MESSAGE,
  });
  return;
}
```

---

## Backend validation recommendations (`yalla-backend`)

Client-side checks improve UX but **cannot prevent race conditions**. Add authoritative validation on the server.

### User booking — `POST /api/user/book/appointment`

Before creating a booking:

```sql
SELECT id FROM bookings
WHERE user_id = :auth_user_id
  AND status IN ('upcoming', 'pending', 'in_progress', 'rescheduled')
  AND appointment_date = :date
  AND appointment_start_time < :new_end
  AND appointment_end_time > :new_start
LIMIT 1;
```

If a row exists → return **HTTP 422**:

```json
{
  "message": "You already have a session booked during this time. Please choose a different slot."
}
```

Use rescheduled datetime fields when `is_rescheduled = true`.

Wrap booking + slot mark-as-booked in a **database transaction** to avoid double booking under concurrency.

### Doctor slot creation — doctor API create/update endpoint

Before saving a new slot for `doctor_id`:

```sql
SELECT id FROM service_slots ss
JOIN services s ON s.id = ss.service_id
WHERE s.user_id = :doctor_id
  AND ss.date = :date
  AND ss.start_time < :new_end
  AND ss.end_time > :new_start
  AND ss.id != :exclude_slot_id   -- when editing
LIMIT 1;
```

If a row exists → return **HTTP 422**:

```json
{
  "message": "You already have a service scheduled during this time. Please choose a different slot."
}
```

### Improve `GET service-slots/{id}`

Optionally add a flag like `is_user_conflict` when the authenticated user already has a booking overlapping that slot (server-side precomputation). This is optional; client-side check is sufficient for MVP.

---

## Test matrix

| # | Existing | New candidate | Should block? |
|---|----------|---------------|---------------|
| 1 | 2:00–3:00 | 2:00–3:00 | Yes (exact) |
| 2 | 2:00–3:00 | 2:30–3:30 | Yes (partial end) |
| 3 | 2:00–3:00 | 1:30–2:15 | Yes (partial start) |
| 4 | 2:00–4:00 | 3:00–3:30 | Yes (contained) |
| 5 | 2:00–3:00 | 3:00–4:00 | No (adjacent) |
| 6 | 2:00–3:00 (status: rejected) | 2:00–3:00 | No |
| 7 | 2:00–3:00 (status: past) | 2:00–3:00 | No |
| 8 | Doctor A 2:00–3:00 | User books Doctor B 2:00–3:00 | No (different doctors) |
| 9 | User booking 5:00–6:00 (doctor) | User books 5:30–6:30 (trainer) | Yes (same user) |

---

## Limitations

- Client-side validation is a **first line of defense** for UX; backend validation is required for data integrity.
- `my-bookings` pagination: mitigated by filtering `from_date`/`to_date` to the selected day with `per_page: 100`.
- Concurrent requests from two devices can still race until backend transactions enforce uniqueness.

---

## Quick start for Cursor agent (doctor repo)

1. Copy `src/utils/appointmentOverlap.ts` into the doctor app.
2. Find the service/slot creation controller and screen.
3. Fetch the doctor's existing slots for the selected date before save.
4. Call `findOverlappingBooking()` before confirm/create.
5. Disable conflicting slots in the slot picker with `isSlotConflictingWithBookings()`.
6. Map API overlap errors with `isAppointmentOverlapApiError()`.
7. Add backend overlap validation in `yalla-backend` (see above).
