import { Linking, Platform, Share } from 'react-native';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';

export const getDownloadDirectory = (): string =>
  Platform.OS === 'android' && RNFS.DownloadDirectoryPath
    ? RNFS.DownloadDirectoryPath
    : RNFS.DocumentDirectoryPath;

export const getFileNameFromPath = (filePath: string): string => {
  try {
    const clean = filePath.replace(/^file:\/\//, '').split('?')[0];
    const parts = clean.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'file');
  } catch {
    return 'file';
  }
};

/** Open Downloads folder (Android) or the saved file (iOS). */
export const openDownloadedFileLocation = async (
  savedPath: string,
): Promise<void> => {
  const path = savedPath.replace(/^file:\/\//, '');
  const fileUri = savedPath.startsWith('file://') ? savedPath : `file://${path}`;

  if (Platform.OS === 'android') {
    try {
      await RNFS.scanFile(path);
    } catch {
      // non-fatal
    }

    const downloadFolderUri =
      'content://com.android.externalstorage.documents/document/primary:Download';
    try {
      if (await Linking.canOpenURL(downloadFolderUri)) {
        await Linking.openURL(downloadFolderUri);
        return;
      }
    } catch {
      // try share fallback
    }

    try {
      await Share.share({
        url: fileUri,
        title: getFileNameFromPath(path),
        message: getFileNameFromPath(path),
      });
      return;
    } catch {
      // fall through
    }
  } else {
    try {
      if (await Linking.canOpenURL(fileUri)) {
        await Linking.openURL(fileUri);
        return;
      }
    } catch {
      // fall through
    }
  }

  Toast.show({
    type: 'info',
    text1: 'File saved',
    text2:
      Platform.OS === 'android'
        ? `Downloads/${getFileNameFromPath(path)}`
        : getFileNameFromPath(path),
  });
};

/** Success toast with tap → open download location. */
export const showDownloadSuccessToast = (
  savedPath: string,
  fileName?: string,
): void => {
  const name = fileName || getFileNameFromPath(savedPath);
  Toast.show({
    type: 'success',
    text1: 'Download complete',
    text2:
      Platform.OS === 'android'
        ? `Saved to Downloads — tap to open folder`
        : `Tap to open ${name}`,
    visibilityTime: 6000,
    onPress: () => {
      Toast.hide();
      openDownloadedFileLocation(savedPath);
    },
  });
};
