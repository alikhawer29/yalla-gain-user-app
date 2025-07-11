import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import ChangePassword from '../../screens/ChangePassword';
import MyProfile from '../../screens/MyProfile';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const MyProfileStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name="MyProfile" component={MyProfile} />
            <Stack.Screen name="EditProfile" component={ChangePassword} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
        </Stack.Navigator>
    );
}

export default MyProfileStackNavigator