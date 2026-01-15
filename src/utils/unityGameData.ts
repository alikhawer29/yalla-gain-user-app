import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

const PACKAGE_NAME = 'com.blitzapp.yallagain';
const GAME_SAVES_DIR = 'MyGameSaves';
const USER_DATA_FILE = 'userData.json';

/**
 * Get the path where Unity game can access user data
 * Path: /storage/emulated/0/Android/data/com.blitzapp.yallagain/files/MyGameSaves/userData.json
 *
 * Alternative paths if the above doesn't work:
 * 1. External Directory: RNFS.ExternalDirectoryPath + '/MyGameSaves/userData.json'
 * 2. Document Directory: RNFS.DocumentDirectoryPath + '/MyGameSaves/userData.json'
 */
const getUnityGameDataPath = (): string => {
  if (Platform.OS !== 'android') {
    console.warn('Unity game data path is only available on Android');
    return '';
  }

  try {
    // Construct the path: /storage/emulated/0/Android/data/{package}/files/{dir}/{file}
    const basePath = RNFS.ExternalStorageDirectoryPath; // /storage/emulated/0
    const fullPath = `${basePath}/Android/data/${PACKAGE_NAME}/files/${GAME_SAVES_DIR}/${USER_DATA_FILE}`;

    return fullPath;
  } catch (error) {
    console.error('Error constructing Unity game data path:', error);
    // Fallback to External Directory if the above fails
    return `${RNFS.ExternalDirectoryPath}/${GAME_SAVES_DIR}/${USER_DATA_FILE}`;
  }
};

/**
 * Write user ID to Unity game accessible file
 * @param userId - The user ID to store
 */
export const writeUserIdToUnityGame = async (
  userId: number | string,
): Promise<boolean> => {
  try {
    if (Platform.OS !== 'android') {
      console.warn('Unity game data is only written on Android');
      return false;
    }

    const filePath = getUnityGameDataPath();
    if (!filePath) {
      return false;
    }

    // Create directory if it doesn't exist
    const dirPath = `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files/${GAME_SAVES_DIR}`;
    const dirExists = await RNFS.exists(dirPath);

    if (!dirExists) {
      await RNFS.mkdir(dirPath);
    }

    // Prepare user data
    const userData = {
      user_id: String(userId),
      updated_at: new Date().toISOString(),
    };

    // Write to file
    await RNFS.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf8');

    // Verify file was created
    const fileExists = await RNFS.exists(filePath);
    if (fileExists) {
      const fileContent = await RNFS.readFile(filePath, 'utf8');
      console.log('✅ User ID successfully written to Unity game!');
      console.log('📁 File path:', filePath);
      console.log('📄 File content:', fileContent);
      console.log(
        '📱 To view on device: Use a file manager app and navigate to:',
      );
      console.log(
        '   Android/data/com.blitzapp.yallagain/files/MyGameSaves/userData.json',
      );
    } else {
      console.error('❌ File was not created at path:', filePath);
    }

    return true;
  } catch (error) {
    console.error('Error writing user ID to Unity game:', error);
    return false;
  }
};

/**
 * Delete user data file (called on logout)
 */
export const deleteUnityGameUserData = async (): Promise<boolean> => {
  try {
    if (Platform.OS !== 'android') {
      return false;
    }

    const filePath = getUnityGameDataPath();
    if (!filePath) {
      return false;
    }

    const fileExists = await RNFS.exists(filePath);
    if (fileExists) {
      await RNFS.unlink(filePath);
      console.log('Unity game user data deleted');
    }

    return true;
  } catch (error) {
    console.error('Error deleting Unity game user data:', error);
    return false;
  }
};

/**
 * Read user ID from Unity game file (for verification)
 */
export const readUserIdFromUnityGame = async (): Promise<string | null> => {
  try {
    if (Platform.OS !== 'android') {
      return null;
    }

    const filePath = getUnityGameDataPath();
    if (!filePath) {
      return null;
    }

    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      return null;
    }

    const content = await RNFS.readFile(filePath, 'utf8');
    const userData = JSON.parse(content);

    return userData.user_id || null;
  } catch (error) {
    console.error('Error reading user ID from Unity game:', error);
    return null;
  }
};

/**
 * Get complete file information for verification/debugging
 */
export const getUnityGameFileInfo = async (): Promise<{
  exists: boolean;
  path: string;
  content: string | null;
  user_id: string | null;
  error: string | null;
}> => {
  try {
    if (Platform.OS !== 'android') {
      return {
        exists: false,
        path: 'N/A (iOS)',
        content: null,
        user_id: null,
        error: 'Unity game data is only available on Android',
      };
    }

    const filePath = getUnityGameDataPath();
    if (!filePath) {
      return {
        exists: false,
        path: 'N/A',
        content: null,
        user_id: null,
        error: 'Could not construct file path',
      };
    }

    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      return {
        exists: false,
        path: filePath,
        content: null,
        user_id: null,
        error: 'File does not exist',
      };
    }

    const content = await RNFS.readFile(filePath, 'utf8');
    const userData = JSON.parse(content);

    return {
      exists: true,
      path: filePath,
      content: content,
      user_id: userData.user_id || null,
      error: null,
    };
  } catch (error: any) {
    return {
      exists: false,
      path: getUnityGameDataPath(),
      content: null,
      user_id: null,
      error: error?.message || 'Unknown error',
    };
  }
};
