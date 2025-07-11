import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../../interfaces';
import AuthType from '../../screens/Auth/AuthType';
import ForgotPassword from '../../screens/Auth/ForgotPassword';
import SetPassword from '../../screens/Auth/SetPassword';
import UserEntry from '../../screens/Auth/UserEntry';
import VerifyCode from '../../screens/Auth/VerifyCode';
import Onboarding from '../../screens/Onboarding';
import { ROUTES } from '../../utils/routes';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name={ROUTES.ONBOARDING} component={Onboarding} />
            <Stack.Screen name={ROUTES.USER_ENTRY} component={UserEntry} />
            <Stack.Screen name={ROUTES.AUTH_TYPE} component={AuthType} />
            <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPassword} />
            <Stack.Screen name={ROUTES.VERIFY_CODE} component={VerifyCode} />
            <Stack.Screen name={ROUTES.SET_PASSWORD} component={SetPassword} />
        </Stack.Navigator>
    );
}

export default AuthStackNavigator