import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import Home from '../../screens/Home';
import Notifications from '../../screens/Notifications';
import Challenges from '../../screens/Challenges';
import ChallengeDetail from '../../screens/ChallengeDetail';
import ChallengeLogs from '../../screens/ChallengeLogs';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const HomeStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.HOME} component={Home} />
            <Stack.Screen name={ROUTES.NOTIFICATIONS} component={Notifications} />
            <Stack.Screen name={ROUTES.CHALLENGES} component={Challenges} />
            <Stack.Screen name={ROUTES.CHALLENGE_DETAIL} component={ChallengeDetail} />
            <Stack.Screen name={ROUTES.CHALLENGE_LOGS} component={ChallengeLogs} />
        </Stack.Navigator>
    );
}

export default HomeStackNavigator