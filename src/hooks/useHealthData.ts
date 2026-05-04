import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getLatestHealth, postHealthSnapshot } from '../services/health/healthApiService';
import { readHealthCache, writeHealthCache } from '../services/health/healthCacheService';
import {
  formatLocalYyyyMmDd,
  readTodayHealthFromNative,
} from '../services/health/healthService';

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

/**
 * Throttled POST gate for 30s foreground polling (not used for AppState/mount).
 * Matches product rules: value change plus 15-minute minimum between non-forced posts.
 * @param steps Current displayed step total.
 * @param calories Current displayed active calorie total (kcal).
 * @param forcePost Reserved for API parity with the spec; interval calls pass `false`.
 */
const shouldPost = (
  steps: number,
  calories: number,
  forcePost: boolean,
): boolean => {
  if (forcePost) {
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

type SyncKind = 'mount' | 'appstate' | 'interval';

interface ResolvedRead {
  steps: number;
  activeCalories: number;
  source: HealthDataSource;
  nativeOk: boolean;
}

/**
 * Resolves steps and calories: native → cache → backend GET, never throws.
 */
async function resolveHealthDisplay(): Promise<ResolvedRead> {
  let nativeOk = false;
  try {
    const native = await readTodayHealthFromNative();
    if (native.ok) {
      nativeOk = true;
      if (native.steps > 0 || native.activeCalories > 0) {
        const steps = native.steps;
        const activeCalories = native.activeCalories;
        await writeHealthCache({
          steps,
          activeCalories,
          cachedAt: new Date().toISOString(),
        });
        return {
          steps,
          activeCalories,
          source: 'live',
          nativeOk: true,
        };
      }
    }

    const cache = await readHealthCache();
    if (cache && (cache.steps > 0 || cache.activeCalories > 0)) {
      return {
        steps: cache.steps,
        activeCalories: cache.activeCalories,
        source: 'cache',
        nativeOk,
      };
    }

    const latest = await getLatestHealth();
    if (latest && (latest.steps > 0 || latest.active_calories > 0)) {
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

function recordPostSuccess(steps: number, activeCalories: number): void {
  lastPostedSteps = steps;
  lastPostedCalories = activeCalories;
  lastPostedAt = new Date();
}

/**
 * Live watch-backed steps and active calories with cache/backend fallback and throttled sync.
 */
export function useHealthData(): UseHealthDataResult {
  const [steps, setSteps] = useState(0);
  const [activeCalories, setActiveCalories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<HealthDataSource>(null);

  const firstLoadRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const maybePostSnapshot = useCallback(
    async (kind: SyncKind, resolved: ResolvedRead) => {
      try {
        const { steps: s, activeCalories: c, nativeOk } = resolved;
        let shouldSend = false;
        if (kind === 'mount') {
          shouldSend = nativeOk;
        } else if (kind === 'appstate') {
          shouldSend = true;
        } else {
          shouldSend =
            nativeOk && shouldPost(s, c, false);
        }
        if (!shouldSend) {
          return;
        }
        const data = await postHealthSnapshot({
          date: formatLocalYyyyMmDd(),
          steps: s,
          active_calories: c,
        });
        if (data) {
          recordPostSuccess(s, c);
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
        const resolved = await resolveHealthDisplay();
        setSteps(resolved.steps);
        setActiveCalories(resolved.activeCalories);
        setSource(resolved.source);
        setLastUpdated(new Date());

        if (firstLoadRef.current) {
          firstLoadRef.current = false;
          setLoading(false);
        }

        await maybePostSnapshot(kind, resolved);
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

  useEffect(() => {
    void runReadCycle('mount');
    startPollIfActive();

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next !== 'active') {
        clearPoll();
      }
      if (next === 'active') {
        void runReadCycle('appstate');
        startPollIfActive();
      } else if (next === 'background') {
        void runReadCycle('appstate');
      }
    });

    return () => {
      sub.remove();
      clearPoll();
    };
  }, [clearPoll, runReadCycle, startPollIfActive]);

  return {
    steps,
    activeCalories,
    loading,
    lastUpdated,
    source,
  };
}
