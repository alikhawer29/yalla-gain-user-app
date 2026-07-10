import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';
import type { AppleHealthKit, HealthValue } from 'react-native-health';

/** Prefer `Units` / `Observers` from `src/constants` — named `HealthUnit` / `HealthObserver` from the package entry can be undefined at runtime (bridge / bundling). */
const { Activities, Observers, Permissions, Units } =
  require('react-native-health/src/constants');
import {
  ExerciseType,
  initialize as hcInitialize,
  requestPermission as hcRequestPermission,
  readRecords as hcReadRecords,
  getSdkStatus as hcGetSdkStatus,
  openHealthConnectSettings,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

/**
 * Same as `react-native-health/index.js`: `Object.assign({}, AppleHealthKit, { Constants })`.
 * Do not trust the named `HealthKit` export for methods: if NativeModules is empty at
 * load time (bridgeless / ordering), you only get JS `Constants` and calling
 * `initHealthKit` / `getStepCount` throws "undefined is not a function".
 * Resolve the native module first, then merge Constants (imported from
 * `react-native-health/src/constants` so we never rely on a possibly-undefined
 * `HealthKit` named export from the package entry).
 */
function resolveAppleHealthKitNative(): Record<string, unknown> {
  const fromNativeModules = NativeModules.AppleHealthKit as Record<string, unknown> | undefined;
  const fromTurbo = TurboModuleRegistry.get('AppleHealthKit') as
    | Record<string, unknown>
    | undefined;

  /** Prefer the handle that exposes query methods (not only init). */
  const withQueries = [fromNativeModules, fromTurbo].find(
    (nm) =>
      nm != null &&
      typeof nm.getStepCount === 'function' &&
      typeof nm.initHealthKit === 'function',
  );
  if (withQueries) {
    return withQueries;
  }

  for (const nm of [fromNativeModules, fromTurbo]) {
    if (nm != null && typeof nm.initHealthKit === 'function') {
      return nm;
    }
  }

  if (fromNativeModules == null && fromTurbo == null) {
    throw new Error(
      'AppleHealthKit native module is not registered. Run `cd ios && pod install`, open the `.xcworkspace`, clean build (Shift+Cmd+K), then run the app. On Simulator, HealthKit may not load; use a physical iPhone.',
    );
  }

  throw new Error(
    'AppleHealthKit is registered but initHealthKit is missing. Clean build after `pod install`, reset Metro (`yarn start --reset-cache`), and reinstall the app.',
  );
}

/**
 * Merge `Constants` onto the **native module instance** — do not use `Object.assign({}, native, …)`:
 * shallow copy can drop native methods so `getStepCount` becomes undefined.
 */
function iosHealthKit(): AppleHealthKit {
  if (Platform.OS !== 'ios') {
    throw new Error('iosHealthKit() is iOS-only');
  }

  const appleNative = resolveAppleHealthKitNative();
  const existing = appleNative as { Constants?: unknown };
  if (!existing.Constants) {
    Object.assign(appleNative, {
      Constants: {
        Activities,
        Observers,
        Permissions,
        Units,
      },
    });
  }
  return appleNative as unknown as AppleHealthKit;
}

export type HealthPermissionState =
  | { status: 'unavailable'; reason: string }
  | { status: 'needs_install'; reason: string }
  | { status: 'ready' }
  | { status: 'denied'; reason?: string };

export type WatchMetrics = {
  steps?: number;
  caloriesKcal?: number;
  heartRateBpm?: number;
  heartRateAt?: string;
  /** Elapsed time of the most recent workout in the lookback window (HealthKit / Health Connect). */
  workoutDurationSec?: number;
  /** When set, same as `workoutDurationSec` (no separate “goal” from Health APIs). */
  workoutTotalDurationSec?: number;
  workoutActivityName?: string;
  workoutStartIso?: string;
  workoutEndIso?: string;
};

type LatestWorkoutFromHealth = {
  durationSec: number;
  totalDurationSec: number;
  activityName?: string;
  startIso?: string;
  endIso?: string;
};

/** HK workout samples from `getSamples` expose `start` / `end`, not always `duration`. */
function parseWorkoutSampleFromIos(raw: HealthValue | Record<string, unknown>): LatestWorkoutFromHealth | null {
  const w = raw as Record<string, unknown>;
  const durationRaw = w.duration;
  if (typeof durationRaw === 'number' && durationRaw > 0) {
    const durationSec = Math.round(durationRaw);
    return {
      durationSec,
      totalDurationSec: durationSec,
      activityName: typeof w.activityName === 'string' ? w.activityName : undefined,
      startIso: typeof w.start === 'string' ? w.start : undefined,
      endIso: typeof w.end === 'string' ? w.end : undefined,
    };
  }
  const start = w.start ?? w.startDate;
  const end = w.end ?? w.endDate;
  const s = typeof start === 'string' ? Date.parse(start) : NaN;
  const e = typeof end === 'string' ? Date.parse(end) : NaN;
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return null;
  const durationSec = Math.floor((e - s) / 1000);
  if (durationSec < 1) return null;
  return {
    durationSec,
    totalDurationSec: durationSec,
    activityName: typeof w.activityName === 'string' ? w.activityName : undefined,
    startIso: typeof start === 'string' ? start : undefined,
    endIso: typeof end === 'string' ? end : undefined,
  };
}

function exerciseTypeLabelAndroid(exerciseType: number | undefined): string | undefined {
  if (typeof exerciseType !== 'number') return undefined;
  const found = Object.entries(ExerciseType).find(([, v]) => v === exerciseType);
  if (!found) return undefined;
  return found[0]
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const startOfTodayIso = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

/** Local midnight N calendar days before today; start of workout lookback window. */
const startOfLocalDayIsoDaysAgo = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const nowIso = () => new Date().toISOString();

/** Latest workout for the ring: not limited to “today” (yesterday’s walk still counts). */
const WORKOUT_LOOKBACK_DAYS = 14;
const WORKOUT_DEBUG_PROBE_DAYS = 30;

/** Dev: verbose trace logs in Metro. Set `true` to also log in release/TestFlight APKs. */
const HEALTH_LOG_IN_RELEASE = false;
const HEALTH_LOG_VERBOSE =
  (typeof __DEV__ !== 'undefined' && __DEV__) || HEALTH_LOG_IN_RELEASE;

function healthLog(...args: unknown[]) {
  if (!HEALTH_LOG_VERBOSE) return;
  console.log('[YallaGain Health]', ...args);
}

let androidHcInitialized = false;

/**
 * Health Connect requires `initialize()` before every read session. Connect screen calls it
 * once during permission grant, but `getMetrics` runs again after cold start — without this,
 * reads fail silently and the Connected dashboard shows dashes.
 */
async function ensureAndroidHealthConnectInitialized(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }
  try {
    const sdkStatus = await hcGetSdkStatus();
    if (sdkStatus !== SdkAvailabilityStatus.SDK_AVAILABLE) {
      healthLog('Health Connect SDK not available', { sdkStatus });
      return false;
    }
    if (!androidHcInitialized) {
      const ok = await hcInitialize();
      androidHcInitialized = Boolean(ok);
      healthLog('hcInitialize', { ok });
      if (!ok) {
        return false;
      }
    }
    return true;
  } catch (e: unknown) {
    healthLog('ensureAndroidHealthConnectInitialized failed', e);
    return false;
  }
}

export async function getHealthPermissionState(): Promise<HealthPermissionState> {
  if (Platform.OS === 'ios') {
    return { status: 'ready' };
  }

  if (Platform.OS === 'android') {
    try {
      const sdkStatus = await hcGetSdkStatus();
      if (sdkStatus !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        return {
          status: 'needs_install',
          reason:
            'Health Connect is not available on this device. Please install Health Connect or update Android.',
        };
      }
      return { status: 'ready' };
    } catch (e: any) {
      return { status: 'unavailable', reason: e?.message || 'Unknown error' };
    }
  }

  return { status: 'unavailable', reason: 'Unsupported platform' };
}

export function openHealthSettings(): void {
  if (Platform.OS === 'android') {
    openHealthConnectSettings();
  }
  // iOS: we’ll route the user to app settings from the UI using Linking (screen layer).
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const kit = iosHealthKit();
    const permissions = {
      permissions: {
        read: [
          kit.Constants.Permissions.StepCount,
          kit.Constants.Permissions.HeartRate,
          kit.Constants.Permissions.ActiveEnergyBurned,
          kit.Constants.Permissions.Workout,
        ],
        write: [],
      },
    };

    return await new Promise<boolean>((resolve) => {
      kit.initHealthKit(permissions, (err: string) => {
        healthLog('initHealthKit callback', err ? { error: err } : { ok: true });
        resolve(!err);
      });
    });
  }

  if (Platform.OS === 'android') {
    const ok = await ensureAndroidHealthConnectInitialized();
    if (!ok) return false;

    const granted = await hcRequestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'HeartRate' },
      { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
      { accessType: 'read', recordType: 'TotalCaloriesBurned' },
      { accessType: 'read', recordType: 'ExerciseSession' },
    ]);

    return Array.isArray(granted) && granted.length > 0;
  }

  return false;
}

