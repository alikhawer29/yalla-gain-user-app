import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

export type DevicePushPayload = {
  device_type: 'android' | 'ios';
  device_token: string;
};

async function requestAndroidPostNotifications(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  const api = typeof Platform.Version === 'number' ? Platform.Version : 0;
  if (api < 33) {
    return;
  }
  try {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  } catch {
    // Ignore; user can enable notifications in system settings later.
  }
}

/**
 * Registers with APNs (iOS), requests notification permission (Android 13+ / iOS),
 * so FCM can issue a valid token and deliver messages.
 */
export async function ensureFirebaseMessagingReady(): Promise<void> {
  if (Platform.OS === 'ios') {
    await messaging().registerDeviceForRemoteMessages();
  }
  await requestAndroidPostNotifications();
  await messaging().requestPermission();
}

/**
 * FCM registration token + platform label for backend (login, verify-otp, etc.).
 * Requires `google-services.json` (Android) and `GoogleService-Info.plist` (iOS).
 */
export async function getDevicePushPayload(): Promise<DevicePushPayload> {
  const device_type = Platform.OS === 'ios' ? 'ios' : 'android';
  try {
    await ensureFirebaseMessagingReady();
    const device_token = (await messaging().getToken()) ?? '';
    return { device_type, device_token };
  } catch {
    return { device_type, device_token: '' };
  }
}
