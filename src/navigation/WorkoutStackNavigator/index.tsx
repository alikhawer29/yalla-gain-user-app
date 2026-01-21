import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import WorkoutDetail from '../../screens/WorkoutDetail';
import Workouts from '../../screens/Workouts';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';
import VideoDetails from '../../screens/VideoDetails';
import VideoPlayer from '../../screens/VideoPlayer';
import MovementCorrection from '../../screens/MovementCorrection';
import MovementCorrectionCamera from '../../screens/MovementCorrectionCamera';
import SavedContent from '../../screens/SavedContent';

const Stack = createStackNavigator<RootStackParamList>();

const WorkoutStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.WORKOUT} component={Workouts} />
            <Stack.Screen name={ROUTES.WORKOUT_DETAILS} component={WorkoutDetail} />
            <Stack.Screen name={ROUTES.VIDEO_DETAILS} component={VideoDetails} />
            <Stack.Screen name={ROUTES.VIDEO_PLAYER} component={VideoPlayer} />
            <Stack.Screen name={ROUTES.MOVEMENT_CORRECTION} component={MovementCorrection} />
            <Stack.Screen name={ROUTES.MOVEMENT_CORRECTION_CAMERA} component={MovementCorrectionCamera} />
            <Stack.Screen name={ROUTES.SAVED_WORKOUT_CONTENT} component={SavedContent} />
        </Stack.Navigator>
    );
}

export default WorkoutStackNavigator