/** Extra HealthKit query when lookback returns nothing (not used for UI). */
async function logIosWorkoutProbeLastDays(days: number): Promise<void> {
  const endDate = nowIso();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  await new Promise<void>((resolve) => {
    iosHealthKit().getSamples(
      { startDate, endDate, type: Observers.Workout, limit: 1, ascending: false },
      (err: string, results: HealthValue[]) => {
        if (err) {
          healthLog('workoutSession probe (iOS, last N days)', { err, startDate, endDate, days });
          resolve();
          return;
        }
        const count = Array.isArray(results) ? results.length : 0;
        const w = Array.isArray(results) ? results[0] : undefined;
        const parsed = w ? parseWorkoutSampleFromIos(w) : null;
        healthLog('workoutSession probe (iOS, last N days)', {
          label: `debug: latest workout in last ${days} days (not used for UI)`,
          window: { start: startDate, end: endDate },
          count,
          firstRaw: w ? { ...(w as Record<string, unknown>) } : null,
          parsed,
          note:
            count === 0
              ? 'No workouts in Health in this range, or Workout read permission denied.'
              : 'If UI lookback is empty but this has data, check date math / permissions.',
        });
        resolve();
      },
    );
  });
}

async function logAndroidWorkoutProbeLastDays(days: number): Promise<void> {
  const endTime = nowIso();
  const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  try {
    const res: any = await hcReadRecords('ExerciseSession', {
      timeRangeFilter: { operator: 'between', startTime, endTime },
      pageSize: 1,
      ascendingOrder: false,
    } as any);
    const items = res?.records || res?.result || [];
    const rec = Array.isArray(items) && items.length > 0 ? items[0] : null;
    healthLog('workoutSession probe (Android, last N days)', {
      label: `latest session in last ${days} days (not used for UI)`,
      window: { start: startTime, end: endTime },
      firstRecord: rec,
    });
  } catch (e) {
    healthLog('workoutSession probe (Android)', e);
  }
}

