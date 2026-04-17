import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import Challenges from '../../screens/Challenges';
import ChallengeDetail from '../../screens/ChallengeDetail';
import ChallengeLogs from '../../screens/ChallengeLogs';
import ChallengeReward from '../../screens/ChallengeReward';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const ChallengesStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.CHALLENGES} component={Challenges} />
            <Stack.Screen name={ROUTES.CHALLENGE_DETAIL} component={ChallengeDetail} />
            <Stack.Screen name={ROUTES.CHALLENGE_REWARD} component={ChallengeReward} />
            <Stack.Screen name={ROUTES.CHALLENGE_LOGS} component={ChallengeLogs} />
        </Stack.Navigator>
    );
}

export default ChallengesStackNavigator
