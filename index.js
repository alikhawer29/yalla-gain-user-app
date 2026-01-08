/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { startNetworkLogging } from 'react-native-network-logger';
import App from './App';
import { name as appName } from './app.json';

// Start network logging to monitor all API calls
startNetworkLogging({
    maxRequests: 500,
    forceEnable: true,
});

AppRegistry.registerComponent(appName, () => App);
