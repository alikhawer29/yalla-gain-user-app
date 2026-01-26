import React, { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import UnityView from '@azesmway/react-native-unity';
import UnityViewNativeIOS, {
  UnityViewNativeIOSRef,
} from '../../components/UnityView/UnityViewNativeIOS';
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
  const unityNativeIOSRef = useRef<UnityViewNativeIOSRef>(null);
  const isFocused = useIsFocused();

  const handleUnityMessage = (message: string) => {
    console.log('onUnityMessage', message);

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
  };

  useEffect(() => {
    if (Platform.OS === 'ios') {
      if (unityNativeIOSRef?.current) {
        const message: IMessage = {
          gameObject: 'gameObject',
          methodName: 'methodName',
          message: 'message',
        };
        unityNativeIOSRef.current.postMessage(
          message.gameObject,
          message.methodName,
          message.message,
        );
      }
    } else {
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
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android' && unityRef?.current) {
      unityRef?.current?.windowFocusChanged(isFocused);
    }
    // Note: iOS doesn't have windowFocusChanged method in UnityViewNativeIOS
  }, [isFocused, unityRef]);

  return (
    <Wrapper>
      <View style={{ flex: 1 }}>
        {isFocused && (
          <>
            {Platform.OS === 'ios' ? (
              <UnityViewNativeIOS
                ref={unityNativeIOSRef}
                style={{ flex: 1 }}
                pointerEvents="box-none"
                onUnityMessage={(result: { nativeEvent: { message: any } }) => {
                  handleUnityMessage(result.nativeEvent.message);
                }}
              />
            ) : (
              <UnityView
                ref={unityRef}
                style={{ flex: 1 }}
                onUnityMessage={(result: { nativeEvent: { message: any } }) => {
                  handleUnityMessage(result.nativeEvent.message);
                }}
              />
            )}
          </>
        )}
      </View>
    </Wrapper>
  );
};

export default CreateAvatar;
