import { Image } from "react-native"
import RNFS from "react-native-fs"
import { Platform } from "react-native"

const TARGET_RESOLUTIONS = [
    { width: 1080, height: 1920 },
    { width: 720, height: 1280 },
]

/**
 * Resizes a photo to match one of the target resolutions exactly
 * Uses canvas-like approach or native image manipulation
 * Note: This is a placeholder - in production, use react-native-image-resizer
 */
export const resizePhotoToExactResolution = async (photo: any): Promise<any> => {
    if (!photo || !photo.path) {
        throw new Error("Invalid photo")
    }

    try {
        const photoUri = photo.path.startsWith('file://') 
            ? photo.path 
            : `file://${photo.path}`

        // Get current dimensions
        const currentDimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            Image.getSize(
                photoUri,
                (width, height) => resolve({ width, height }),
                (error) => reject(error)
            )
        })

        // Determine target resolution
        // Prefer 1080x1920 if current image is larger, otherwise use 720x1280
        let targetResolution = TARGET_RESOLUTIONS[0] // 1080x1920
        
        if (currentDimensions.width < 1080 || currentDimensions.height < 1920) {
            targetResolution = TARGET_RESOLUTIONS[1] // 720x1280
        }

        // Check if already matches exactly
        if (currentDimensions.width === targetResolution.width && 
            currentDimensions.height === targetResolution.height) {
            return photo
        }

        // For now, we'll need to use a library like react-native-image-resizer
        // Since it's not installed, we'll return the original photo
        // and the backend validation will catch it
        // TODO: Install and use react-native-image-resizer or similar library
        
        console.warn(`Photo needs resizing from ${currentDimensions.width}x${currentDimensions.height} to ${targetResolution.width}x${targetResolution.height}`)
        
        // Return original photo - will need image resizer library for actual resizing
        return photo
    } catch (error: any) {
        console.error("Photo resizing error:", error)
        throw new Error(`Failed to resize photo: ${error?.message || "Unknown error"}`)
    }
}

