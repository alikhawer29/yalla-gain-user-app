import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import BootSplash from "react-native-bootsplash";
import AppStackNavigator from './src/navigation/AppStackNavigator';
import { navigationRef } from './src/utils/navigation';
import colors from './src/utils/colors';

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
      background: colors.black,
    },
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      <NavigationContainer ref={navigationRef} theme={navTheme}>
        <AppStackNavigator />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
