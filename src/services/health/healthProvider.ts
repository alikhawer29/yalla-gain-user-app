import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';
import type { AppleHealthKit, HealthValue } from 'react-native-health';
import { store } from '../../redux/Store';
import type { RootState } from '../../redux/Store';
import {
  getDayRangeIsoInTimezone,
  resolveUserTimezone,
  startOfDayUtcMsForYmd,
  formatYmdInTimezone,
} from '../../utils/timezone';
import {
  ensureAndroidHealthConnectReady,
  readStepsAndCaloriesInRange,
} from './healthService';

/** Prefer `Units` / `Observers` from `src/constants` — named `HealthUnit` / `HealthObserver` from the package entry can be undefined at runtime (bridge / bundling). */
const { Activities, Observers, Permissions, Units } =
  require('react-native-health/src/constants');
import {
  ExerciseType,
  requestPermission as hcRequestPermission,
  readRecords as hcReadRecords,
  getSdkStatus as hcGetSdkStatus,
  getGrantedPermissions as hcGetGrantedPermissions,
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

function resolveHealthTimezone(): string {
  try {
    const user = (store.getState() as RootState).auth.user;
    return resolveUserTimezone(
      typeof user?.timezone === 'string' ? user.timezone : null,
    );
  } catch {
    return resolveUserTimezone(null);
  }
}

/** Midnight today in the user's timezone, as UTC ISO. */
const startOfTodayIso = () => {
  const tz = resolveHealthTimezone();
  const { startIso } = getDayRangeIsoInTimezone(tz);
  return startIso;
};

/** Local midnight N calendar days before today (user TZ); start of workout lookback window. */
const startOfLocalDayIsoDaysAgo = (daysAgo: number) => {
  const tz = resolveHealthTimezone();
  const todayYmd = formatYmdInTimezone(new Date(), tz);
  const todayStart = startOfDayUtcMsForYmd(todayYmd, tz);
  // Midday probe so DST length doesn't skip a calendar day
  const probe = new Date(todayStart - daysAgo * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000);
  const ymd = formatYmdInTimezone(probe, tz);
  return new Date(startOfDayUtcMsForYmd(ymd, tz)).toISOString();
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
    const ok = await ensureAndroidHealthConnectReady();
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
    note: 'Steps / active calories: shared aggregate reader (same as Home). Workout ring: lookback window.',
  });

  if (Platform.OS === 'ios') {
    try {
      const [dayTotals, heartRate, workout] = await Promise.all([
        readStepsAndCaloriesInRange(todayStart, endTime),
        getLatestHeartRate_ios(todayStart, endTime),
        getLatestWorkout_ios(workoutWindowStart, endTime),
      ]);

      const merged: WatchMetrics = {
        steps: dayTotals.ok ? dayTotals.steps : undefined,
        caloriesKcal: dayTotals.ok ? dayTotals.activeCalories : undefined,
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
    const ready = await ensureAndroidHealthConnectReady();
    if (!ready) {
      return {};
    }

    const [dayTotals, heartRate, workout] = await Promise.all([
      readStepsAndCaloriesInRange(todayStart, endTime),
      getLatestHeartRate_android(todayStart, endTime),
      getLatestWorkout_android(workoutWindowStart, endTime),
    ]);

    const merged: WatchMetrics = {
      steps: dayTotals.ok ? dayTotals.steps : undefined,
      caloriesKcal: dayTotals.ok ? dayTotals.activeCalories : undefined,
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

/** True when the OS already granted the core health read permissions. */
async function hasGrantedHealthPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const ready = await ensureAndroidHealthConnectReady();
      if (!ready) return false;
      const granted = await hcGetGrantedPermissions();
      if (!Array.isArray(granted) || granted.length === 0) return false;
      const hasSteps = granted.some(
        (p: any) =>
          p?.accessType === 'read' &&
          (p?.recordType === 'Steps' || p?.recordType === 'steps'),
      );
      return hasSteps || granted.length > 0;
    } catch {
      return false;
    }
  }
  if (Platform.OS === 'ios') {
    // HealthKit does not expose a reliable granted-permissions list; a linked flag is authoritative.
    return false;
  }
  return false;
}

/** Set once the user completes Connect (HealthKit / Health Connect). Used to skip the CTA on next visit. */
export async function setWatchHealthLinked(linked: boolean): Promise<void> {
  if (linked) {
    await AsyncStorage.setItem(WATCH_HEALTH_LINKED_KEY, '1');
  } else {
    await AsyncStorage.removeItem(WATCH_HEALTH_LINKED_KEY);
  }
}

/**
 * Whether the user has completed Smart Watch connect on this device.
 * Auto-heals the flag when Health Connect permissions are already granted.
 */
export async function getWatchHealthLinked(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(WATCH_HEALTH_LINKED_KEY);
    if (v === '1') {
      return true;
    }
    const granted = await hasGrantedHealthPermissions();
    if (granted) {
      await setWatchHealthLinked(true);
      return true;
    }
  } catch {
    // fall through
  }
  return false;
}

/** Nested drawer target for the Watch stack based on linked state. */
export async function getWatchStackEntryRoute(): Promise<
  'WatchConnect' | 'WatchConnected'
> {
  const linked = await getWatchHealthLinked();
  return linked ? 'WatchConnected' : 'WatchConnect';
}
