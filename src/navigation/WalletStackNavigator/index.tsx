import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import Wallet from '../../screens/Wallet';
import Transfer from '../../screens/Transfer';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const WalletStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.WALLET} component={Wallet} />
            <Stack.Screen name={ROUTES.TRANSFER} component={Transfer} />
        </Stack.Navigator>
    );
}

export default WalletStackNavigator
