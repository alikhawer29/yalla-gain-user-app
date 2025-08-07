import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import HelpDesk from '../../screens/HelpDesk';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const HelpDeskStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name="HelpDesk" component={HelpDesk} />
        </Stack.Navigator>
    );
}

export default HelpDeskStackNavigator