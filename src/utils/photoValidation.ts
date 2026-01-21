import { Image } from "react-native"
import RNFS from "react-native-fs"

const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3 MB in bytes
const ALLOWED_RESOLUTIONS = [
    { width: 1080, height: 1920 },
    { width: 720, height: 1280 },
]

// Allow some tolerance for resolution (within 5% difference)
const RESOLUTION_TOLERANCE = 0.05

export interface PhotoValidationResult {
    isValid: boolean
    errors: string[]
}

export const validatePhoto = async (photo: any): Promise<PhotoValidationResult> => {
    const errors: string[] = []

    if (!photo || !photo.path) {
        return {
            isValid: false,
            errors: ["Photo is missing or invalid"]
        }
    }

    try {
        // Check file format (JPEG)
        const fileExtension = photo.path.toLowerCase().split('.').pop()
        if (fileExtension !== 'jpg' && fileExtension !== 'jpeg') {
            errors.push("Photo must be in JPEG format")
        }

        // Check file size (but allow larger files from camera - they will be optimized later)
        // Only warn if file is extremely large (>20MB) as that might indicate an issue
        const filePath = photo.path.startsWith('file://') 
            ? photo.path.replace('file://', '') 
            : photo.path
        
        const fileStats = await RNFS.stat(filePath)
        const fileSize = fileStats.size || 0
        const fileSizeMB = fileSize / (1024 * 1024)

        // Allow larger files from camera (they will be optimized before API submission)
        // Only reject if file is extremely large (>20MB) which might indicate corruption
        const MAX_CAMERA_SIZE = 20 * 1024 * 1024 // 20 MB
        if (fileSize > MAX_CAMERA_SIZE) {
            errors.push(`Photo size is too large (${fileSizeMB.toFixed(2)} MB). Maximum allowed: 20 MB. Please retake the photo.`)
        } else if (fileSize > MAX_FILE_SIZE) {
            // Log warning but don't reject - optimization will handle it
            console.log(`📸 Camera photo size: ${fileSizeMB.toFixed(2)} MB (will be optimized to ≤3 MB before submission)`)
        }

        // Check image dimensions
        const photoUri = photo.path.startsWith('file://') 
            ? photo.path 
            : `file://${photo.path}`

        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            Image.getSize(
                photoUri,
                (width, height) => resolve({ width, height }),
                (error) => reject(error)
            )
        })

        // Check if resolution matches one of the allowed resolutions (with tolerance)
        const isValidResolution = ALLOWED_RESOLUTIONS.some(resolution => {
            const widthMatch = Math.abs(dimensions.width - resolution.width) / resolution.width <= RESOLUTION_TOLERANCE
            const heightMatch = Math.abs(dimensions.height - resolution.height) / resolution.height <= RESOLUTION_TOLERANCE
            
            // Also check if aspect ratio matches (for portrait orientation)
            const currentAspectRatio = dimensions.width / dimensions.height
            const targetAspectRatio = resolution.width / resolution.height
            const aspectRatioMatch = Math.abs(currentAspectRatio - targetAspectRatio) <= RESOLUTION_TOLERANCE
            
            return (widthMatch && heightMatch) || aspectRatioMatch
        })

        if (!isValidResolution) {
            // Check if it's close enough (same aspect ratio)
            const currentAspectRatio = dimensions.width / dimensions.height
            const targetAspectRatio = 1080 / 1920 // 0.5625
            
            if (Math.abs(currentAspectRatio - targetAspectRatio) <= 0.1) {
                // Same aspect ratio, allow it but warn
                console.warn(`Photo resolution ${dimensions.width} × ${dimensions.height} has correct aspect ratio but not exact resolution`)
            } else {
                errors.push(
                    `Photo resolution must be either 1080 × 1920 or 720 × 1280 (portrait orientation). ` +
                    `Current resolution: ${dimensions.width} × ${dimensions.height}`
                )
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    } catch (error: any) {
        console.error("Photo validation error:", error)
        return {
            isValid: false,
            errors: [`Failed to validate photo: ${error?.message || "Unknown error"}`]
        }
    }
}

