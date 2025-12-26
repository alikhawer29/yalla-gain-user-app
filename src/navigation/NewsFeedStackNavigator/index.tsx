import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import NewsFeed from '../../screens/NewsFeed';
import { CreatePost } from '../../screens';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const NewsFeedStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen
                name="NewsFeed"
                component={NewsFeed}
                options={Options}
            />
            <Stack.Screen
                name="CreatePost"
                component={CreatePost}
                options={Options}
            />
        </Stack.Navigator>
    );
}

export default NewsFeedStackNavigator;