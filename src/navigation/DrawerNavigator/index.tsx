import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerBar from '../../components/DrawerBar';
import colors from '../../utils/colors';
import { STATUSBAR_HEIGHT } from '../../utils/helper';
import { NAVIGATORS } from '../../utils/routes';
import BottomTabNavigator from '../BottomTabNavigator';
import MusicPanelNavigator from '../MusicPanelStackNavigator';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator screenOptions={{ headerShown: false, drawerType: "slide", drawerStyle: { backgroundColor: colors.black, width: "100%", paddingTop: STATUSBAR_HEIGHT, } }} drawerContent={(props) => <DrawerBar {...props} />} >
            <Drawer.Screen name={NAVIGATORS.BOTTOM} component={BottomTabNavigator} />
            <Drawer.Screen name={NAVIGATORS.MUSIC_PANEL_STACK} component={MusicPanelNavigator} />
        </Drawer.Navigator>
    );
}

export default DrawerNavigator