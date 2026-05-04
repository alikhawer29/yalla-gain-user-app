import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';
import {
  getSdkStatus,
  initialize,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import type { Permission } from 'react-native-health-connect';

/** Result of a single native provider read attempt. */
export type NativeHealthReadResult =
  | { ok: true; steps: number; activeCalories: number }
  | { ok: false };

/**
 * Builds local ISO range strings from midnight today through now.
 * @param now Current instant (injectable for tests).
 */
export function getLocalDayRangeIso(now: Date = new Date()): {
  startIso: string;
  endIso: string;
} {
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  return { startIso: start.toISOString(), endIso: now.toISOString() };
}

/**
 * Formats a `Date` as `YYYY-MM-DD` in local calendar fields.
 * @param d Date to format.
 */
export function formatLocalYyyyMmDd(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const { Permissions } = AppleHealthKit.Constants;

let iosInitPromise: Promise<boolean> | null = null;

function ensureIosHealthKit(): Promise<boolean> {
  if (iosInitPromise) {
    return iosInitPromise;
  }
  iosInitPromise = new Promise(resolve => {
    const permissions: HealthKitPermissions = {
      permissions: {
        read: [Permissions.StepCount, Permissions.ActiveEnergyBurned],
        write: [],
      },
    };
    AppleHealthKit.initHealthKit(permissions, (error?: string) => {
      resolve(!error);
    });
  });
  return iosInitPromise;
}

function sumHealthValues(samples: HealthValue[] | undefined): number {
  if (!samples?.length) {
    return 0;
  }
  return samples.reduce((acc, s) => acc + (Number(s?.value) || 0), 0);
}

function promisifyDailySteps(
  startIso: string,
  endIso: string,
): Promise<number> {
  return new Promise(resolve => {
    AppleHealthKit.getDailyStepCountSamples(
      { startDate: startIso, endDate: endIso },
      (_err: string, results: HealthValue[]) => {
        resolve(sumHealthValues(results));
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
        resolve(sumHealthValues(results));
      },
    );
  });
}

let androidInitDone = false;

const androidReadPermissions: Permission[] = [
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
];

async function ensureAndroidHealthConnect(): Promise<boolean> {
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
    await requestPermission(androidReadPermissions);
    return true;
  } catch {
    return false;
  }
}

async function readAllAndroidSteps(
  startIso: string,
  endIso: string,
): Promise<number> {
  const timeRangeFilter = {
    operator: 'between' as const,
    startTime: startIso,
    endTime: endIso,
  };
  let pageToken: string | undefined;
  let total = 0;
  do {
    const page = await readRecords('Steps', {
      timeRangeFilter,
      pageToken,
    });
    for (const r of page.records) {
      total += Number(r.count) || 0;
    }
    pageToken = page.pageToken;
  } while (pageToken);
  return total;
}

async function readAllAndroidActiveKcal(
  startIso: string,
  endIso: string,
): Promise<number> {
  const timeRangeFilter = {
    operator: 'between' as const,
    startTime: startIso,
    endTime: endIso,
  };
  let pageToken: string | undefined;
  let total = 0;
  do {
    const page = await readRecords('ActiveCaloriesBurned', {
      timeRangeFilter,
      pageToken,
    });
    for (const r of page.records) {
      const energy = r.energy as { inKilocalories?: number } | undefined;
      total += Number(energy?.inKilocalories) || 0;
    }
    pageToken = page.pageToken;
  } while (pageToken);
  return Math.round(total * 10) / 10;
}

/**
 * Reads today's steps and active energy from HealthKit (iOS) or Health Connect (Android).
 * @returns `{ ok: true, ... }` when the query ran without throwing; `{ ok: false }` on failure.
 */
export async function readTodayHealthFromNative(
  now: Date = new Date(),
): Promise<NativeHealthReadResult> {
  const { startIso, endIso } = getLocalDayRangeIso(now);

  try {
    if (Platform.OS === 'ios') {
      const ready = await ensureIosHealthKit();
      if (!ready) {
        return { ok: false };
      }
      const [steps, activeCalories] = await Promise.all([
        promisifyDailySteps(startIso, endIso),
        promisifyActiveEnergy(startIso, endIso),
      ]);
      return {
        ok: true,
        steps: Math.round(steps),
        activeCalories: Math.round(activeCalories * 10) / 10,
      };
    }

    if (Platform.OS === 'android') {
      const ready = await ensureAndroidHealthConnect();
      if (!ready) {
        return { ok: false };
      }
      const [steps, activeCalories] = await Promise.all([
        readAllAndroidSteps(startIso, endIso),
        readAllAndroidActiveKcal(startIso, endIso),
      ]);
      return { ok: true, steps, activeCalories };
    }

    return { ok: false };
  } catch {
    return { ok: false };
  }
}
