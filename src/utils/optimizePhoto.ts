import { Image, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

const TARGET_RESOLUTIONS = [
  { width: 1080, height: 1920 },
  { width: 720, height: 1280 },
];
const MAX_SIZE_MB = 3;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Save image to Documents/Download folder for testing / Postman
const saveImageToDocuments = async (
  imageUri: string,
  prefix: string,
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const documentsPath =
      Platform.OS === 'ios'
        ? RNFS.DocumentDirectoryPath
        : RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath;

    const testImagesDir = `${documentsPath}/test_images`;
    const dirExists = await RNFS.exists(testImagesDir);
    if (!dirExists) await RNFS.mkdir(testImagesDir);

    const fileName = `${prefix}_${timestamp}.jpg`;
    const destinationPath = `${testImagesDir}/${fileName}`;

    const sourcePath = imageUri.startsWith('file://')
      ? imageUri.replace('file://', '')
      : imageUri;
    const sourceExists = await RNFS.exists(sourcePath);
    if (!sourceExists) throw new Error(`Source image not found: ${sourcePath}`);

    await RNFS.copyFile(sourcePath, destinationPath);
    console.log(`📁 Image saved for testing: ${destinationPath}`);
    return destinationPath;
  } catch (error: any) {
    console.warn('Failed to save image:', error);
    return '';
  }
};

// Determine best portrait resolution
const getBestResolution = (width: number, height: number) => {
  const maxDimension = Math.max(width, height);
  return maxDimension >= 1920
    ? { width: 1080, height: 1920 }
    : { width: 720, height: 1280 };
};

// Determine rotation needed for front/right body photos
const getRotationForPortrait = (
  width: number,
  height: number,
  photoType?: 'front' | 'right',
) => {
  if (width <= height) return 0; // Already portrait
  if (photoType === 'front') return 90;
  if (photoType === 'right') return 270;
  return 90; // default for other landscape images
};

export interface OptimizedPhoto {
  path: string;
  width: number;
  height: number;
  size: number;
  sizeMB: number;
  quality: number;
  savedPath?: string;
}

export const optimizePhoto = async (
  photo: any,
  photoType?: 'front' | 'right',
): Promise<OptimizedPhoto> => {
  if (!photo || !photo.path) throw new Error('Invalid photo');

  try {
    const photoUri = photo.path.startsWith('file://')
      ? photo.path
      : `file://${photo.path}`;

    // Get original dimensions
    const originalDimensions = await new Promise<{
      width: number;
      height: number;
    }>((resolve, reject) => {
      Image.getSize(
        photoUri,
        (width, height) => resolve({ width, height }),
        error => reject(error),
      );
    });

    const rotation = getRotationForPortrait(
      originalDimensions.width,
      originalDimensions.height,
      photoType,
    );
    const targetResolution = getBestResolution(
      originalDimensions.width,
      originalDimensions.height,
    );

    let quality = 90;
    let attempts = 0;
    const maxAttempts = 5;
    let optimizedUri = photoUri;
    let finalWidth = originalDimensions.width;
    let finalHeight = originalDimensions.height;

    while (attempts < maxAttempts) {
      const resized = await ImageResizer.createResizedImage(
        optimizedUri,
        rotation === 0 ? targetResolution.width : targetResolution.height, // swap if rotating
        rotation === 0 ? targetResolution.height : targetResolution.width,
        'JPEG',
        quality,
        rotation, // rotate pixels physically
        undefined,
        false, // ✅ strip all EXIF → Top-Left guaranteed
        { mode: 'cover' },
      );

      const filePath = resized.uri.startsWith('file://')
        ? resized.uri.replace('file://', '')
        : resized.uri;
      const stats = await RNFS.stat(filePath);
      const sizeMB = stats.size / (1024 * 1024);

      finalWidth = resized.width;
      finalHeight = resized.height;
      optimizedUri = resized.uri;

      if (stats.size <= MAX_SIZE_BYTES) {
        const savedPath = await saveImageToDocuments(
          optimizedUri,
          'api_payload',
        );
        return {
          path: optimizedUri,
          width: finalWidth,
          height: finalHeight,
          size: stats.size,
          sizeMB,
          quality,
          savedPath,
        };
      }

      quality -= 15;
      attempts++;
      if (quality < 50)
        throw new Error(
          'Cannot compress image below 3MB while maintaining quality',
        );
    }

    throw new Error('Max compression attempts reached');
  } catch (error: any) {
    console.error('Photo optimization error:', error);
    throw new Error(
      `Failed to optimize photo: ${error?.message || 'Unknown error'}`,
    );
  }
};
