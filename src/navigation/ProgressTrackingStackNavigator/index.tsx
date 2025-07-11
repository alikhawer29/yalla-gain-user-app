import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import ProgressTracking from '../../screens/ProgressTracking';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const ProgressTrackingStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.PROGRESS_TRACKING} component={ProgressTracking} />
        </Stack.Navigator>
    );
}

export default ProgressTrackingStackNavigator