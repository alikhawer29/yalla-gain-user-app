import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import ChangePassword from '../../screens/ChangePassword';
import EditProfile from '../../screens/EditProfile';
import MyProfile from '../../screens/MyProfile';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const MyProfileStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.MY_PROFILE} component={MyProfile} />
            <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfile} />
            <Stack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePassword} />
        </Stack.Navigator>
    );
}

export default MyProfileStackNavigator