import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from '../../interfaces';
import WatchConnect from '../../screens/Watch/Connect';
import WatchConnected from '../../screens/Watch/Connected';
import { getWatchStackEntryRoute } from '../../services/health/healthProvider';
import colors from '../../utils/colors';
import { ROUTES } from '../../utils/routes';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Smart Watch stack. Initial route comes from persisted link state so Connected
 * is restored after Connect without asking for permissions again.
 */
const WatchStackNavigator = () => {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<
    typeof ROUTES.WATCH_CONNECT | typeof ROUTES.WATCH_CONNECTED
  >(ROUTES.WATCH_CONNECT);

  useEffect(() => {
    let cancelled = false;
    void getWatchStackEntryRoute().then(route => {
      if (!cancelled) {
        setInitialRoute(
          route === 'WatchConnected'
            ? ROUTES.WATCH_CONNECTED
            : ROUTES.WATCH_CONNECT,
        );
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.blackish_gray,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name={ROUTES.WATCH_CONNECT} component={WatchConnect} />
      <Stack.Screen name={ROUTES.WATCH_CONNECTED} component={WatchConnected} />
    </Stack.Navigator>
  );
};

export default WatchStackNavigator;
