import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { userApi } from '../redux/Apis/User';
import { store } from '../redux/Store';
import { handleForegroundFcmMessage, handleNotificationOpenForceLogout } from './forceLogout';
import { displayForegroundFcmNotification } from './foregroundFcmNotifications';
import {
  flushPendingNotificationDeepLink,
  handleNotificationOpen,
  normalizeNotificationData,
} from './notificationDeepLink';

const CONSULTATION_TAGS = ['Notifications', 'Bookings', 'Consultants'] as const;

function invalidateOnPush(): void {
  store.dispatch(userApi.util.invalidateTags([...CONSULTATION_TAGS]));
}

async function onRemoteOpen(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null,
): Promise<void> {
  if (!remoteMessage) return;

  const forceHandled = await handleNotificationOpenForceLogout(remoteMessage);
  if (forceHandled) return;

  invalidateOnPush();
  handleNotificationOpen(
    normalizeNotificationData(
      remoteMessage.data as Record<string, unknown> | undefined,
    ),
  );
}

/**
 * Foreground FCM + Notifee press + background/quit opens.
 * Call once after app mount; returns cleanup.
 */
export function setupPushNotificationHandlers(): () => void {
  const unsubMessage = messaging().onMessage(async remoteMessage => {
    const handled = await handleForegroundFcmMessage(remoteMessage);
    if (handled) return;

    invalidateOnPush();
    try {
      await displayForegroundFcmNotification(remoteMessage);
    } catch {
      // Non-fatal
    }
  });

  const unsubOpened = messaging().onNotificationOpenedApp(remoteMessage => {
    void onRemoteOpen(remoteMessage);
  });

  void messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      void onRemoteOpen(remoteMessage);
    })
    .catch(() => {});

  const unsubNotifeeFg = notifee.onForegroundEvent(({ type, detail }) => {
    if (type !== EventType.PRESS) return;
    handleNotificationOpen(
      normalizeNotificationData(detail.notification?.data),
    );
  });

  void notifee
    .getInitialNotification()
    .then(initial => {
      if (initial?.notification?.data) {
        handleNotificationOpen(
          normalizeNotificationData(initial.notification.data),
        );
      }
    })
    .catch(() => {});

  // In case nav mounts after a queued open.
  flushPendingNotificationDeepLink();

  return () => {
    unsubMessage();
    unsubOpened();
    unsubNotifeeFg();
  };
}