async function logWorkoutSessionDiagnostics(
  platform: 'ios' | 'android',
  workoutWindowStart: string,
  workoutWindowEnd: string,
  workout: LatestWorkoutFromHealth | null,
): Promise<void> {
  if (!HEALTH_LOG_VERBOSE) return;

  if (workout) {
    healthLog('workoutSession', {
      source: `latest workout in last ${WORKOUT_LOOKBACK_DAYS} days (used for ring)`,
      window: { start: workoutWindowStart, end: workoutWindowEnd },
      result: workout,
    });
    return;
  }

  healthLog('workoutSession', {
    source: `latest workout in last ${WORKOUT_LOOKBACK_DAYS} days (used for ring)`,
    window: { start: workoutWindowStart, end: workoutWindowEnd },
    result: null,
    whyUiShowsDash: `No workouts in Health in the last ${WORKOUT_LOOKBACK_DAYS} days (or Workout read permission missing).`,
  });

  if (platform === 'ios') {
    await logIosWorkoutProbeLastDays(WORKOUT_DEBUG_PROBE_DAYS);
  } else {
    await logAndroidWorkoutProbeLastDays(WORKOUT_DEBUG_PROBE_DAYS);
  }
}

export async function getMetrics(): Promise<WatchMetrics> {
  const todayStart = startOfTodayIso();
  const endTime = nowIso();
  const workoutWindowStart = startOfLocalDayIsoDaysAgo(WORKOUT_LOOKBACK_DAYS);
  healthLog('getMetrics range', {
    todayStart,
    todayEnd: endTime,
    workoutWindowStart,
    workoutWindowEnd: endTime,
    workoutLookbackDays: WORKOUT_LOOKBACK_DAYS,
    platform: Platform.OS,
    note: 'Steps / active calories / HR: today only. Workout ring: latest session in workout window.',
  });

  if (Platform.OS === 'ios') {
    try {
      const [steps, caloriesKcal, heartRate, workout] = await Promise.all([
        getTodaySteps_ios(todayStart, endTime),
        getTodayActiveCalories_ios(todayStart, endTime),
        getLatestHeartRate_ios(todayStart, endTime),
        getLatestWorkout_ios(workoutWindowStart, endTime),
      ]);

      const merged: WatchMetrics = {
        steps: typeof steps === 'number' ? Math.round(steps) : undefined,
        caloriesKcal: caloriesKcal ?? undefined,
        heartRateBpm: heartRate?.bpm,
        heartRateAt: heartRate?.at,
        workoutDurationSec: workout?.durationSec,
        workoutTotalDurationSec: workout?.totalDurationSec,
        workoutActivityName: workout?.activityName,
        workoutStartIso: workout?.startIso,
        workoutEndIso: workout?.endIso,
      };
      await logWorkoutSessionDiagnostics('ios', workoutWindowStart, endTime, workout);
      healthLog('getMetrics merged (iOS)', merged);
      return merged;
    } catch (e) {
      healthLog('getMetrics error (iOS)', e);
      return {};
    }
  }

  if (Platform.OS === 'android') {
    const ready = await ensureAndroidHealthConnectInitialized();
    if (!ready) {
      return {};
    }

    const [steps, caloriesKcal, heartRate, workout] = await Promise.all([
      getTodaySteps_android(todayStart, endTime),
      getTodayActiveCalories_android(todayStart, endTime),
      getLatestHeartRate_android(todayStart, endTime),
      getLatestWorkout_android(workoutWindowStart, endTime),
    ]);

    const merged: WatchMetrics = {
      steps: typeof steps === 'number' ? Math.round(steps) : undefined,
      caloriesKcal: caloriesKcal ?? undefined,
      heartRateBpm: heartRate?.bpm,
      heartRateAt: heartRate?.at,
      workoutDurationSec: workout?.durationSec,
      workoutTotalDurationSec: workout?.totalDurationSec,
      workoutActivityName: workout?.activityName,
      workoutStartIso: workout?.startIso,
      workoutEndIso: workout?.endIso,
    };
    await logWorkoutSessionDiagnostics('android', workoutWindowStart, endTime, workout);
    healthLog('getMetrics merged (Android)', merged);
    return merged;
  }

  return {};
}

