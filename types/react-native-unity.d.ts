declare module '@azesmway/react-native-unity' {
  import { Component } from 'react';
  import { ViewStyle, NativeSyntheticEvent } from 'react-native';

  export interface UnityViewProps {
    style?: ViewStyle;
    onUnityMessage?: (event: NativeSyntheticEvent<{ message: string }>) => void;
    androidKeepPlayerMounted?: boolean;
  }

  export default class UnityView extends Component<UnityViewProps> {
    postMessage(gameObject: string, methodName: string, message: string): void;
    unloadUnity(): void;
    pauseUnity(pause: boolean): void;
    resumeUnity(): void;
    windowFocusChanged(hasFocus: boolean): void;
  }
}