import messaging from '@react-native-firebase/messaging';
import { userApi } from '../redux/Apis/User';
import { store } from '../redux/Store';
import { handleForegroundFcmMessage } from './forceLogout';
import { displayForegroundFcmNotification } from './foregroundFcmNotifications';

/**
 * Foreground FCM: force-logout, refresh unread state, show tray via Notifee.
 */
export function setupFcmForegroundHandlers(): () => void {
  return messaging().onMessage(async remoteMessage => {
    const handled = await handleForegroundFcmMessage(remoteMessage);
    if (handled) return;

    store.dispatch(userApi.util.invalidateTags(['Notifications']));
    try {
      await displayForegroundFcmNotification(remoteMessage);
    } catch {
      // Non-fatal; channel/permission are set at app start.
    }
  });
}
