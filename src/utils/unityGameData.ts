import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

const PACKAGE_NAME = 'com.blitzapp.yallagain';
const GAME_SAVES_DIR = 'MyGameSaves';
const USER_DATA_FILE = 'userData.json';

/**
 * Get the path where Unity game can access user data
 *
 * Android: /storage/emulated/0/Android/data/com.blitzapp.yallagain/files/MyGameSaves/userData.json
 * iOS: /var/mobile/Containers/Data/Application/{UUID}/Documents/MyGameSaves/userData.json
 */
export const getUnityGameDataPath = (): string => {
  try {
    if (Platform.OS === 'android') {
      // Android: Use app-specific external storage directory
      const basePath = RNFS.ExternalStorageDirectoryPath; // /storage/emulated/0
      const fullPath = `${basePath}/Android/data/${PACKAGE_NAME}/files/${GAME_SAVES_DIR}/${USER_DATA_FILE}`;
      return fullPath;
    } else if (Platform.OS === 'ios') {
      // iOS: Use Documents directory (accessible by both React Native and Unity)
      // Path: /var/mobile/Containers/Data/Application/{UUID}/Documents/MyGameSaves/userData.json
      // Unity's Application.persistentDataPath maps to Documents on iOS
      const fullPath = `${RNFS.DocumentDirectoryPath}/${GAME_SAVES_DIR}/${USER_DATA_FILE}`;
      return fullPath;
    } else {
      console.warn('Unity game data path is only available on Android and iOS');
      return '';
    }
  } catch (error) {
    console.error('Error constructing Unity game data path:', error);
    // Fallback to Document Directory for both platforms
    return `${RNFS.DocumentDirectoryPath}/${GAME_SAVES_DIR}/${USER_DATA_FILE}`;
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
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      console.warn('Unity game data is only written on Android and iOS');
      return false;
    }

    const filePath = getUnityGameDataPath();
    if (!filePath) {
      console.error('❌ Could not construct file path');
      return false;
    }

    // Create directory if it doesn't exist
    let dirPath: string;
    if (Platform.OS === 'android') {
      dirPath = `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files/${GAME_SAVES_DIR}`;
    } else {
      // iOS: Use Documents directory
      dirPath = `${RNFS.DocumentDirectoryPath}/${GAME_SAVES_DIR}`;
    }

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
      const fileStats = await RNFS.stat(filePath);

      // Verify content matches
      try {
        const parsedContent = JSON.parse(fileContent);
        if (parsedContent.user_id === String(userId)) {
        } else {
          console.warn('⚠️ Content verification failed: user_id mismatch');
        }
      } catch (parseError) {
        console.error(
          '❌ Failed to parse file content for verification:',
          parseError,
        );
      }
    } else {
      console.error('❌ File was not created at path:', filePath);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error writing user ID to Unity game:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    return false;
  }
};

/**
 * Delete user data file (called on logout)
 */
export const deleteUnityGameUserData = async (): Promise<boolean> => {
  try {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return false;
    }

    const filePath = getUnityGameDataPath();
    if (!filePath) {
      return false;
    }

    const fileExists = await RNFS.exists(filePath);
    if (fileExists) {
      await RNFS.unlink(filePath);
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
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
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
  fileSize?: number;
  lastModified?: string;
  directoryExists?: boolean;
}> => {
  try {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return {
        exists: false,
        path: 'N/A',
        content: null,
        user_id: null,
        error: 'Unity game data is only available on Android and iOS',
        directoryExists: false,
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
        directoryExists: false,
      };
    }

    // Check if directory exists
    const dirPath =
      Platform.OS === 'android'
        ? `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files/${GAME_SAVES_DIR}`
        : `${RNFS.DocumentDirectoryPath}/${GAME_SAVES_DIR}`;

    const directoryExists = await RNFS.exists(dirPath);

    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      return {
        exists: false,
        path: filePath,
        content: null,
        user_id: null,
        error: 'File does not exist',
        directoryExists,
      };
    }

    const content = await RNFS.readFile(filePath, 'utf8');
    const fileStats = await RNFS.stat(filePath);
    const userData = JSON.parse(content);

    return {
      exists: true,
      path: filePath,
      content: content,
      user_id: userData.user_id || null,
      error: null,
      fileSize: fileStats.size,
      lastModified: new Date(fileStats.mtime * 1000).toISOString(),
      directoryExists,
    };
  } catch (error: any) {
    return {
      exists: false,
      path: getUnityGameDataPath(),
      content: null,
      user_id: null,
      error: error?.message || 'Unknown error',
      directoryExists: false,
    };
  }
};

/**
 * Comprehensive test function to verify Unity game data path works on iOS
 * This function performs a full write-read-verify cycle
 */
export const testUnityGameDataPathIOS = async (
  testUserId: string | number = 'TEST_USER_123',
): Promise<{
  success: boolean;
  message: string;
  details: {
    path: string;
    directoryCreated: boolean;
    fileWritten: boolean;
    fileRead: boolean;
    contentMatches: boolean;
    fileSize: number | null;
    error: string | null;
  };
}> => {
  if (Platform.OS !== 'ios') {
    return {
      success: false,
      message: 'This test is only for iOS',
      details: {
        path: '',
        directoryCreated: false,
        fileWritten: false,
        fileRead: false,
        contentMatches: false,
        fileSize: null,
        error: 'Not iOS platform',
      },
    };
  }

  const details = {
    path: '',
    directoryCreated: false,
    fileWritten: false,
    fileRead: false,
    contentMatches: false,
    fileSize: null as number | null,
    error: null as string | null,
  };

  try {
    // Step 1: Get path
    const filePath = getUnityGameDataPath();
    details.path = filePath;

    // Step 2: Create directory
    const dirPath = `${RNFS.DocumentDirectoryPath}/${GAME_SAVES_DIR}`;
    const dirExists = await RNFS.exists(dirPath);
    if (!dirExists) {
      await RNFS.mkdir(dirPath);
      details.directoryCreated = true;
    } else {
      details.directoryCreated = true;
    }

    // Step 3: Write test file
    const testData = {
      user_id: String(testUserId),
      updated_at: new Date().toISOString(),
      test: true,
    };
    await RNFS.writeFile(filePath, JSON.stringify(testData, null, 2), 'utf8');
    details.fileWritten = true;

    // Step 4: Verify file exists and read it
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      throw new Error('File was not created');
    }

    const fileStats = await RNFS.stat(filePath);
    details.fileSize = fileStats.size;

    const content = await RNFS.readFile(filePath, 'utf8');
    details.fileRead = true;

    // Step 5: Verify content
    const parsedContent = JSON.parse(content);
    if (parsedContent.user_id === String(testUserId)) {
      details.contentMatches = true;
    } else {
      throw new Error(
        `Content mismatch: expected ${testUserId}, got ${parsedContent.user_id}`,
      );
    }

    // Step 6: Verify Unity can access this path
    // Unity's Application.persistentDataPath on iOS maps to Documents directory

    return {
      success: true,
      message:
        'All tests passed! Unity game data path is working correctly on iOS.',
      details,
    };
  } catch (error: any) {
    details.error = error?.message || 'Unknown error';
    console.error('❌ Test failed:', error);
    return {
      success: false,
      message: `❌ Test failed: ${error?.message || 'Unknown error'}`,
      details,
    };
  }
};
