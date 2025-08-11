import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import Subscription from '../../screens/Subscription';
import SubscriptionLogs from '../../screens/SubscriptionLogs';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const SubscriptionStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.SUBSCRIPTION} component={Subscription} />
            <Stack.Screen name={ROUTES.SUBSCRIPTION_LOGS} component={SubscriptionLogs} />
        </Stack.Navigator>
    );
}

export default SubscriptionStackNavigator