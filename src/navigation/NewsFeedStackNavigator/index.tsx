import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import NewsFeed from '../../screens/NewsFeed';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const NewsFeedStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name="NewsFeed" component={NewsFeed} />
        </Stack.Navigator>
    );
}

export default NewsFeedStackNavigator