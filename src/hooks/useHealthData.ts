import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/Store';
import { selectUser } from '../redux/Slices/AuthSlice';
import { getLatestHealth, postHealthSnapshot } from '../services/health/healthApiService';
import {
  clearHealthCache,
  isHealthCacheForDate,
  readHealthCache,
  writeHealthCache,
} from '../services/health/healthCacheService';
import {
  formatLocalYyyyMmDd,
  readTodayHealthFromNative,
} from '../services/health/healthService';
import {
  formatYmdInTimezone,
  msUntilNextMidnight,
  resolveUserTimezone,
} from '../utils/timezone';

export type HealthDataSource = 'live' | 'cache' | 'backend' | null;

export interface UseHealthDataResult {
  steps: number;
  activeCalories: number;
  loading: boolean;
  lastUpdated: Date | null;
  source: HealthDataSource;
}

let lastPostedSteps = 0;
let lastPostedCalories = 0;
let lastPostedAt: Date | null = null;
/** Calendar day (`YYYY-MM-DD`) of the last successful POST — reset on day rollover. */
let lastPostedDate: string | null = null;

/**
 * Throttled POST gate for 30s foreground polling (not used for AppState/mount).
 * Matches product rules: value change plus 15-minute minimum between non-forced posts.
 * @param steps Current displayed step total.
 * @param calories Current displayed active calorie total (kcal).
 * @param forcePost Reserved for API parity with the spec; interval calls pass `false`.
 * @param todayYmd Current calendar day in the user timezone.
 */
const shouldPost = (
  steps: number,
  calories: number,
  forcePost: boolean,
  todayYmd: string,
): boolean => {
  if (forcePost) {
    return true;
  }
  if (lastPostedDate && lastPostedDate !== todayYmd) {
    return true;
  }
  if (steps === lastPostedSteps && calories === lastPostedCalories) {
    return false;
  }
  if (lastPostedAt && Date.now() - lastPostedAt.getTime() < 15 * 60 * 1000) {
    return false;
  }
  return true;
};

const POLL_MS = 30 * 1000;

type SyncKind = 'mount' | 'appstate' | 'interval' | 'dayroll';

interface ResolvedRead {
  steps: number;
  activeCalories: number;
  source: HealthDataSource;
  nativeOk: boolean;
}

function resetPostGateForNewDay(): void {
  lastPostedSteps = 0;
  lastPostedCalories = 0;
  lastPostedAt = null;
  lastPostedDate = null;
}

/**
 * Resolves steps and calories for *today* (user TZ): native → today cache → today backend.
 * Never surfaces yesterday's totals after day end.
 */
async function resolveHealthDisplay(timeZone: string): Promise<ResolvedRead> {
  const todayYmd = formatYmdInTimezone(new Date(), timeZone);
  let nativeOk = false;
  try {
    const native = await readTodayHealthFromNative(new Date(), timeZone);
    if (native.ok) {
      nativeOk = true;
      // Trust native for today including zeros after midnight (day refresh).
      const steps = native.steps;
      const activeCalories = native.activeCalories;
      await writeHealthCache({
        steps,
        activeCalories,
        cachedAt: new Date().toISOString(),
        date: todayYmd,
      });
      return {
        steps,
        activeCalories,
        source: 'live',
        nativeOk: true,
      };
    }

    const cache = await readHealthCache();
    if (cache && isHealthCacheForDate(cache, todayYmd, timeZone)) {
      return {
        steps: cache.steps,
        activeCalories: cache.activeCalories,
        source: 'cache',
        nativeOk,
      };
    }
    if (cache) {
      await clearHealthCache();
    }

    const latest = await getLatestHealth();
    if (latest && latest.date === todayYmd) {
      return {
        steps: latest.steps,
        activeCalories: latest.active_calories,
        source: 'backend',
        nativeOk,
      };
    }

    return {
      steps: 0,
      activeCalories: 0,
      source: null,
      nativeOk,
    };
  } catch {
    return {
      steps: 0,
      activeCalories: 0,
      source: null,
      nativeOk: false,
    };
  }
}

function recordPostSuccess(
  steps: number,
  activeCalories: number,
  todayYmd: string,
): void {
  lastPostedSteps = steps;
  lastPostedCalories = activeCalories;
  lastPostedAt = new Date();
  lastPostedDate = todayYmd;
}

