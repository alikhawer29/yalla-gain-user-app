import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import NewsFeed from '../../screens/NewsFeed';
import { CreatePost } from '../../screens';
import EditPost from '../../screens/EditPost';
import UserProfile from '../../screens/UserProfile';
import MyPosts from '../../screens/MyPosts';
import ChatDetails from '../../screens/ChatDetails';
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
            <Stack.Screen
                name="EditPost"
                component={EditPost}
                options={Options}
            />
            <Stack.Screen
                name="UserProfile"
                component={UserProfile}
                options={Options}
            />
            <Stack.Screen
                name="MyPosts"
                component={MyPosts}
                options={Options}
            />
            <Stack.Screen
                name="ChatDetails"
                component={ChatDetails}
                options={Options}
            />
        </Stack.Navigator>
    );
}

export default NewsFeedStackNavigator;