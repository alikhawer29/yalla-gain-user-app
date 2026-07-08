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
| `src/screens/AppointmentBooking/useAppointmentBookingController.ts` | Fetch bookings, detect conflicts, `onSlotPress` handler, validate before save |
| `src/screens/AppointmentBooking/index.tsx` | Tappable slots (plain `TouchableOpacity`) that surface a validation modal |
| `src/screens/AppointmentBooking/styles.ts` | `slot_item_conflict` style |

### Key lessons learned (apply these in the doctor app)

These are the fixes that actually made it work — do the same in the doctor repo to avoid the same dead-ends:

1. **Show a centered modal, not a toast.** The toast (`react-native-toast-message`) did not reliably render. Use the app's existing modal context (`showOkModal` from `useModal`) which is already used for other errors on the screen.
2. **Do NOT disable the slot cube.** A disabled `Touchable`/`TouchableWithoutFeedback` swallows the tap, so no message can appear. Keep slots **tappable** and decide what to do inside the press handler.
3. **Use a plain `TouchableOpacity`** for the slot cube. A custom `Touchable` wrapper (reanimated + `TouchableWithoutFeedback`) was unreliable for these taps.
4. **Do NOT filter `my-bookings` by `from_date`/`to_date`.** The backend stores dates as `MM/DD/YYYY` but the query sent `YYYY-MM-DD`, so the server returned zero rows and nothing was ever detected as a conflict. Fetch broadly (`per_page: 100`) and let the overlap util match the date client-side (it already only matches same-day bookings).

### User app integration pattern

1. **Fetch existing bookings** via `GET my-bookings` (no date filter), for **both** provider types, and tag each with its type so the message can name the provider:
   ```typescript
   const { data: doctorBookingsData } = useGetMyBookingsQuery({
     type: 'doctor',
     per_page: 100,
     page: 1,
   });
   const { data: trainerBookingsData } = useGetMyBookingsQuery({
     type: 'trainer',
     per_page: 100,
     page: 1,
   });

   const existingBookingsForDate = useMemo(
     () => [
       ...(doctorBookingsData?.data ?? []).map((b: any) => ({ ...b, __providerType: 'doctor' })),
       ...(trainerBookingsData?.data ?? []).map((b: any) => ({ ...b, __providerType: 'trainer' })),
     ],
     [doctorBookingsData?.data, trainerBookingsData?.data],
   );
   ```

2. **Tap handler** — every slot is tappable and this decides what happens:
   ```typescript
   const getUserConflictForSlot = (startTime: string, endTime: string) =>
     formattedDate
       ? findOverlappingBooking(existingBookingsForDate, formattedDate, startTime, endTime)
       : undefined;

   const describeBookingProvider = (booking: any) => {
     const providerType = booking?.__providerType === 'trainer' ? 'trainer' : 'doctor';
     const name = [booking?.service?.user?.first_name, booking?.service?.user?.last_name]
       .filter(Boolean)
       .join(' ')
       .trim();
     return name ? `a different ${providerType} (${name})` : `a different ${providerType}`;
   };

   const onSlotPress = (
     slot: { start: string; end: string },
     options?: { isBooked?: boolean; isPassed?: boolean },
   ) => {
     const conflict = getUserConflictForSlot(slot.start, slot.end);
     if (conflict) {
       showOkModal({
         type: 'error',
         title: 'Already Booked',
         message: `You already have a booking at this time with ${describeBookingProvider(conflict)}. Please choose a different slot.`,
       });
       return;
     }
     if (options?.isBooked) {
       showOkModal({ type: 'error', title: 'Already Booked', message: 'This time slot is already booked. Please choose another slot.' });
       return;
     }
     if (options?.isPassed) {
       showOkModal({ type: 'error', title: 'Slot Unavailable', message: 'This time slot has already passed. Please select another slot.' });
       return;
     }
     onSlotSelect(slot);
   };
   ```

3. **Slot UI** — plain `TouchableOpacity`, no `disabled`, always routes through `onSlotPress`:
   ```tsx
   <TouchableOpacity
     activeOpacity={0.7}
     style={[
       styles.slot_item,
       isSelected && styles.slot_item_selected,
       isBooked && styles.slot_item_booked,
       isUserConflict && !isBooked && styles.slot_item_conflict,
       isPassed && !isBooked && !isUserConflict && styles.slot_item_passed,
     ]}
     onPress={() => onSlotPress(slotData, { isBooked, isPassed })}
   >
     <Text>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</Text>
   </TouchableOpacity>
   ```

