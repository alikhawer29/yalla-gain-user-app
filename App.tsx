import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { ZoomVideoSdkProvider } from '@zoom/react-native-videosdk';
import messaging from '@react-native-firebase/messaging';
import { useEffect, useMemo } from 'react';
import { AppState, LogBox, StatusBar, StyleSheet } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { MenuProvider } from 'react-native-popup-menu';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AppWrapper from './src/components/AppWrapper';
import ForceLogoutListener from './src/components/ForceLogoutListener';
import NetworkLoggerFAB from './src/components/NetworkLoggerFAB';
import { ModalProvider } from './src/contexts/ModalContext';
import AppStackNavigator from './src/navigation/AppStackNavigator';
import { userApi } from './src/redux/Apis/User';
import { persistor, store } from './src/redux/Store';
import colors from './src/utils/colors';
import { ensureFirebaseMessagingReady } from './src/utils/devicePush';
import {
  flushPendingForceLogoutModal,
  handleNotificationOpenForceLogout,
} from './src/utils/forceLogout';
import { setupFcmForegroundHandlers } from './src/utils/fcmForegroundHandlers';
import { ensureForegroundPushChannels } from './src/utils/foregroundFcmNotifications';
import { navigationRef } from './src/utils/navigation';
import { STRIPE_URL_SCHEME } from './src/utils/stripe';

const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51OHpI2EN9IooQZRaU3MAJ8mKTWdFhvI7vequEoOlA9qlEOP1gdLKSB01ec6GeJkfAjHgQjipR85UligbuLBs5UaI00aoghaww7';

// Zoom Video SDK native module (harmless RN 0.82 warning).
LogBox.ignoreLogs([
  '`new NativeEventEmitter()` was called with a non-null argument',
]);

function App() {
  const zoomSdkConfig = useMemo(
    () => ({
      domain: 'zoom.us',
      enableLog: __DEV__,
    }),
    [],
  );

  useEffect(() => {
    setTimeout(() => {
      BootSplash.hide();
    }, 1000);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') {
        flushPendingForceLogoutModal();
        store.dispatch(userApi.util.invalidateTags(['Notifications']));
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const unsubOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      void handleNotificationOpenForceLogout(remoteMessage);
    });

    void messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          void handleNotificationOpenForceLogout(remoteMessage);
        }
      });

    return () => {
      unsubOpened();
    };
  }, []);

  useEffect(() => {
    let unsubFcm: (() => void) | undefined;

    (async () => {
      try {
        await ensureFirebaseMessagingReady();
        await ensureForegroundPushChannels();
        unsubFcm = setupFcmForegroundHandlers();
      } catch {
        // Push setup is best-effort; login/OTP still registers token via getDevicePushPayload.
      }
    })();

    return () => {
      unsubFcm?.();
    };
  }, []);

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.transparent,
    },
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StripeProvider
          publishableKey={STRIPE_PUBLISHABLE_KEY}
          urlScheme={STRIPE_URL_SCHEME}
        >
          <SafeAreaProvider>
            <ZoomVideoSdkProvider config={zoomSdkConfig}>
              <AppWrapper>
                <StatusBar
                  barStyle="light-content"
                  translucent={false}
                  backgroundColor={colors.primary}
                />
                <MenuProvider>
                  <ModalProvider>
                    <ForceLogoutListener />
                    <NavigationContainer ref={navigationRef} theme={navTheme}>
                      <AppStackNavigator />
                      {__DEV__ && <NetworkLoggerFAB />}
                      <Toast />
                    </NavigationContainer>
                  </ModalProvider>
                </MenuProvider>
              </AppWrapper>
            </ZoomVideoSdkProvider>
          </SafeAreaProvider>
        </StripeProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
