import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { Platform, StatusBar, StyleSheet, UIManager } from 'react-native';
import BootSplash from "react-native-bootsplash";
import { MenuProvider } from 'react-native-popup-menu';
import Toast from "react-native-toast-message";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AppWrapper from './src/components/AppWrapper';
import NetworkLoggerFAB from './src/components/NetworkLoggerFAB';
import { ModalProvider } from './src/contexts/ModalContext';
import AppStackNavigator from './src/navigation/AppStackNavigator';
import { persistor, store } from './src/redux/Store';
import colors from './src/utils/colors';
import { navigationRef } from './src/utils/navigation';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function App() {

  useEffect(() => {
    setTimeout(() => {
      BootSplash.hide();
    }, 1000)
  }, [])

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
        <AppWrapper>
          <StatusBar barStyle={'light-content'} />
          <MenuProvider>
            <ModalProvider>
              <NavigationContainer ref={navigationRef} theme={navTheme}>
                <AppStackNavigator />
                <NetworkLoggerFAB />
                <Toast />
              </NavigationContainer>
            </ModalProvider>
          </MenuProvider>
        </AppWrapper>
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
