import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import Home from '../../screens/Home';
import Options from '../Options';
import { ROUTES } from '../../utils/routes';

const Stack = createStackNavigator<RootStackParamList>();

const HomeStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.HOME} component={Home} />
        </Stack.Navigator>
    );
}

export default HomeStackNavigator