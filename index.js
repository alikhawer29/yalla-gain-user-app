/**
 * @format
 */

import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import { startNetworkLogging } from 'react-native-network-logger';
import App from './App';
import { name as appName } from './app.json';
import { userApi } from './src/redux/Apis/User';
import { store } from './src/redux/Store';
import { handleBackgroundFcmMessage } from './src/utils/forceLogout';
import {
  handleNotificationOpen,
  normalizeNotificationData,
} from './src/utils/notificationDeepLink';

// Required by @react-native-firebase/messaging (module scope).
messaging().setBackgroundMessageHandler(async remoteMessage => {
  const handled = await handleBackgroundFcmMessage(remoteMessage);
  if (!handled) {
    store.dispatch(userApi.util.invalidateTags(['Notifications']));
  }
});

// Notifee press while app is backgrounded (foreground-mirrored local notifications).
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type !== EventType.PRESS) return;
  handleNotificationOpen(
    normalizeNotificationData(detail.notification?.data),
  );
});

// Start network logging to monitor all API calls
startNetworkLogging({
    maxRequests: 500,
    forceEnable: true,
});

AppRegistry.registerComponent(appName, () => App);
