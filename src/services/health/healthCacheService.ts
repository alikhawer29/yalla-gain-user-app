import AsyncStorage from '@react-native-async-storage/async-storage';

/** AsyncStorage key for persisted daily health totals. */
export const HEALTH_CACHE_KEY = '@health_cache';

/** Shape stored under {@link HEALTH_CACHE_KEY}. */
export interface HealthCachePayload {
  steps: number;
  activeCalories: number;
  cachedAt: string;
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
    };
  } catch {
    return null;
  }
}
