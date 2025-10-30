import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { requireNativeComponent, NativeModules, Platform, ViewStyle, StyleSheet } from 'react-native';

interface RNUnityViewNativeProps {
  style?: ViewStyle;
  onUnityMessage?: (event: { nativeEvent: { message: string } }) => void;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
}

const YallaGainUnityViewNative = requireNativeComponent<RNUnityViewNativeProps>('YallaGainUnityView');

// The module is exported as YallaGainUnityViewManager from RCT_EXPORT_MODULE(YallaGainUnityView)
const YallaGainUnityViewManager = NativeModules.YallaGainUnityViewManager;

interface UnityViewNativeIOSProps {
  style?: ViewStyle;
  onUnityMessage?: (event: { nativeEvent: { message: string } }) => void;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
}

export interface UnityViewNativeIOSRef {
  postMessage: (gameObject: string, methodName: string, message: string) => void;
  pauseUnity: (pause: boolean) => void;
  unloadUnity: () => void;
}

const UnityViewNativeIOS = forwardRef<UnityViewNativeIOSRef, UnityViewNativeIOSProps>(
  ({ style, onUnityMessage, pointerEvents = 'box-none' }, ref) => {
    const viewRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      postMessage: (gameObject: string, methodName: string, message: string) => {
        if (YallaGainUnityViewManager && viewRef.current) {
          YallaGainUnityViewManager.postMessage(
            viewRef.current._nativeTag,
            gameObject,
            methodName,
            message
          );
        }
      },
      pauseUnity: (pause: boolean) => {
        if (YallaGainUnityViewManager && viewRef.current) {
          YallaGainUnityViewManager.pauseUnity(viewRef.current._nativeTag, pause);
        }
      },
      unloadUnity: () => {
        if (YallaGainUnityViewManager && viewRef.current) {
          YallaGainUnityViewManager.unloadUnity(viewRef.current._nativeTag);
        }
      },
    }));

    if (Platform.OS !== 'ios') {
      return null;
    }

    const combinedStyle = StyleSheet.flatten([{ flex: 1 }, style]);

    return (
      <YallaGainUnityViewNative
        ref={viewRef}
        style={combinedStyle}
        onUnityMessage={onUnityMessage}
        pointerEvents={pointerEvents}
      />
    );
  }
);

UnityViewNativeIOS.displayName = 'UnityViewNativeIOS';

export default UnityViewNativeIOS;

