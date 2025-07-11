import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import Chat from '../../screens/Chat';
import Options from '../Options';
import { ROUTES } from '../../utils/routes';

const Stack = createStackNavigator<RootStackParamList>();

const ChatStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.CHAT} component={Chat} />
        </Stack.Navigator>
    );
}

export default ChatStackNavigator