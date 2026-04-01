import { Platform } from 'react-native';
import AppleHealthKit from 'react-native-health';
import {
  initialize as hcInitialize,
  requestPermission as hcRequestPermission,
  readRecords as hcReadRecords,
  getSdkStatus as hcGetSdkStatus,
  openHealthConnectSettings,
} from 'react-native-health-connect';

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
  workoutDurationSec?: number;
  workoutTotalDurationSec?: number;
};

const startOfTodayIso = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const nowIso = () => new Date().toISOString();

export async function getHealthPermissionState(): Promise<HealthPermissionState> {
  if (Platform.OS === 'ios') {
    return { status: 'ready' };
  }

  if (Platform.OS === 'android') {
    // 0 = unavailable, 1 = available, 2 = update_required (library-specific); treat non-available as needs install.
    try {
      const sdkStatus = await hcGetSdkStatus();
      if (sdkStatus === 0) {
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
    const permissions = {
      permissions: {
        read: [
          (AppleHealthKit as any).Constants.Permissions.StepCount,
          (AppleHealthKit as any).Constants.Permissions.HeartRate,
          (AppleHealthKit as any).Constants.Permissions.ActiveEnergyBurned,
          (AppleHealthKit as any).Constants.Permissions.Workout,
        ],
        write: [],
      },
    };

    return await new Promise<boolean>((resolve) => {
      (AppleHealthKit as any).initHealthKit(permissions, (err: string) => {
        resolve(!err);
      });
    });
  }

  if (Platform.OS === 'android') {
    const ok = await hcInitialize();
    if (!ok) return false;

    const granted = await hcRequestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'HeartRate' },
      { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
      { accessType: 'read', recordType: 'ExerciseSession' },
    ]);

    return Array.isArray(granted) && granted.length > 0;
  }

  return false;
}

export async function getMetrics(): Promise<WatchMetrics> {
  const startTime = startOfTodayIso();
  const endTime = nowIso();

  if (Platform.OS === 'ios') {
    const [steps, caloriesKcal, heartRate, workout] = await Promise.all([
      getTodaySteps_ios(startTime, endTime),
      getTodayActiveCalories_ios(startTime, endTime),
      getLatestHeartRate_ios(startTime, endTime),
      getLatestWorkout_ios(startTime, endTime),
    ]);

    return {
      steps: steps ?? undefined,
      caloriesKcal: caloriesKcal ?? undefined,
      heartRateBpm: heartRate?.bpm,
      heartRateAt: heartRate?.at,
      workoutDurationSec: workout?.durationSec,
      workoutTotalDurationSec: workout?.totalDurationSec,
    };
  }

  if (Platform.OS === 'android') {
    const [steps, caloriesKcal, heartRate, workout] = await Promise.all([
      getTodaySteps_android(startTime, endTime),
      getTodayActiveCalories_android(startTime, endTime),
      getLatestHeartRate_android(startTime, endTime),
      getLatestWorkout_android(startTime, endTime),
    ]);

    return {
      steps: steps ?? undefined,
      caloriesKcal: caloriesKcal ?? undefined,
      heartRateBpm: heartRate?.bpm,
      heartRateAt: heartRate?.at,
      workoutDurationSec: workout?.durationSec,
      workoutTotalDurationSec: workout?.totalDurationSec,
    };
  }

  return {};
}

async function getTodaySteps_ios(
  startDate: string,
  endDate: string,
): Promise<number | null> {
  return await new Promise((resolve) => {
    (AppleHealthKit as any).getStepCount(
      { startDate, endDate },
      (err: string, results: { value?: number }) => {
        if (err) return resolve(null);
        resolve(typeof results?.value === 'number' ? results.value : null);
      },
    );
  });
}