async function getTodaySteps_ios(
  startDate: string,
  endDate: string,
): Promise<number | null> {
  return await new Promise((resolve) => {
    iosHealthKit().getStepCount(
      { startDate, endDate },
      (err: string, results: { value?: number }) => {
        if (err) {
          healthLog('getStepCount', { err, startDate, endDate });
          return resolve(null);
        }
        const value = typeof results?.value === 'number' ? results.value : null;
        healthLog('getStepCount', { value, raw: results });
        resolve(value);
      },
    );
  });
}

async function getTodayActiveCalories_ios(
  startDate: string,
  endDate: string,
): Promise<number | null> {
  return await new Promise((resolve) => {
    iosHealthKit().getActiveEnergyBurned(
      { startDate, endDate, unit: Units.kilocalorie },
      (err: string, results: Array<{ value?: number }>) => {
        if (err) {
          healthLog('getActiveEnergyBurned', { err, startDate, endDate });
          return resolve(null);
        }
        const sum = Array.isArray(results)
          ? results.reduce((acc, r) => acc + (typeof r?.value === 'number' ? r.value : 0), 0)
          : 0;
        healthLog('getActiveEnergyBurned', {
          sampleCount: Array.isArray(results) ? results.length : 0,
          sumKcal: sum > 0 ? sum : null,
        });
        resolve(sum > 0 ? sum : null);
      },
    );
  });
}

async function getLatestHeartRate_ios(
  startDate: string,
  endDate: string,
): Promise<{ bpm: number; at: string } | null> {
  return await new Promise((resolve) => {
    iosHealthKit().getHeartRateSamples(
      { startDate, endDate, limit: 1, ascending: false },
      (err: string, results: Array<{ value?: number; startDate?: string }>) => {
        if (err) {
          healthLog('getHeartRateSamples', { err, startDate, endDate });
          return resolve(null);
        }
        const sample = Array.isArray(results) ? results[0] : undefined;
        healthLog('getHeartRateSamples', {
          count: Array.isArray(results) ? results.length : 0,
          first: sample ?? null,
        });
        if (!sample || typeof sample.value !== 'number') return resolve(null);
        resolve({ bpm: sample.value, at: sample.startDate || endDate });
      },
    );
  });
}

