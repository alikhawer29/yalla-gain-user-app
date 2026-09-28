import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatYmdInTimezone } from '../../utils/timezone';

/** AsyncStorage key for persisted daily health totals. */
export const HEALTH_CACHE_KEY = '@health_cache';

/** Shape stored under {@link HEALTH_CACHE_KEY}. */
export interface HealthCachePayload {
  steps: number;
  activeCalories: number;
  cachedAt: string;
  /** Calendar day `YYYY-MM-DD` in the user's timezone when this cache was written. */
  date?: string;
}

/**
 * Persists the latest successful live health totals to local storage.
 * @param payload Steps, active calories, and cache timestamp (ISO-8601).
 */
export async function writeHealthCache(
  payload: HealthCachePayload,
): Promise<void> {
  try {
    await AsyncStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Silent: cache failures must not break the app.
  }
}

/**
 * Removes the persisted health cache (e.g. after calendar day rollover).
 */
export async function clearHealthCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HEALTH_CACHE_KEY);
  } catch {
    // Silent.
  }
}

/**
 * True when the cache belongs to `todayYmd` in the user's timezone.
 * Falls back to deriving the day from `cachedAt` for older payloads without `date`.
 */
export function isHealthCacheForDate(
  cache: HealthCachePayload,
  todayYmd: string,
  timeZone?: string | null,
): boolean {
  if (typeof cache.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(cache.date)) {
    return cache.date === todayYmd;
  }
  try {
    const cachedDay = formatYmdInTimezone(new Date(cache.cachedAt), timeZone);
    return cachedDay === todayYmd;
  } catch {
    return false;
  }
}

/**
 * Loads the last cached health totals from local storage.
 * @returns Parsed cache or `null` if missing, invalid JSON, or read error.
 */
export async function readHealthCache(): Promise<HealthCachePayload | null> {
  try {
    const raw = await AsyncStorage.getItem(HEALTH_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<HealthCachePayload>;
    if (
      typeof parsed?.steps !== 'number' ||
      typeof parsed?.activeCalories !== 'number' ||
      typeof parsed?.cachedAt !== 'string'
    ) {
      return null;
    }
    return {
      steps: parsed.steps,
      activeCalories: parsed.activeCalories,
      cachedAt: parsed.cachedAt,
      date: typeof parsed.date === 'string' ? parsed.date : undefined,
    };
  } catch {
    return null;
  }
}
