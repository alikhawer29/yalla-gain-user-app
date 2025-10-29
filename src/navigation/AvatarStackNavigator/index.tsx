import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import CreateAvatar from '../../screens/CreateAvatar';
import Scan from '../../screens/Scan';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const AvatarStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.SCAN} component={Scan} />
            <Stack.Screen name={ROUTES.CREATE_AVATAR} component={CreateAvatar} />
        </Stack.Navigator>
    );
}

export default AvatarStackNavigator