async function getLatestWorkout_ios(
  startDate: string,
  endDate: string,
): Promise<LatestWorkoutFromHealth | null> {
  return await new Promise((resolve) => {
    iosHealthKit().getSamples(
      { startDate, endDate, type: Observers.Workout, limit: 1, ascending: false },
      (err: string, results: HealthValue[]) => {
        if (err) {
          healthLog('workoutSession lookback getSamples', { err, startDate, endDate });
          return resolve(null);
        }
        const count = Array.isArray(results) ? results.length : 0;
        const w = Array.isArray(results) ? results[0] : undefined;
        healthLog('workoutSession lookback getSamples', {
          count,
          firstRaw: w ? { ...(w as Record<string, unknown>) } : null,
        });
        if (!w) return resolve(null);
        const parsed = parseWorkoutSampleFromIos(w);
        if (!parsed) {
          healthLog('workoutSession parseWorkoutSampleFromIos', {
            returnedNull: true,
            keys: w && typeof w === 'object' ? Object.keys(w as object) : [],
          });
        } else {
          healthLog('workoutSession parseWorkoutSampleFromIos', parsed);
        }
        resolve(parsed);
      },
    );
  });
}

async function getTodaySteps_android(
  startTime: string,
  endTime: string,
): Promise<number | null> {
  try {
    const res: any = await hcReadRecords('Steps', {
      timeRangeFilter: { operator: 'between', startTime, endTime },
    } as any);
    const items = res?.records || res?.result || [];
    if (!Array.isArray(items)) {
      healthLog('Android Steps', { recordCount: 'invalid', resKeys: res ? Object.keys(res) : [] });
      return null;
    }
    const sum = items.reduce((acc, r) => acc + (typeof r?.count === 'number' ? r.count : 0), 0);
    const dataOrigins = Array.from(
      new Set(
        items
          .map((r: any) => r?.metadata?.dataOrigin)
          .filter((s: any): s is string => typeof s === 'string' && s.length > 0),
      ),
    );
    healthLog('Android Steps', { recordCount: items.length, sum, dataOrigins });
    return sum > 0 ? sum : null;
  } catch (e: unknown) {
    healthLog('Android Steps error', { error: e instanceof Error ? e.message : String(e) });
    return null;
  }
}

type KcalReadResult =
  | { ok: true; sum: number; count: number; origins: string[] }
  | { ok: false; error: string };

/**
 * Reads kcal records from Health Connect, never throws. A `SecurityException`
 * here is expected when the caller hasn't granted the matching `READ_*`
 * permission yet — callers should treat that as "no data" and continue.
 */
