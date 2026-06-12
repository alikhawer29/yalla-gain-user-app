import { NativeModules, Platform } from 'react-native';

type AndroidAudioRouteModule = {
  setSpeakerphoneOn: (enabled: boolean) => Promise<boolean>;
  isSpeakerphoneOn: () => Promise<boolean>;
};

const AndroidAudioRoute = NativeModules.AndroidAudioRoute as
  | AndroidAudioRouteModule
  | undefined;

const isSupported = Platform.OS === 'android' && !!AndroidAudioRoute;

export const setAndroidSpeakerphoneOn = async (
  enabled: boolean,
): Promise<boolean | null> => {
  if (!isSupported) {
    return null;
  }

  try {
    return (await AndroidAudioRoute!.setSpeakerphoneOn(enabled)) === true;
  } catch (error) {
    console.log('[AndroidAudioRoute] setSpeakerphoneOn', error);
    return null;
  }
};

export const isAndroidSpeakerphoneOn = async (): Promise<boolean | null> => {
  if (!isSupported) {
    return null;
  }

  try {
    return (await AndroidAudioRoute!.isSpeakerphoneOn()) === true;
  } catch (error) {
    console.log('[AndroidAudioRoute] isSpeakerphoneOn', error);
    return null;
  }
};

/** Zoom forum workaround for stubborn Android devices when disabling speaker. */
export const forceAndroidEarpieceRoute = async (): Promise<boolean | null> => {
  if (!isSupported) {
    return null;
  }

  await setAndroidSpeakerphoneOn(true);
  await new Promise<void>(resolve => setTimeout(resolve, 80));
  return setAndroidSpeakerphoneOn(false);
};
