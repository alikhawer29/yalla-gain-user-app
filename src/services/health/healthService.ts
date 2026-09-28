import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';
import {
  aggregateRecord,
  getSdkStatus,
  initialize,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import {
  formatYmdInTimezone,
  getDayRangeIsoInTimezone,
  resolveUserTimezone,
} from '../../utils/timezone';

/** Result of a single native provider read attempt. */
export type NativeHealthReadResult =
  | { ok: true; steps: number; activeCalories: number }
  | { ok: false };

/**
 * Builds ISO range strings from midnight today through now in the user timezone.
 * @param now Current instant (injectable for tests).
 * @param timeZone IANA timezone (profile or device); defaults to device.
 */
export function getLocalDayRangeIso(
  now: Date = new Date(),
  timeZone?: string | null,
): {
  startIso: string;
  endIso: string;
} {
  return getDayRangeIsoInTimezone(resolveUserTimezone(timeZone), now);
}

/**
 * Formats a `Date` as `YYYY-MM-DD` in the user timezone (falls back to device).
 * @param d Date to format.
 * @param timeZone IANA timezone (profile or device).
 */
export function formatLocalYyyyMmDd(
  d: Date = new Date(),
  timeZone?: string | null,
): string {
  return formatYmdInTimezone(d, resolveUserTimezone(timeZone));
}

function getIosPermissions(): {
  Permissions: { StepCount: string; ActiveEnergyBurned: string } | null;
  available: boolean;
} {
  try {
    const constants = (AppleHealthKit as unknown as { Constants?: unknown } | null)?.Constants as
      | { Permissions?: unknown }
      | undefined;
    const perms = (constants as { Permissions?: unknown } | undefined)?.Permissions as
      | { StepCount?: unknown; ActiveEnergyBurned?: unknown }
      | undefined;
    const StepCount = perms?.StepCount;
    const ActiveEnergyBurned = perms?.ActiveEnergyBurned;
    const ok =
      typeof StepCount === 'string' && typeof ActiveEnergyBurned === 'string';

    return ok
      ? { Permissions: { StepCount, ActiveEnergyBurned }, available: true }
      : { Permissions: null, available: false };
  } catch {
    return { Permissions: null, available: false };
  }
}

let iosInitPromise: Promise<boolean> | null = null;

function ensureIosHealthKit(): Promise<boolean> {
  if (iosInitPromise) {
    return iosInitPromise;
  }
  iosInitPromise = new Promise(resolve => {
    const permInfo = getIosPermissions();
    if (!permInfo.available || !permInfo.Permissions) {
      resolve(false);
      return;
    }
    const permissions: HealthKitPermissions = {
      permissions: {
        read: [
          permInfo.Permissions.StepCount,
          permInfo.Permissions.ActiveEnergyBurned,
        ],
        write: [],
      },
    };
    AppleHealthKit.initHealthKit(permissions, (error?: string) => {
      resolve(!error);
    });
  });
  return iosInitPromise;
}

/** Same aggregate API the Watch screen / Apple Health use (not raw daily samples). */
function promisifyStepCount(startIso: string, endIso: string): Promise<number> {
  return new Promise(resolve => {
    AppleHealthKit.getStepCount(
      { startDate: startIso, endDate: endIso },
      (_err: string, results: { value?: number }) => {
        resolve(typeof results?.value === 'number' ? results.value : 0);
      },
    );
  });
}

function promisifyActiveEnergy(
  startIso: string,
  endIso: string,
): Promise<number> {
  return new Promise(resolve => {
    AppleHealthKit.getActiveEnergyBurned(
      { startDate: startIso, endDate: endIso },
      (_err: string, results: HealthValue[]) => {
        if (!results?.length) {
          resolve(0);
          return;
        }
        const sum = results.reduce((acc, s) => acc + (Number(s?.value) || 0), 0);
        resolve(sum);
      },
    );
  });
}

let androidInitDone = false;

/**
 * Health Connect initialize only — never requestPermission (UI-owned).
 */
export async function ensureAndroidHealthConnectReady(): Promise<boolean> {
  try {
    const status = await getSdkStatus();
    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
      return false;
    }
    if (!androidInitDone) {
      const ok = await initialize();
      androidInitDone = Boolean(ok);
      if (!ok) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Aggregate steps for a time range — matches Health Connect app totals (deduped).
 */
export async function aggregateAndroidSteps(
  startIso: string,
  endIso: string,
): Promise<number> {
  const result = await aggregateRecord({
    recordType: 'Steps',
    timeRangeFilter: {
      operator: 'between',
      startTime: startIso,
      endTime: endIso,
    },
  });
  const total = result?.COUNT_TOTAL;
  return typeof total === 'number' && Number.isFinite(total) ? total : 0;
}

/**
 * Aggregate active kcal, falling back to total calories (Samsung / some OEMs).
 */
export async function aggregateAndroidActiveCalories(
  startIso: string,
  endIso: string,
): Promise<number> {
  const timeRangeFilter = {
    operator: 'between' as const,
    startTime: startIso,
    endTime: endIso,
  };

  try {
    const active = await aggregateRecord({
      recordType: 'ActiveCaloriesBurned',
      timeRangeFilter,
    });
    const kcal = active?.ACTIVE_CALORIES_TOTAL?.inKilocalories;
    if (typeof kcal === 'number' && Number.isFinite(kcal) && kcal > 0) {
      return Math.round(kcal * 10) / 10;
    }
  } catch {
    // Fall through to TotalCaloriesBurned.
  }

  try {
    const total = await aggregateRecord({
      recordType: 'TotalCaloriesBurned',
      timeRangeFilter,
    });
    const kcal = total?.ENERGY_TOTAL?.inKilocalories;
    if (typeof kcal === 'number' && Number.isFinite(kcal)) {
      return Math.round(kcal * 10) / 10;
    }
  } catch {
    // No calorie permission / data.
  }

  return 0;
}

/**
 * Shared day-range steps + calories used by Home and Watch Connected.
 * Keeps both screens aligned with each other and with Health Connect / HealthKit aggregates.
 */
export async function readStepsAndCaloriesInRange(
  startIso: string,
  endIso: string,
): Promise<NativeHealthReadResult> {
  try {
    if (Platform.OS === 'ios') {
      const ready = await ensureIosHealthKit();
      if (!ready) {
        return { ok: false };
      }
      const [steps, activeCalories] = await Promise.all([
        promisifyStepCount(startIso, endIso),
        promisifyActiveEnergy(startIso, endIso),
      ]);
      return {
        ok: true,
        steps: Math.round(steps),
        activeCalories: Math.round(activeCalories * 10) / 10,
      };
    }

    if (Platform.OS === 'android') {
      const ready = await ensureAndroidHealthConnectReady();
      if (!ready) {
        return { ok: false };
      }
      const [steps, activeCalories] = await Promise.all([
        aggregateAndroidSteps(startIso, endIso),
        aggregateAndroidActiveCalories(startIso, endIso),
      ]);
      return {
        ok: true,
        steps: Math.round(steps),
        activeCalories,
      };
    }

    return { ok: false };
  } catch {
    return { ok: false };
  }
}

/**
 * Reads today's steps and active energy from HealthKit (iOS) or Health Connect (Android).
 * Day window is midnight→now in the user's timezone.
 * @returns `{ ok: true, ... }` when the query ran without throwing; `{ ok: false }` on failure.
 */
export async function readTodayHealthFromNative(
  now: Date = new Date(),
  timeZone?: string | null,
): Promise<NativeHealthReadResult> {
  const { startIso, endIso } = getLocalDayRangeIso(now, timeZone);
  return readStepsAndCaloriesInRange(startIso, endIso);
}
