import AsyncStorage from '@react-native-async-storage/async-storage';

export const ZOOM_SESSION_ACTIVE_KEY = 'yallagain_zoom_session_active';
export const ZOOM_RELOAD_RECOVERY_KEY = 'yallagain_zoom_reload_recovery';

export async function markZoomSessionActive(): Promise<void> {
  await AsyncStorage.setItem(ZOOM_SESSION_ACTIVE_KEY, '1');
}

export async function markZoomReloadRecovery(): Promise<void> {
  await AsyncStorage.setItem(ZOOM_RELOAD_RECOVERY_KEY, '1');
}

export async function clearZoomSessionFlags(): Promise<void> {
  await AsyncStorage.multiRemove([ZOOM_SESSION_ACTIVE_KEY, ZOOM_RELOAD_RECOVERY_KEY]);
}

export async function clearZoomSessionActive(): Promise<void> {
  await clearZoomSessionFlags();
}

export async function wasZoomSessionActive(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ZOOM_SESSION_ACTIVE_KEY);
  return value === '1';
}

export async function needsZoomReloadRecovery(): Promise<boolean> {
  const [active, reload] = await AsyncStorage.multiGet([
    ZOOM_SESSION_ACTIVE_KEY,
    ZOOM_RELOAD_RECOVERY_KEY,
  ]);
  return active[1] === '1' || reload[1] === '1';
}
