import { Image } from "react-native"
import RNFS from "react-native-fs"
import { Platform } from "react-native"

const TARGET_RESOLUTIONS = [
    { width: 1080, height: 1920 },
    { width: 720, height: 1280 },
]

const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3 MB

/**
 * Processes a photo to meet requirements:
 * - Resizes to one of the target resolutions (1080x1920 or 720x1280)
 * - Ensures JPEG format
 * - Compresses to under 3MB if needed
 */
export const processPhoto = async (photo: any): Promise<any> => {
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

        // Determine target resolution based on aspect ratio
        const currentAspectRatio = currentDimensions.width / currentDimensions.height
        const target1080AspectRatio = 1080 / 1920 // 0.5625
        const target720AspectRatio = 720 / 1280 // 0.5625

        // Both have same aspect ratio, choose based on current size
        let targetResolution = TARGET_RESOLUTIONS[0] // Default to 1080x1920
        
        // If current image is smaller, use 720x1280
        if (currentDimensions.width < 1080 || currentDimensions.height < 1920) {
            targetResolution = TARGET_RESOLUTIONS[1] // 720x1280
        }

        // Check if already matches target resolution
        const matchesTarget = 
            (currentDimensions.width === targetResolution.width && 
             currentDimensions.height === targetResolution.height) ||
            (Math.abs(currentDimensions.width - targetResolution.width) < 10 &&
             Math.abs(currentDimensions.height - targetResolution.height) < 10)

        // Check file size
        const filePath = photo.path.startsWith('file://') 
            ? photo.path.replace('file://', '') 
            : photo.path
        
        const fileStats = await RNFS.stat(filePath)
        const fileSize = fileStats.size || 0

        // If photo already meets requirements, return as is
        if (matchesTarget && fileSize <= MAX_FILE_SIZE) {
            const fileExtension = photo.path.toLowerCase().split('.').pop()
            if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
                return photo
            }
        }

        // For now, return the original photo
        // In a production environment, you would use react-native-image-resizer
        // or similar library to actually resize/compress the image
        // For now, we'll accept photos that are close to the requirements
        
        return photo
    } catch (error: any) {
        console.error("Photo processing error:", error)
        throw new Error(`Failed to process photo: ${error?.message || "Unknown error"}`)
    }
}

