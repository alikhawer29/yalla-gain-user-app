import messaging from '@react-native-firebase/messaging';
import { userApi } from '../redux/Apis/User';
import { store } from '../redux/Store';
import { displayForegroundFcmNotification } from './foregroundFcmNotifications';

/**
 * Foreground FCM: refresh unread state for the header bell + show tray via Notifee.
 */
export function setupFcmForegroundHandlers(): () => void {
  return messaging().onMessage(async remoteMessage => {
    store.dispatch(userApi.util.invalidateTags(['Notifications']));
    try {
      await displayForegroundFcmNotification(remoteMessage);
    } catch {
      // Non-fatal; channel/permission are set at app start.
    }
  });
}
