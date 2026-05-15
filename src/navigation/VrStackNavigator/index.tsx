import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import VrConnect from '../../screens/VrConnect';
import { ROUTES } from '../../utils/routes';

const Stack = createStackNavigator<RootStackParamList>();

const VrStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.VR_CONNECT} component={VrConnect} />
    </Stack.Navigator>
  );
};

export default VrStackNavigator;
