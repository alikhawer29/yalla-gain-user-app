import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import Chatbot from '../../screens/Chatbot';
import HelpDesk from '../../screens/HelpDesk';
import Subscription from '../../screens/Subscription';
import SubscriptionLogs from '../../screens/SubscriptionLogs';
import MyPosts from '../../screens/MyPosts';
import EditPost from '../../screens/EditPost';
import CreatePost from '../../screens/CreatePost';
import BlockedUsers from '../../screens/BlockedUsers';
import ChooseLanguage from '../../screens/ChooseLanguage';
import BasicDetails from '../../screens/BasicDetails';
import AboutUs from '../../screens/AboutUs';
import Faqs from '../../screens/Faqs';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const HelpDeskStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.HELP_DESK} component={HelpDesk} />
            <Stack.Screen name={ROUTES.MY_POSTS} component={MyPosts} />
            <Stack.Screen name={ROUTES.CREATE_POST} component={CreatePost} />
            <Stack.Screen name={ROUTES.EDIT_POST} component={EditPost} />
            <Stack.Screen name={ROUTES.BLOCKED_USERS} component={BlockedUsers} />
            <Stack.Screen name={ROUTES.SUBSCRIPTION} component={Subscription} />
            <Stack.Screen name={ROUTES.SUBSCRIPTION_LOGS} component={SubscriptionLogs} />
            <Stack.Screen name={ROUTES.CHOOSE_LANGUAGE} component={ChooseLanguage} />
            <Stack.Screen name={ROUTES.BASIC_DETAILS} component={BasicDetails} />
            <Stack.Screen name={ROUTES.ABOUT_US} component={AboutUs} />
            <Stack.Screen name={ROUTES.FAQS} component={Faqs} />
        </Stack.Navigator>
    );
}

export default HelpDeskStackNavigator