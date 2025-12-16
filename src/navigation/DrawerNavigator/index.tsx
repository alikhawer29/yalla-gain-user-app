import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerBar from '../../components/DrawerBar';
import colors from '../../utils/colors';
import { STATUSBAR_HEIGHT } from '../../utils/helper';
import { NAVIGATORS } from '../../utils/routes';
import BottomTabNavigator from '../BottomTabNavigator';
import HelpDeskStackNavigator from '../HelpDeskStackNavigator';
import MusicPanelStackNavigator from '../MusicPanelStackNavigator';
import WorkoutStackNavigator from '../WorkoutStackNavigator';
import AvatarStackNavigator from '../AvatarStackNavigator';
import ConsultationStackNavigator from '../ConsultationStackNavigator';
import WalletStackNavigator from '../WalletStackNavigator';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator screenOptions={{ headerShown: false, drawerType: "slide", drawerStyle: { backgroundColor: colors.black, width: "100%", paddingTop: STATUSBAR_HEIGHT, } }} drawerContent={(props) => <DrawerBar {...props} />} >
            <Drawer.Screen name={NAVIGATORS.BOTTOM} component={BottomTabNavigator} />
            <Drawer.Screen name={NAVIGATORS.MUSIC_PANEL_STACK} component={MusicPanelStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.HELP_DESK_STACK} component={HelpDeskStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.WORKOUT_STACK} component={WorkoutStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.AVATAR_STACK} component={AvatarStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.CONSULTATION_STACK} component={ConsultationStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.WALLET_STACK} component={WalletStackNavigator} />
        </Drawer.Navigator>
    );
}

export default DrawerNavigator