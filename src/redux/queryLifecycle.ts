import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Defaults for createApi — refetch on remount / focus / reconnect.
 * keepUnusedDataFor keeps last payload briefly so UI stays smooth (stale-while-revalidate)
 * instead of blank loaders every visit.
 */
export const queryRefetchDefaults = {
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 60,
} as const;

type FocusHandler = () => void;

let triggerFocus: FocusHandler | null = null;
let navigationFocusTimer: ReturnType<typeof setTimeout> | null = null;

const NAV_FOCUS_DEBOUNCE_MS = 320;

/**
 * Wire RTK Query focus/reconnect to React Native AppState.
 * Web `window` focus does not apply in RN — without this, refetchOnFocus is a no-op.
 */
export function setupReactNativeQueryListeners(
  dispatch: ThunkDispatch<any, any, UnknownAction>,
): () => void {
  return setupListeners(dispatch, (storeDispatch, { onFocus, onFocusLost }) => {
    triggerFocus = () => {
      storeDispatch(onFocus());
    };

    const onAppStateChange = (next: AppStateStatus) => {
      if (next === 'active') {
        storeDispatch(onFocus());
      } else {
        storeDispatch(onFocusLost());
      }
    };

    const sub = AppState.addEventListener('change', onAppStateChange);

    if (AppState.currentState === 'active') {
      storeDispatch(onFocus());
    }

    return () => {
      sub.remove();
      triggerFocus = null;
    };
  });
}

/**
 * Call from NavigationContainer.onStateChange so every screen visit
 * refetches active RTK Query subscriptions (debounced to avoid bursts).
 */
export function notifyNavigationQueryFocus(): void {
  if (navigationFocusTimer) {
    clearTimeout(navigationFocusTimer);
  }
  navigationFocusTimer = setTimeout(() => {
    navigationFocusTimer = null;
    triggerFocus?.();
  }, NAV_FOCUS_DEBOUNCE_MS);
}
