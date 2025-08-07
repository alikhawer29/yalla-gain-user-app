import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '../../hooks';
import { AppStackParamList } from '../../interfaces';
import { selectLoggedIn } from '../../redux/Slices/AuthSlice';
import { NAVIGATORS } from '../../utils/routes';
import AuthStackNavigator from '../AuthStackNavigator';
import DrawerNavigator from '../DrawerNavigator';

const Stack = createStackNavigator<AppStackParamList>();

const AppStackNavigator = () => {

    const authenticated = useAppSelector(selectLoggedIn)

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {
                authenticated ?
                    <Stack.Screen name={NAVIGATORS.DRAWER} component={DrawerNavigator} /> :
                    <Stack.Screen name={NAVIGATORS.AUTH_STACK} component={AuthStackNavigator} />
            }
        </Stack.Navigator>
    );
}

export default AppStackNavigator