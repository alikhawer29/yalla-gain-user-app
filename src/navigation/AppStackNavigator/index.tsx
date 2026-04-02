import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '../../hooks';
import { AppStackParamList } from '../../interfaces';
import { selectLoggedIn } from '../../redux/Slices/AuthSlice';
import Chatbot from '../../screens/Chatbot';
import GoGuide from '../../screens/GoGuide';
import { NAVIGATORS, ROUTES } from '../../utils/routes';
import AuthStackNavigator from '../AuthStackNavigator';
import DrawerNavigator from '../DrawerNavigator';
import Options from '../Options';

const Stack = createStackNavigator<AppStackParamList>();

const AppStackNavigator = () => {

    const authenticated = useAppSelector(selectLoggedIn)

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {
                authenticated ?
                    <>
                        <Stack.Screen name={ROUTES.GO_GUIDE} component={GoGuide} />
                        <Stack.Screen name={NAVIGATORS.DRAWER} component={DrawerNavigator} />
                        <Stack.Screen name={ROUTES.CHATBOT} component={Chatbot} options={Options} />
                    </>
                    :
                    <Stack.Screen name={NAVIGATORS.AUTH_STACK} component={AuthStackNavigator} />
            }
        </Stack.Navigator>
    );
}

export default AppStackNavigator