import React, { useEffect, useRef } from 'react';
import UnityView from '@azesmway/react-native-unity';
import { View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Wrapper from '../../components/Wrapper';
import { navigate } from '../../utils/navigation';
import { NAVIGATORS } from '../../utils/routes';

interface IMessage {
    gameObject: string;
    methodName: string;
    message: string;
}

const CreateAvatar = () => {
    const unityRef = useRef<UnityView>(null);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (unityRef?.current) {
            const message: IMessage = {
                gameObject: 'gameObject',
                methodName: 'methodName',
                message: 'message',
            };
            unityRef.current.postMessage(
                message.gameObject,
                message.methodName,
                message.message,
            );
        }
    }, []);

    useEffect(() => {
        if (unityRef?.current) {
            unityRef?.current?.windowFocusChanged(isFocused);
        }
    }, [isFocused, unityRef]);

    return (
        <Wrapper>
            <View style={{ flex: 1 }}>
                {isFocused && (
                    <UnityView
                        ref={unityRef}
                        style={{ flex: 1 }}
                        onUnityMessage={(result: { nativeEvent: { message: any } }) => {
                            console.log('onUnityMessage', result.nativeEvent.message);
                            const message = result.nativeEvent.message;

                            // Unity buttons:
                            // - Save button:   method "SaveGame", event "SaveGame"
                            // - Close button:  method "CloseGame", event "GoBack"
                            if (message === 'SaveGame' || message === 'GoBack') {
                                // Navigate back to Home tab inside Drawer -> BottomTab -> HomeStack
                                navigate(NAVIGATORS.DRAWER as any, {
                                    screen: NAVIGATORS.BOTTOM,
                                    params: {
                                        screen: NAVIGATORS.HOME_STACK,
                                    },
                                });
                            }
                        }}
                    />
                )}
            </View>
        </Wrapper>
    );
};

export default CreateAvatar;