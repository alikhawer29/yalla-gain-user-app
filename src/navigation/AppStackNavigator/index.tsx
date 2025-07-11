import { createStackNavigator } from '@react-navigation/stack';
import { AppStackParamList } from '../../interfaces';
import { NAVIGATORS } from '../../utils/routes';
import AuthStackNavigator from '../AuthStackNavigator';
import BottomTabNavigator from '../BottomTabNavigator';

const Stack = createStackNavigator<AppStackParamList>();

const AppStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name={NAVIGATORS.AUTH_STACK} component={AuthStackNavigator} />
            <Stack.Screen name={NAVIGATORS.BOTTOM} component={BottomTabNavigator} />
        </Stack.Navigator>
    );
}

export default AppStackNavigator