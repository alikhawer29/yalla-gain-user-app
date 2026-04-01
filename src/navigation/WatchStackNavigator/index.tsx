import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import WatchConnect from '../../screens/Watch/Connect';
import WatchConnected from '../../screens/Watch/Connected';
import { ROUTES } from '../../utils/routes';

const Stack = createStackNavigator<RootStackParamList>();

const WatchStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.WATCH_CONNECT} component={WatchConnect} />
      <Stack.Screen name={ROUTES.WATCH_CONNECTED} component={WatchConnected} />
    </Stack.Navigator>
  );
};

export default WatchStackNavigator;