async function getTodayActiveCalories_ios(
  startDate: string,
  endDate: string,
): Promise<number | null> {
  return await new Promise((resolve) => {
    (AppleHealthKit as any).getActiveEnergyBurned(
      { startDate, endDate, unit: 'kilocalorie' },
      (err: string, results: Array<{ value?: number }>) => {
        if (err) return resolve(null);
        const sum = Array.isArray(results)
          ? results.reduce((acc, r) => acc + (typeof r?.value === 'number' ? r.value : 0), 0)
          : 0;
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
    (AppleHealthKit as any).getHeartRateSamples(
      { startDate, endDate, limit: 1, ascending: false },
      (err: string, results: Array<{ value?: number; startDate?: string }>) => {
        if (err) return resolve(null);
        const sample = Array.isArray(results) ? results[0] : undefined;
        if (!sample || typeof sample.value !== 'number') return resolve(null);
        resolve({ bpm: sample.value, at: sample.startDate || endDate });
      },
    );
  });
}

async function getLatestWorkout_ios(
  startDate: string,
  endDate: string,
): Promise<{ durationSec: number; totalDurationSec: number } | null> {
  return await new Promise((resolve) => {
    (AppleHealthKit as any).getSamples(
      { startDate, endDate, type: 'Workout', limit: 1, ascending: false },
      (err: string, results: Array<{ duration?: number }>) => {
        if (err) return resolve(null);
        const w = Array.isArray(results) ? results[0] : undefined;
        if (!w || typeof w.duration !== 'number') return resolve(null);
        resolve({ durationSec: w.duration, totalDurationSec: 20 * 60 });
      },
    );
  });
}

async function getTodaySteps_android(
  startTime: string,
  endTime: string,
): Promise<number | null> {
  const res: any = await hcReadRecords('Steps', {
    timeRangeFilter: { operator: 'between', startTime, endTime },
  } as any);
  const items = res?.records || res?.result || [];
  if (!Array.isArray(items)) return null;
  const sum = items.reduce((acc, r) => acc + (typeof r?.count === 'number' ? r.count : 0), 0);
  return sum > 0 ? sum : null;
}

async function getTodayActiveCalories_android(
  startTime: string,
  endTime: string,
): Promise<number | null> {
  const res: any = await hcReadRecords('ActiveCaloriesBurned', {
    timeRangeFilter: { operator: 'between', startTime, endTime },
  } as any);
  const items = res?.records || res?.result || [];
  if (!Array.isArray(items)) return null;
  const sum = items.reduce((acc, r) => {
    const kcal = r?.energy?.inKilocalories;
    return acc + (typeof kcal === 'number' ? kcal : 0);
  }, 0);
  return sum > 0 ? sum : null;
}

async function getLatestHeartRate_android(
  startTime: string,
  endTime: string,
): Promise<{ bpm: number; at: string } | null> {
  const res: any = await hcReadRecords('HeartRate', {
    timeRangeFilter: { operator: 'between', startTime, endTime },
    pageSize: 1,
  } as any);
  const items = res?.records || res?.result || [];
  if (!Array.isArray(items) || items.length === 0) return null;
  const rec = items[0];
  const samples = Array.isArray(rec?.samples) ? rec.samples : [];
  const last = samples.length ? samples[samples.length - 1] : null;
  const bpm = last?.beatsPerMinute;
  const at = last?.time || rec?.endTime || rec?.startTime || endTime;
  if (typeof bpm !== 'number') return null;
  return { bpm, at };
}

async function getLatestWorkout_android(
  startTime: string,
  endTime: string,
): Promise<{ durationSec: number; totalDurationSec: number } | null> {
  const res: any = await hcReadRecords('ExerciseSession', {
    timeRangeFilter: { operator: 'between', startTime, endTime },
    pageSize: 1,
  } as any);
  const items = res?.records || res?.result || [];
  if (!Array.isArray(items) || items.length === 0) return null;
  const rec = items[0];
  const s = Date.parse(rec?.startTime);
  const e = Date.parse(rec?.endTime);
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return null;
  const durationSec = Math.floor((e - s) / 1000);
  return { durationSec, totalDurationSec: 20 * 60 };
}

