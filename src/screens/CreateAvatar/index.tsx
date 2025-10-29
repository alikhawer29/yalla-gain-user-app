import UnityView from '@azesmway/react-native-unity';
import { useRef } from "react";
import { View } from "react-native";
import Button from '../../components/Button';
import Wrapper from '../../components/Wrapper';
import { heightPixel } from '../../utils/helper';
import { navigateAndSimpleReset } from '../../utils/navigation';
import { NAVIGATORS, ROUTES } from '../../utils/routes';

const CreateAvatar = () => {

    const unityRef = useRef<UnityView>(null);

    return (
        <Wrapper>
            <View style={{ flex: 0.8, borderRadius: heightPixel(10), overflow: 'hidden' }}>
                <UnityView
                    ref={unityRef}
                    style={{ flex: 1 }}
                    onUnityMessage={(result) => {
                        console.log('onUnityMessage', result.nativeEvent.message);
                    }}
                    androidKeepPlayerMounted={true}
                />
            </View>
            <View style={{ flex: 0.2, justifyContent: 'center', }}>
                <Button text='Finish' onPress={() => navigateAndSimpleReset(NAVIGATORS.BOTTOM, { screen: ROUTES.HOME })} />
            </View>
        </Wrapper>
    )
}

export default CreateAvatar