/**
 * Live watch-backed steps and active calories with cache/backend fallback and throttled sync.
 * Totals reset at day end in the user's timezone.
 */
export function useHealthData(): UseHealthDataResult {
  const user = useSelector((state: RootState) => selectUser(state));
  const timeZone = resolveUserTimezone(
    typeof user?.timezone === 'string' ? user.timezone : null,
  );

  const [steps, setSteps] = useState(0);
  const [activeCalories, setActiveCalories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<HealthDataSource>(null);

  const firstLoadRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeDayRef = useRef<string>(formatYmdInTimezone(new Date(), timeZone));
  const timeZoneRef = useRef(timeZone);
  timeZoneRef.current = timeZone;

  const clearPoll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearDayTimer = useCallback(() => {
    if (dayTimerRef.current) {
      clearTimeout(dayTimerRef.current);
      dayTimerRef.current = null;
    }
  }, []);

  const maybePostSnapshot = useCallback(
    async (kind: SyncKind, resolved: ResolvedRead, tz: string) => {
      try {
        const todayYmd = formatLocalYyyyMmDd(new Date(), tz);
        if (lastPostedDate && lastPostedDate !== todayYmd) {
          resetPostGateForNewDay();
        }
        const { steps: s, activeCalories: c, nativeOk } = resolved;
        let shouldSend = false;
        if (kind === 'mount' || kind === 'dayroll') {
          shouldSend = nativeOk;
        } else if (kind === 'appstate') {
          shouldSend = true;
        } else {
          shouldSend = nativeOk && shouldPost(s, c, false, todayYmd);
        }
        if (!shouldSend) {
          return;
        }
        const data = await postHealthSnapshot({
          date: todayYmd,
          steps: s,
          active_calories: c,
        });
        if (data) {
          recordPostSuccess(s, c, todayYmd);
        }
      } catch {
        // Silent: never surface sync errors.
      }
    },
    [],
  );

  const runReadCycle = useCallback(
    async (kind: SyncKind) => {
      try {
        const tz = timeZoneRef.current;
        const todayYmd = formatYmdInTimezone(new Date(), tz);
        let syncKind = kind;
        if (activeDayRef.current !== todayYmd) {
          activeDayRef.current = todayYmd;
          resetPostGateForNewDay();
          await clearHealthCache();
          if (kind === 'interval' || kind === 'appstate') {
            syncKind = 'dayroll';
          }
        }

        const resolved = await resolveHealthDisplay(tz);
        setSteps(resolved.steps);
        setActiveCalories(resolved.activeCalories);
        setSource(resolved.source);
        setLastUpdated(new Date());

        if (firstLoadRef.current) {
          firstLoadRef.current = false;
          setLoading(false);
        }

        await maybePostSnapshot(syncKind, resolved, tz);
      } catch {
        if (firstLoadRef.current) {
          firstLoadRef.current = false;
          setLoading(false);
        }
      }
    },
    [maybePostSnapshot],
  );

  const startPollIfActive = useCallback(() => {
    clearPoll();
    if (AppState.currentState !== 'active') {
      return;
    }
    intervalRef.current = setInterval(() => {
      void runReadCycle('interval');
    }, POLL_MS);
  }, [clearPoll, runReadCycle]);

  const scheduleDayEndRefresh = useCallback(() => {
    clearDayTimer();
    const delay = msUntilNextMidnight(timeZoneRef.current);
    dayTimerRef.current = setTimeout(() => {
      void runReadCycle('dayroll').then(() => {
        scheduleDayEndRefresh();
      });
    }, delay);
  }, [clearDayTimer, runReadCycle]);

  useEffect(() => {
    activeDayRef.current = formatYmdInTimezone(new Date(), timeZone);
    void runReadCycle('mount');
    startPollIfActive();
    scheduleDayEndRefresh();

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next !== 'active') {
        clearPoll();
      }
      if (next === 'active') {
        void runReadCycle('appstate');
        startPollIfActive();
        scheduleDayEndRefresh();
      } else if (next === 'background') {
        void runReadCycle('appstate');
      }
    });

    return () => {
      sub.remove();
      clearPoll();
      clearDayTimer();
    };
  }, [
    clearDayTimer,
    clearPoll,
    runReadCycle,
    scheduleDayEndRefresh,
    startPollIfActive,
    timeZone,
  ]);

  return {
    steps,
    activeCalories,
    loading,
    lastUpdated,
    source,
  };
}
