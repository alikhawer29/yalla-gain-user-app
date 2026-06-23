/**
 * @format
 */

import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import { startNetworkLogging } from 'react-native-network-logger';
import App from './App';
import { name as appName } from './app.json';
import { userApi } from './src/redux/Apis/User';
import { store } from './src/redux/Store';
import { handleBackgroundFcmMessage } from './src/utils/forceLogout';

// Required by @react-native-firebase/messaging (module scope).
messaging().setBackgroundMessageHandler(async remoteMessage => {
  const handled = await handleBackgroundFcmMessage(remoteMessage);
  if (!handled) {
    store.dispatch(userApi.util.invalidateTags(['Notifications']));
  }
});

// Start network logging to monitor all API calls
startNetworkLogging({
    maxRequests: 500,
    forceEnable: true,
});

AppRegistry.registerComponent(appName, () => App);
