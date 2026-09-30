import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import images from '../../assets/images';
import BottomBar from '../../components/BottomBar';
import { NAVIGATORS } from '../../utils/routes';
import ChatStackNavigator from '../ChatStackNavigator';
import HomeStackNavigator from '../HomeStackNavigator';
import MyProfileStackNavigator from '../MyProfileStackNavigator';
import NewsFeedStackNavigator from '../NewsFeedStackNavigator';
import ProgressTrackingStackNavigator from '../ProgressTrackingStackNavigator';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                animation: "fade",
                // Unmount inactive tabs so revisit remounts + fresh RTK fetch
                unmountOnBlur: true,
            }}
            tabBar={props => <BottomBar {...props} />}
        >
            <Tab.Screen name={NAVIGATORS.HOME_STACK} component={HomeStackNavigator} options={{ tabBarIcon: images.tab_home }} />
            <Tab.Screen name={NAVIGATORS.NEWSFEED_STACK} component={NewsFeedStackNavigator} options={{ tabBarIcon: images.tab_gallery }} />
            <Tab.Screen name={NAVIGATORS.PROGRESS_TRACKING_STACK} component={ProgressTrackingStackNavigator} options={{ tabBarIcon: images.tab_graph }} />
            <Tab.Screen name={NAVIGATORS.CHAT_STACK} component={ChatStackNavigator} options={{ tabBarIcon: images.tab_chat }} />
            <Tab.Screen name={NAVIGATORS.MY_PROFILE_STACK} component={MyProfileStackNavigator} options={{ tabBarIcon: images.tab_profile }} />
        </Tab.Navigator>
    );
}

export default BottomTabNavigator