4. **Still validate on the primary submit button** (`onBook`) with `findOverlappingBooking` before showing the confirm modal — the tap handler is UX, this is the guard.

5. **Handle backend overlap errors** in the `book/appointment` catch block using `isAppointmentOverlapApiError()`.

### User app API endpoints

Base URL: `https://custom-dev.onlinetestingserver.com/yalla-backend/api/user/`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `my-bookings?type=&per_page=100` | Existing user bookings (filter date client-side) |
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

**Do NOT rely on a backend `from_date`/`to_date` filter.** In the user app the backend stored dates as `MM/DD/YYYY` while the query sent `YYYY-MM-DD`, so the server returned zero rows and detection silently failed. Fetch broadly (e.g. `per_page: 100`) and let `findOverlappingBooking` match the date client-side (it only matches same-day windows anyway).

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

### Step 5 — Make slots tappable and show a validation modal (do NOT disable)

In the slot selection screen, keep every slot **tappable** and decide inside the press handler. A disabled cube swallows the tap and no message can appear.

```tsx
// UI: plain TouchableOpacity, no `disabled` prop
<TouchableOpacity
  activeOpacity={0.7}
  style={[
    styles.slot_item,
    isSelected && styles.slot_item_selected,
    isBooked && styles.slot_item_booked,
    isDoctorConflict && !isBooked && styles.slot_item_conflict,
    isPassed && !isBooked && !isDoctorConflict && styles.slot_item_passed,
  ]}
  onPress={() => onSlotPress(slotData, { isBooked, isPassed })}
>
  <Text>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</Text>
</TouchableOpacity>
```

```typescript
// Controller
const isDoctorConflict = isSlotConflictingWithBookings(
  existingDoctorSlotsForDate,
  formattedDate,
  slot.start_time,
  slot.end_time,
);

const onSlotPress = (slot, options) => {
  const conflict = findOverlappingBooking(
    existingDoctorSlotsForDate,
    formattedDate,
    slot.start,
    slot.end,
  );
  if (conflict) {
    showOkModal({ type: 'error', title: 'Scheduling Conflict', message: DOCTOR_SCHEDULING_CONFLICT_MESSAGE });
    return;
  }
  if (options?.isBooked) {
    showOkModal({ type: 'error', title: 'Already Booked', message: 'This time slot is already booked.' });
    return;
  }
  if (options?.isPassed) {
    showOkModal({ type: 'error', title: 'Slot Unavailable', message: 'This time slot has already passed.' });
    return;
  }
  onSlotSelect(slot);
};
```

Add a visual style (e.g. `slot_item_conflict`) so doctors also see conflicting slots highlighted before tapping.

**Reminder:** use the doctor app's own modal context (`showOkModal` / equivalent), NOT a toast. Toasts were unreliable in the user app.

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
- `my-bookings` pagination: fetch broadly with `per_page: 100` and match the date client-side (do not rely on backend date filtering — it silently returned nothing).
- Concurrent requests from two devices can still race until backend transactions enforce uniqueness.

---

## Quick start for Cursor agent (doctor repo)

1. Copy `src/utils/appointmentOverlap.ts` into the doctor app.
2. Find the service/slot creation controller and screen.
3. Fetch the doctor's existing slots **without a backend date filter** (`per_page: 100`), match the date client-side.
4. Call `findOverlappingBooking()` before confirm/create.
5. Keep slot cubes **tappable** (plain `TouchableOpacity`, no `disabled`); in `onSlotPress`, show a centered modal (`showOkModal`, NOT a toast) when there is a conflict / booked / passed slot, otherwise select.
6. Map API overlap errors with `isAppointmentOverlapApiError()`.
7. Add backend overlap validation in `yalla-backend` (see above).

### Pitfalls that wasted time in the user app (avoid these)

- Toast messages did not render — use the modal context (`showOkModal`).
- `disabled` slot cubes swallow taps — never disable; handle inside `onSlotPress`.
- The custom `Touchable` (reanimated wrapper) was unreliable — use plain `TouchableOpacity`.
- Backend `from_date`/`to_date` filter returned nothing due to `MM/DD/YYYY` vs `YYYY-MM-DD` — filter client-side.
