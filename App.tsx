import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { Platform, StatusBar, StyleSheet, UIManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import { MenuProvider } from 'react-native-popup-menu';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StripeProvider } from '@stripe/stripe-react-native';
import AppWrapper from './src/components/AppWrapper';
import NetworkLoggerFAB from './src/components/NetworkLoggerFAB';
import { ModalProvider } from './src/contexts/ModalContext';
import AppStackNavigator from './src/navigation/AppStackNavigator';
import { persistor, store } from './src/redux/Store';
import colors from './src/utils/colors';
import { navigationRef } from './src/utils/navigation';

const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51JVZEtHOTfIICq62kKsm6o2pYVhJUXPXViO9m2hrXqw6vKRwC4RzL3GYiWF9LKax8JORdQpZKrxeNx02wwONOMuO00H8CpMfRf';



function App() {
  useEffect(() => {
    setTimeout(() => {
      BootSplash.hide();
    }, 1000);
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
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <SafeAreaProvider>
            <AppWrapper>
              <StatusBar
                barStyle="light-content"
                translucent={false}
                backgroundColor={colors.primary}
              />
              <MenuProvider>
                <ModalProvider>
                  <NavigationContainer ref={navigationRef} theme={navTheme}>
                    <AppStackNavigator />
                    {/* <NetworkLoggerFAB 
                    /> */}
                    <Toast />
                  </NavigationContainer>
                </ModalProvider>
              </MenuProvider>
            </AppWrapper>
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
