import { ImageSourcePropType, Linking, Platform, Share } from 'react-native';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import images from '../assets/images';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
const DOCUMENT_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.csv',
  '.zip',
  '.rar',
];

export type ChatFileKind = 'image' | 'video' | 'document' | 'unknown';

export type ChatFileRef =
  | string
  | { path?: string; url?: string; uri?: string; media_url?: string };

export type ChatDownloadResult = {
  savedPath: string;
  fileName: string;
};

export const getChatFileUri = (file: ChatFileRef): string | null => {
  if (!file) return null;
  if (typeof file === 'string') return file;
  return file.path || file.url || file.uri || file.media_url || null;
};

export const getFileNameFromUri = (uri: string): string => {
  try {
    const clean = uri.split('?')[0];
    const parts = clean.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'file');
  } catch {
    return 'file';
  }
};

export const getDocumentExtension = (uri: string): string => {
  const name = getFileNameFromUri(uri);
  const parts = name.split('.');
  if (parts.length < 2) return 'FILE';
  const ext = parts.pop()?.toLowerCase();
  return ext ? ext.toUpperCase() : 'FILE';
};

export const getDocumentIcon = (uri: string): ImageSourcePropType => {
  const ext = getDocumentExtension(uri).toLowerCase();
  if (ext === 'pdf') return images.helpdesk.pdf;
  return images.upload;
};

export const getChatFileKind = (uri: string): ChatFileKind => {
  const lower = uri.toLowerCase().split('?')[0];
  if (IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext))) return 'image';
  if (VIDEO_EXTENSIONS.some(ext => lower.endsWith(ext))) return 'video';
  if (DOCUMENT_EXTENSIONS.some(ext => lower.endsWith(ext))) return 'document';
  return 'unknown';
};

export const isChatImageUri = (uri: string): boolean =>
  getChatFileKind(uri) === 'image';

/** Mobile chat: users may only attach images (admin can send docs from web). */
export const isAllowedChatOutgoingAttachment = (
  mime?: string | null,
  name?: string,
): boolean => {
  const lower = (mime || name || '').toLowerCase();
  return lower.includes('image');
};

const getChatDownloadDirectory = (): string =>
  Platform.OS === 'android' && RNFS.DownloadDirectoryPath
    ? RNFS.DownloadDirectoryPath
    : RNFS.DocumentDirectoryPath;

/** Open Downloads folder (Android) or the saved file (iOS). */
export const openChatDownloadedFile = async (
  savedPath: string,
): Promise<void> => {
  const path = savedPath.replace(/^file:\/\//, '');
  const fileUri = savedPath.startsWith('file://')
    ? savedPath
    : `file://${path}`;

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
        title: getFileNameFromUri(path),
        message: getFileNameFromUri(path),
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
        ? `Downloads/${getFileNameFromUri(path)}`
        : getFileNameFromUri(path),
  });
};

export const downloadChatFile = async (
  url: string,
  fileName?: string,
): Promise<ChatDownloadResult | null> => {
  const name = fileName || getFileNameFromUri(url);
  const baseDir = getChatDownloadDirectory();
  const dest = `${baseDir}/${name}`;

  try {
    const exists = await RNFS.exists(dest);
    if (exists) {
      await RNFS.unlink(dest);
    }

    const result = await RNFS.downloadFile({ fromUrl: url, toFile: dest })
      .promise;

    if (
      result.statusCode &&
      result.statusCode >= 200 &&
      result.statusCode < 300
    ) {
      if (Platform.OS === 'android') {
        try {
          await RNFS.scanFile(dest);
        } catch {
          // non-fatal
        }
      }

      const saved: ChatDownloadResult = { savedPath: dest, fileName: name };

      Toast.show({
        type: 'success',
        text1: 'Download complete',
        text2:
          Platform.OS === 'android'
            ? `Download complete — tap to open`
            : `Tap to open ${name}`,
        visibilityTime: 6000,
        onPress: () => {
          Toast.hide();
          openChatDownloadedFile(dest);
        },
      });

      return saved;
    }

    throw new Error(`Download failed (${result.statusCode})`);
  } catch (error) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        Toast.show({
          type: 'info',
          text1: 'Opening file',
          text2: 'Download started in browser',
        });
        return null;
      }
    } catch {
      // fall through
    }

    Toast.show({
      type: 'error',
      text1: 'Download failed',
      text2: error instanceof Error ? error.message : 'Could not download file',
    });
    return null;
  }
};
