import { useCallback, useEffect, useRef } from "react"
import { useRoute } from "@react-navigation/native"
import { useModal } from "../../contexts/ModalContext"
import { useAppSelector } from "../../hooks"
import { selectUser } from "../../redux/Slices/AuthSlice"
import { useScanAvatarMutation } from "../../redux/Apis/User"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import * as Yup from "yup"
import { Platform } from "react-native"
import { validatePhoto } from "../../utils/photoValidation"
import RNFS from "react-native-fs"

const AVATAR_SCAN_FORM_SCHEMA = Yup.object().shape({
    age: Yup.number()
        .required('Age is required')
        .min(1, 'Age must be at least 1')
        .max(150, 'Age must be less than 150'),
    gender: Yup.string()
        .oneOf(['male', 'female'], 'Gender must be selected')
        .required('Gender is required'),
    weight: Yup.number()
        .required('Weight is required')
        .min(1, 'Weight must be at least 1 gram'),
    height: Yup.number()
        .required('Height is required')
        .min(1, 'Height must be at least 1 cm'),
})

const useAvatarScanFormController = () => {

    const user = useAppSelector(selectUser)
    const formik_ref = useRef(null)
    const { showOkModal } = useModal()
    const route = useRoute()
    const { frontPhoto, rightPhoto } = (route.params as any) || {}

    const [submit, { isLoading, isSuccess }] = useScanAvatarMutation()

    const initial = {
        age: "",
        gender: "",
        weight: "",
        height: "",
    }

    useEffect(() => {
        if (isSuccess) {
            navigate(ROUTES.CREATE_AVATAR)
        }
    }, [isSuccess])

    const onSubmit = useCallback(async (data: any) => {
        if (!frontPhoto || !rightPhoto) {
            showOkModal({
                type: "error",
                title: "Error",
                message: "Photos are missing. Please go back and capture photos again."
            })
            return
        }

        // Validate both photos before submission (check for critical errors only)
        const frontValidation = await validatePhoto(frontPhoto)
        const rightValidation = await validatePhoto(rightPhoto)

        // Filter out resolution-only errors (we'll allow those if aspect ratio is correct)
        const frontCriticalErrors = frontValidation.errors.filter(err => 
            !err.includes('resolution') && !err.includes('Resolution')
        )
        const rightCriticalErrors = rightValidation.errors.filter(err => 
            !err.includes('resolution') && !err.includes('Resolution')
        )

        if (frontCriticalErrors.length > 0 || rightCriticalErrors.length > 0) {
            const allErrors = [
                ...(frontCriticalErrors.length > 0 ? ["Front Photo: " + frontCriticalErrors.join(", ")] : []),
                ...(rightCriticalErrors.length > 0 ? ["Right Photo: " + rightCriticalErrors.join(", ")] : [])
            ]
            showOkModal({
                type: "error",
                title: "Photo Validation Failed",
                message: "One or more photos have critical issues:\n\n" + allErrors.join("\n\n") + "\n\nPlease go back and retake the photos."
            })
            return
        }

        try {
            const formData = new FormData()

            // Add user_id
            formData.append('user_id', String(user?.id))

            // Add form fields
            formData.append('age', String(data.age))
            formData.append('gender', data.gender)
            formData.append('height', String(data.height))
            formData.append('weight', String(data.weight))

            // Verify photos meet EXACT resolution requirements before sending
            const { Image: RNImage } = require("react-native")
            
            const checkPhotoResolution = (photo: any, photoName: string): Promise<{ width: number; height: number }> => {
                return new Promise((resolve, reject) => {
                    const photoUri = photo.path?.startsWith('file://') 
                        ? photo.path 
                        : `file://${photo.path}`
                    
                    RNImage.getSize(
                        photoUri,
                        (width: number, height: number) => {
                            const isValid = 
                                (width === 1080 && height === 1920) ||
                                (width === 720 && height === 1280)
                            
                            if (!isValid) {
                                reject(new Error(
                                    `${photoName} resolution is ${width}×${height}. ` +
                                    `Required: exactly 1080×1920 or 720×1280. ` +
                                    `Please go back and retake the photo.`
                                ))
                            } else {
                                resolve({ width, height })
                            }
                        },
                        (error: any) => reject(error)
                    )
                })
            }

            // Get file info (size and format) for a photo
            const getPhotoFileInfo = async (photo: any): Promise<{ size: number; sizeMB: number; format: string }> => {
                const filePath = photo.path?.startsWith('file://') 
                    ? photo.path.replace('file://', '') 
                    : photo.path
                
                const fileStats = await RNFS.stat(filePath)
                const fileSize = fileStats.size || 0
                const sizeMB = fileSize / (1024 * 1024)
                
                // Get file format from extension
                const fileExtension = photo.path?.toLowerCase().split('.').pop() || 'unknown'
                let format = 'unknown'
                if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
                    format = 'JPEG'
                } else if (fileExtension === 'png') {
                    format = 'PNG'
                } else {
                    format = fileExtension.toUpperCase()
                }
                
                return { size: fileSize, sizeMB, format }
            }

            // Check both photos before submission - must be exact resolution
            let frontPhotoDimensions: { width: number; height: number } | null = null
            let rightPhotoDimensions: { width: number; height: number } | null = null
            let frontPhotoFileInfo: { size: number; sizeMB: number; format: string } | null = null
            let rightPhotoFileInfo: { size: number; sizeMB: number; format: string } | null = null
            
            try {
                frontPhotoDimensions = await checkPhotoResolution(frontPhoto, "Front photo")
                rightPhotoDimensions = await checkPhotoResolution(rightPhoto, "Right photo")
                
                // Get file info for both photos
                frontPhotoFileInfo = await getPhotoFileInfo(frontPhoto)
                rightPhotoFileInfo = await getPhotoFileInfo(rightPhoto)
                
                // Log the resolutions, file sizes, and formats of both images being sent to API
                console.log("=== Photo Details Being Sent to API ===")
                console.log(`Front Photo:`)
                console.log(`  - Resolution: ${frontPhotoDimensions.width} × ${frontPhotoDimensions.height}`)
                console.log(`  - File Size: ${frontPhotoFileInfo.size} bytes (${frontPhotoFileInfo.sizeMB.toFixed(2)} MB)`)
                console.log(`  - File Format: ${frontPhotoFileInfo.format}`)
                console.log(`Right Photo:`)
                console.log(`  - Resolution: ${rightPhotoDimensions.width} × ${rightPhotoDimensions.height}`)
                console.log(`  - File Size: ${rightPhotoFileInfo.size} bytes (${rightPhotoFileInfo.sizeMB.toFixed(2)} MB)`)
                console.log(`  - File Format: ${rightPhotoFileInfo.format}`)
                console.log("========================================")
            } catch (resolutionError: any) {
                showOkModal({
                    type: "error",
                    title: "Photo Resolution Error",
                    message: resolutionError.message
                })
                return
            }

            // Convert photos to file objects
            // For react-native-vision-camera, the photo object has a path property
            // The path might already include "file://" prefix or might not
            const frontPhotoUri = frontPhoto.path?.startsWith('file://') 
                ? frontPhoto.path 
                : `file://${frontPhoto.path}`
            
            const rightPhotoUri = rightPhoto.path?.startsWith('file://') 
                ? rightPhoto.path 
                : `file://${rightPhoto.path}`

            const frontPhotoFile = {
                uri: frontPhotoUri,
                type: 'image/jpeg',
                name: 'front_photo.jpg',
            }

            const rightPhotoFile = {
                uri: rightPhotoUri,
                type: 'image/jpeg',
                name: 'right_photo.jpg',
            }

            formData.append('frontPhoto', frontPhotoFile as any)
            formData.append('rightPhoto', rightPhotoFile as any)

            // Note: We are VALIDATING images meet backend requirements but NOT optimizing/resizing them
            // Backend requirements:
            // - Format: JPEG
            // - Resolution: 1080×1920 or 720×1280 (exact match required)
            // - Size: ≤ 3 MB
            // Images are sent as-is if they meet these requirements
            // If images don't meet requirements, validation fails and user must retake

            // Log final payload info before sending
            console.log("=== API Payload Info ===")
            console.log("User ID:", user?.id)
            console.log("Age:", data.age)
            console.log("Gender:", data.gender)
            console.log("Height:", data.height)
            console.log("Weight:", data.weight)
            console.log("Front Photo URI:", frontPhotoUri)
            console.log("Right Photo URI:", rightPhotoUri)
            if (frontPhotoDimensions && frontPhotoFileInfo) {
                console.log(`Front Photo:`)
                console.log(`  - Resolution: ${frontPhotoDimensions.width} × ${frontPhotoDimensions.height}`)
                console.log(`  - File Size: ${frontPhotoFileInfo.size} bytes (${frontPhotoFileInfo.sizeMB.toFixed(2)} MB)`)
                console.log(`  - File Format: ${frontPhotoFileInfo.format}`)
            }
            if (rightPhotoDimensions && rightPhotoFileInfo) {
                console.log(`Right Photo:`)
                console.log(`  - Resolution: ${rightPhotoDimensions.width} × ${rightPhotoDimensions.height}`)
                console.log(`  - File Size: ${rightPhotoFileInfo.size} bytes (${rightPhotoFileInfo.sizeMB.toFixed(2)} MB)`)
                console.log(`  - File Format: ${rightPhotoFileInfo.format}`)
            }
            console.log("=======================")

            await submit(formData).unwrap()
        } catch (error: any) {
            showOkModal({
                type: "error",
                title: "Error",
                message: error?.data?.message || "Failed to submit scan data. Please try again."
            })
        }
    }, [frontPhoto, rightPhoto, user, submit, showOkModal])

    return {
        schema: AVATAR_SCAN_FORM_SCHEMA,
        refs: {
            formik_ref
        },
        values: {
            initial,
            isLoading,
            frontPhoto,
        },
        functions: {
            onSubmit
        }
    }
}

export default useAvatarScanFormController

