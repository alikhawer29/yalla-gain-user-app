import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

/** Android channel for local notifications shown while the app is in the foreground. */
export const FOREGROUND_FCM_CHANNEL_ID = 'yallagain_fcm_default';

/**
 * Android: high-importance channel so heads-up banners can appear (must match native +
 * FCM manifest meta-data). iOS: Notifee permission for foreground presentation.
 */
export async function ensureForegroundPushChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: FOREGROUND_FCM_CHANNEL_ID,
      name: 'General',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      bypassDnd: false,
    });
    await notifee.requestPermission();
  } else {
    await notifee.requestPermission();
  }
}

/**
 * While the app is open, FCM does not show a system notification by itself.
 * We mirror title/body (and attach `data`) with a local notification.
 */
export async function displayForegroundFcmNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const n = remoteMessage.notification;
  const d = remoteMessage.data ?? {};

  const title =
    (n?.title && String(n.title)) ||
    (typeof d.title === 'string' ? d.title : '') ||
    '';
  const body =
    (n?.body && String(n.body)) ||
    (typeof d.body === 'string' ? d.body : '') ||
    '';

  if (!title.trim() && !body.trim()) {
    return;
  }

  const dataStrings: Record<string, string> = {};
  for (const [k, v] of Object.entries(d)) {
    if (v != null) {
      dataStrings[k] = String(v);
    }
  }

  const notificationId =
    remoteMessage.messageId ?? `fcm-${Date.now().toString()}`;

  await notifee.displayNotification({
    id: notificationId,
    title: title.trim() || undefined,
    body: body.trim() || undefined,
    data: dataStrings,
    android: {
      channelId: FOREGROUND_FCM_CHANNEL_ID,
      smallIcon: 'ic_notification',
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
      sound: 'default',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    },
    ios: {
      sound: 'default',
      foregroundPresentationOptions: {
        banner: true,
        list: true,
        sound: true,
        badge: true,
      },
    },
  });
}
