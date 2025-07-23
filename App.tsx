import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import BootSplash from "react-native-bootsplash";
import { MenuProvider } from 'react-native-popup-menu';
import { Provider } from 'react-redux';
import AppWrapper from './src/components/AppWrapper';
import AppStackNavigator from './src/navigation/AppStackNavigator';
import { persistor, store } from './src/redux/Store';
import colors from './src/utils/colors';
import { navigationRef } from './src/utils/navigation';
import { PersistGate } from 'redux-persist/integration/react';

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
            <NavigationContainer ref={navigationRef} theme={navTheme}>
              <AppStackNavigator />
            </NavigationContainer>
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
