import { Linking, Platform, Share } from 'react-native';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';

const IOS_DOWNLOADS_FOLDER = 'Downloads';

export const getDownloadDirectory = (): string => {
  if (Platform.OS === 'android' && RNFS.DownloadDirectoryPath) {
    return RNFS.DownloadDirectoryPath;
  }
  if (Platform.OS === 'ios') {
    return `${RNFS.DocumentDirectoryPath}/${IOS_DOWNLOADS_FOLDER}`;
  }
  return RNFS.DocumentDirectoryPath;
};

/** Ensure the target download folder exists before writing a file. */
export const ensureDownloadDirectory = async (): Promise<string> => {
  const dir = getDownloadDirectory();
  try {
    const exists = await RNFS.exists(dir);
    if (!exists) {
      await RNFS.mkdir(dir);
    }
  } catch {
    // Directory may already exist (race) — ignore.
  }
  return dir;
};

export const getFileNameFromPath = (filePath: string): string => {
  try {
    const clean = filePath.replace(/^file:\/\//, '').split('?')[0];
    const parts = clean.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'file');
  } catch {
    return 'file';
  }
};

const toFileUri = (filePath: string): string => {
  const path = filePath.replace(/^file:\/\//, '');
  return filePath.startsWith('file://') ? filePath : `file://${path}`;
};

/**
 * iOS: system Downloads is not writable directly — use Share → "Save to Files" → Downloads.
 * Android: open Downloads folder or share the file.
 */
export const shareDownloadedFile = async (
  savedPath: string,
): Promise<boolean> => {
  const path = savedPath.replace(/^file:\/\//, '');
  try {
    const exists = await RNFS.exists(path);
    if (!exists) {
      Toast.show({
        type: 'error',
        text1: 'File not found',
        text2: getFileNameFromPath(path),
      });
      return false;
    }

    const result = await Share.share({
      url: toFileUri(path),
      title: getFileNameFromPath(path),
    });
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
};

/** Open Downloads folder (Android) or share / save file (iOS). */
export const openDownloadedFileLocation = async (
  savedPath: string,
): Promise<void> => {
  const path = savedPath.replace(/^file:\/\//, '');
  const fileUri = toFileUri(savedPath);

  if (Platform.OS === 'ios') {
    await shareDownloadedFile(savedPath);
    return;
  }

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

/** After download on iOS, prompt Share so user can save to Files → Downloads. */
const promptIosSaveToFiles = (savedPath: string): void => {
  setTimeout(() => {
    void shareDownloadedFile(savedPath);
  }, 350);
};

/**
 * Android: success toast (tap → open Downloads).
 * iOS: no toast — only Share sheet to save to Files / Downloads.
 */
export const showDownloadSuccessToast = (
  savedPath: string,
  fileName?: string,
): void => {
  if (Platform.OS === 'ios') {
    promptIosSaveToFiles(savedPath);
    return;
  }

  const name = fileName || getFileNameFromPath(savedPath);
  Toast.show({
    type: 'success',
    text1: 'Download complete',
    text2: 'Saved to Downloads — tap to open folder',
    visibilityTime: 6000,
    onPress: () => {
      Toast.hide();
      void openDownloadedFileLocation(savedPath);
    },
  });
};