async function readKcalSumFromHc(
  recordType: 'ActiveCaloriesBurned' | 'TotalCaloriesBurned',
  startTime: string,
  endTime: string,
): Promise<KcalReadResult> {
  try {
    const res: any = await hcReadRecords(recordType, {
      timeRangeFilter: { operator: 'between', startTime, endTime },
    } as any);
    const items = res?.records || res?.result || [];
    if (!Array.isArray(items)) return { ok: true, sum: 0, count: 0, origins: [] };
    const sum = items.reduce((acc, r) => {
      const kcal = r?.energy?.inKilocalories;
      return acc + (typeof kcal === 'number' ? kcal : 0);
    }, 0);
    const origins = Array.from(
      new Set(
        items
          .map((r: any) => r?.metadata?.dataOrigin)
          .filter((s: any): s is string => typeof s === 'string' && s.length > 0),
      ),
    );
    return { ok: true, sum, count: items.length, origins };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/**
 * Active first, then Total fallback. Samsung Health (and several other consumer
 * apps) only writes `TotalCaloriesBurned` to Health Connect, so an `Active`-only
 * read returns 0 for most users even when they have step/calorie data.
 */
async function getTodayActiveCalories_android(
  startTime: string,
  endTime: string,
): Promise<number | null> {
  const active = await readKcalSumFromHc('ActiveCaloriesBurned', startTime, endTime);
  if (active.ok) {
    healthLog('Android ActiveCaloriesBurned', {
      recordCount: active.count,
      sumKcal: active.sum > 0 ? active.sum : null,
      dataOrigins: active.origins,
    });
    if (active.sum > 0) return active.sum;
  } else {
    healthLog('Android ActiveCaloriesBurned (skipped)', { error: active.error });
  }

  const total = await readKcalSumFromHc('TotalCaloriesBurned', startTime, endTime);
  if (total.ok) {
    healthLog('Android TotalCaloriesBurned (fallback)', {
      recordCount: total.count,
      sumKcal: total.sum > 0 ? total.sum : null,
      dataOrigins: total.origins,
    });
    return total.sum > 0 ? total.sum : null;
  }
  healthLog('Android TotalCaloriesBurned (skipped)', { error: total.error });
  return null;
}

async function getLatestHeartRate_android(
  startTime: string,
  endTime: string,
): Promise<{ bpm: number; at: string } | null> {
  try {
    // `ascendingOrder: false` is required: with the library's default `true`, `pageSize: 1` returns the oldest HR record of the day, not the latest.
    const res: any = await hcReadRecords('HeartRate', {
      timeRangeFilter: { operator: 'between', startTime, endTime },
      pageSize: 1,
      ascendingOrder: false,
    } as any);
    const items = res?.records || res?.result || [];
    if (!Array.isArray(items) || items.length === 0) {
      healthLog('Android HeartRate', { recordCount: 0 });
      return null;
    }
    const rec = items[0];
    const samples = Array.isArray(rec?.samples) ? rec.samples : [];
    // The HR sample with the largest timestamp inside the most recent record is the latest reading.
    const latest = samples.reduce<any>((best, s) => {
      const t = s?.time ? Date.parse(s.time) : NaN;
      if (!Number.isFinite(t)) return best;
      if (!best) return s;
      const bt = best?.time ? Date.parse(best.time) : NaN;
      return Number.isFinite(bt) && bt >= t ? best : s;
    }, null);
    const bpm = latest?.beatsPerMinute;
    const at = latest?.time || rec?.endTime || rec?.startTime || endTime;
    const dataOrigin = rec?.metadata?.dataOrigin;
    if (typeof bpm !== 'number') {
      healthLog('Android HeartRate', { recordCount: items.length, rec: rec ?? null, dataOrigin });
      return null;
    }
    healthLog('Android HeartRate', { bpm, at, dataOrigin });
    return { bpm, at };
  } catch (e: unknown) {
    healthLog('Android HeartRate error', { error: e instanceof Error ? e.message : String(e) });
    return null;
  }
}

async function getLatestWorkout_android(
  startTime: string,
  endTime: string,
): Promise<LatestWorkoutFromHealth | null> {
  let res: any;
  try {
    res = await hcReadRecords('ExerciseSession', {
      timeRangeFilter: { operator: 'between', startTime, endTime },
      pageSize: 1,
      ascendingOrder: false,
    } as any);
  } catch (e: any) {
    healthLog('Android ExerciseSession error', { error: e?.message || String(e) });
    return null;
  }
  const items = res?.records || res?.result || [];
  if (!Array.isArray(items) || items.length === 0) {
    healthLog('workoutSession lookback ExerciseSession', { count: 0, startTime, endTime });
    return null;
  }
  const rec = items[0];
  const s = Date.parse(rec?.startTime);
  const e = Date.parse(rec?.endTime);
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) {
    healthLog('workoutSession lookback ExerciseSession bad times', { rec });
    return null;
  }
  const durationSec = Math.floor((e - s) / 1000);
  if (durationSec < 1) {
    healthLog('workoutSession lookback ExerciseSession duration < 1s', { rec });
    return null;
  }
  const title = typeof rec?.title === 'string' ? rec.title.trim() : '';
  const activityName =
    title.length > 0 ? title : exerciseTypeLabelAndroid(rec?.exerciseType as number | undefined);
  const out = {
    durationSec,
    totalDurationSec: durationSec,
    activityName,
    startIso: rec?.startTime,
    endIso: rec?.endTime,
  };
  healthLog('workoutSession lookback ExerciseSession', out);
  return out;
}

const WATCH_HEALTH_LINKED_KEY = '@yallagain/watch_health_linked';

/** Set once the user completes Connect (HealthKit / Health Connect). Used to skip the CTA on next visit. */
export async function setWatchHealthLinked(linked: boolean): Promise<void> {
  if (linked) {
    await AsyncStorage.setItem(WATCH_HEALTH_LINKED_KEY, '1');
  } else {
    await AsyncStorage.removeItem(WATCH_HEALTH_LINKED_KEY);
  }
}

export async function getWatchHealthLinked(): Promise<boolean> {
  const v = await AsyncStorage.getItem(WATCH_HEALTH_LINKED_KEY);
  return v === '1';
}
