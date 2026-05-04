import { API_USER_BASE_URL } from '../../utils/data';
import { store } from '../../redux/Store';
import type { RootState } from '../../redux/Store';

/** Snapshot POST body expected by `/api/health/snapshot`. */
export interface HealthSnapshotRequestBody {
  date: string;
  steps: number;
  active_calories: number;
}

/** Normalized row returned from the health API. */
export interface HealthApiDataRow {
  date: string;
  steps: number;
  active_calories: number;
  last_synced_at: string;
}

interface SnapshotApiResponse {
  success: boolean;
  data?: HealthApiDataRow;
}

interface LatestApiResponse {
  success: boolean;
  data: HealthApiDataRow | null;
}

/**
 * Reads the current auth bearer token from the Redux store.
 * @returns JWT / access token or `null` if logged out.
 */
export function getAuthToken(): string | null {
  try {
    return (store.getState() as RootState).auth.token;
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * POSTs a daily health snapshot to the backend.
 * @param body Today's date and totals (`active_calories` in kcal).
 * @returns Parsed `data` on success, or `null` on network/parse failure.
 */
export async function postHealthSnapshot(
  body: HealthSnapshotRequestBody,
): Promise<HealthApiDataRow | null> {
  try {
    const res = await fetch(`${API_USER_BASE_URL}health/snapshot`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as SnapshotApiResponse;
    if (!json?.success || !json.data) {
      return null;
    }
    return json.data;
  } catch {
    return null;
  }
}

/**
 * GETs the most recently synced health snapshot from the backend.
 * @returns `data` from the API, or `null` if empty/error.
 */
export async function getLatestHealth(): Promise<HealthApiDataRow | null> {
  try {
    const res = await fetch(`${API_USER_BASE_URL}health/latest`, {
      method: 'GET',
      headers: authHeaders(),
    });
    const json = (await res.json()) as LatestApiResponse;
    if (!json?.success) {
      return null;
    }
    return json.data ?? null;
  } catch {
    return null;
  }
}
