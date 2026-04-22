import { useCallback, useEffect, useRef, useState } from "react"
import { Platform, StyleSheet, View } from "react-native"
import { Camera, useCameraDevice, useCameraFormat } from "react-native-vision-camera"
import { useRoute } from "@react-navigation/native"
import Text from "../../components/Text"
import Touchable from "../../components/Touchable"
import usePermissions from "../../hooks/usePermissions"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"
import { goBack, navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import images from "../../assets/images"
import NoPermission from "../../components/NoPermission"
import Icon from "../../components/Icon"
import Image from "../../components/Image"
import Row from "../../components/Row"
import Button from "../../components/Button"
import { useModal } from "../../contexts/ModalContext"
import { validatePhoto } from "../../utils/photoValidation"
import RNFS from "react-native-fs"
import { useAppSelector } from "../../hooks"
import { selectUser } from "../../redux/Slices/AuthSlice"
import { useScanAvatarMutation } from "../../redux/Apis/User"
import { optimizePhoto } from "../../utils/optimizePhoto"

const Scan = () => {
    const route = useRoute()
    const { formData } = (route.params as any) || {}
    const cameraRef = useRef<Camera>(null)
    const user = useAppSelector(selectUser)
    const { showOkModal, showYesNoModal } = useModal()
    const [submitScan, { isLoading: isSubmitting }] = useScanAvatarMutation()

    const [granted, setGranted] = useState(false)
    const [checking, setChecking] = useState(true)
    const [frontPhoto, setFrontPhoto] = useState<any>(null)
    const [rightPhoto, setRightPhoto] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState<'front' | 'right'>('front')
    const [validating, setValidating] = useState(false)

    const device = useCameraDevice("back")

    // Configure camera format to capture at required resolutions: 1080×1920 or 720×1280
    const format = useCameraFormat(device, [
        { photoResolution: { width: 1080, height: 1920 } },
        { photoResolution: { width: 720, height: 1280 } },
    ])

    const { ensurePermissions, PERMISSIONS } = usePermissions()

    useEffect(() => {

        const ask = async () => {

            const required = Platform.select({
                ios: [PERMISSIONS.IOS.CAMERA],
                android: [PERMISSIONS.ANDROID.CAMERA],
            }) || []

            const has_access = await ensurePermissions(required)
            setChecking(false)
            setGranted(has_access)

        }

        setTimeout(() => {
            ask()
        }, 500)

    }, [])

    const onScan = useCallback(async () => {
        try {
            setValidating(true)
            let res = await cameraRef?.current?.takePhoto({
                flash: 'off',
            })

            // Validate the photo (with tolerance for resolution and size)
            const validation = await validatePhoto(res)

            // Check for different types of errors
            const hasResolutionError = validation.errors.some(err => err.includes('resolution'))
            const hasFormatError = validation.errors.some(err => err.includes('JPEG') || err.includes('format'))
            const hasSizeError = validation.errors.some(err => err.includes('size') || err.includes('MB'))
            const hasExtremeSizeError = validation.errors.some(err => err.includes('too large') || err.includes('20 MB'))

            // Only reject if:
            // 1. Format is wrong (must be JPEG)
            // 2. File is extremely large (>20MB - might be corrupted)
            // 3. Photo is missing/invalid
            if (hasFormatError || hasExtremeSizeError || validation.errors.some(err => err.includes('missing') || err.includes('invalid'))) {
                showOkModal({
                    type: "error",
                    title: "Photo Requirements Not Met",
                    message: validation.errors.join("\n\n") + "\n\nPlease retake the photo."
                })
                setValidating(false)
                return
            }

            // Allow size errors (will be optimized before submission)
            if (hasSizeError) {
                console.log("📸 Camera photo is larger than 3MB - will be optimized before submission")
            }

            // Allow resolution errors if aspect ratio is correct (will be resized during optimization)
            if (hasResolutionError) {
                console.log("📸 Photo resolution doesn't match exactly but will be processed and resized")
            }

            // Note: Original captured images are NOT saved - only optimized images sent to API will be saved

            // Photo is valid or acceptable, set it
            if (currentStep === 'front') {
                setFrontPhoto(res)
            } else {
                setRightPhoto(res)
            }
            setValidating(false)
        } catch (error: any) {
            setValidating(false)
            showOkModal({
                type: "error",
                title: "Error",
                message: "Failed to capture photo. Please try again."
            })
        }
    }, [cameraRef, currentStep, showOkModal])

    const onRetake = useCallback(() => {
        if (currentStep === 'right' && rightPhoto) {
            setRightPhoto(null)
        } else if (currentStep === 'front' && frontPhoto) {
            setFrontPhoto(null)
        }
    }, [currentStep, frontPhoto, rightPhoto])

    const onNext = useCallback(() => {
        if (currentStep === 'front' && frontPhoto) {
            setCurrentStep('right')
        }
    }, [currentStep, frontPhoto])

    const submitScanAndNavigate = useCallback(async () => {
        if (frontPhoto && rightPhoto && formData) {
            try {
                const frontValidation = await validatePhoto(frontPhoto);
                const rightValidation = await validatePhoto(rightPhoto);

                const frontCriticalErrors = frontValidation.errors.filter(
                    err => !err.includes('resolution') && !err.includes('Resolution'),
                );
                const rightCriticalErrors = rightValidation.errors.filter(
                    err => !err.includes('resolution') && !err.includes('Resolution'),
                );

                if (frontCriticalErrors.length > 0 || rightCriticalErrors.length > 0) {
                    const allErrors = [
                        ...(frontCriticalErrors.length > 0
                            ? ['Front Photo: ' + frontCriticalErrors.join(', ')]
                            : []),
                        ...(rightCriticalErrors.length > 0
                            ? ['Right Photo: ' + rightCriticalErrors.join(', ')]
                            : []),
                    ];
                    showOkModal({
                        type: 'error',
                        title: 'Photo Validation Failed',
                        message:
                            'One or more photos have critical issues:\n\n' +
                            allErrors.join('\n\n') +
                            '\n\nPlease retake the photos.',
                    });
                    return;
                }

                const optimizedFrontPhoto = await optimizePhoto(frontPhoto, 'front');
                const optimizedRightPhoto = await optimizePhoto(rightPhoto, 'right');

                const submitFormData = new FormData();
                submitFormData.append('user_id', String(user?.id));
                submitFormData.append('age', String(formData.age));
                submitFormData.append('gender', formData.gender);
                submitFormData.append('height', String(formData.height));
                submitFormData.append('weight', String(formData.weight));
                submitFormData.append('scan', 'true');

                const frontPhotoPath = optimizedFrontPhoto.savedPath || optimizedFrontPhoto.path;
                const rightPhotoPath = optimizedRightPhoto.savedPath || optimizedRightPhoto.path;
                const frontPhotoUri = frontPhotoPath?.startsWith('file://') ? frontPhotoPath : `file://${frontPhotoPath}`;
                const rightPhotoUri = rightPhotoPath?.startsWith('file://') ? rightPhotoPath : `file://${rightPhotoPath}`;

                submitFormData.append('frontPhoto', {
                    uri: frontPhotoUri,
                    type: 'image/jpeg',
                    name: 'front_photo.jpg',
                } as any);
                submitFormData.append('rightPhoto', {
                    uri: rightPhotoUri,
                    type: 'image/jpeg',
                    name: 'right_photo.jpg',
                } as any);

                await submitScan(submitFormData).unwrap();
                navigate(ROUTES.CREATE_AVATAR);
            } catch (error: any) {
                showOkModal({
                    type: 'error',
                    title: 'Error',
                    message:
                        error?.data?.message ||
                        'Failed to submit scan data. Please try again.',
                });
            }
        }
    }, [frontPhoto, rightPhoto, formData, user, submitScan, showOkModal]);

    const onProceed = useCallback(() => {
        if (!frontPhoto || !rightPhoto) {
            return;
        }
        showYesNoModal(
            {
                type: 'warning',
                title: 'Precautions',
                message:
                    'Before proceeding, make sure the pictures are captured correctly, as you will not be able to make any changes for the next one week after proceeding.',
                yesText: 'Next',
                noText: 'Cancel',
            },
            () => {
                submitScanAndNavigate();
            },
            () => {
                setFrontPhoto(null);
                setRightPhoto(null);
                setCurrentStep('front');
            },
        );
    }, [frontPhoto, rightPhoto, showYesNoModal, submitScanAndNavigate]);

    if (checking) return null

    if (!granted) {
        return <NoPermission message={"Camera Permission is required"} />
    }

    if (!device) return null

    const currentPhoto = currentStep === 'front' ? frontPhoto : rightPhoto

    return (
        <>
            {
                currentPhoto ? (
                    <>
                        <Image source={{ uri: "file://" + currentPhoto?.path }} style={{ flex: 1 }} resize="cover" />
                        <Touchable onPress={goBack} style={{ position: "absolute", top: 50, left: widthPixel(20), zIndex: 10 }}>
                            <Icon source={images.back} size={28} tint_color={colors.white} />
                        </Touchable>
                        <View style={{ position: "absolute", top: 50, left: widthPixel(20), right: widthPixel(20), alignItems: "center" }}>
                            <Text color={colors.white} weight="bold" size={18}>
                                {currentStep === 'front' ? 'Front Picture' : 'Right Picture'}
                            </Text>
                        </View>
                        <Row style={{ position: "absolute", bottom: 80, left: widthPixel(20), right: widthPixel(20) }} justify="space-between">
                            <Button text="Retake" style={{ width: "49%" }} type="secondary" onPress={onRetake} disabled={isSubmitting} />
                            {currentStep === 'right' && rightPhoto ? (
                                <Button text="Proceed" style={{ width: "49%" }} onPress={onProceed} loading={isSubmitting} />
                            ) : (
                                <Button text="Next" style={{ width: "49%" }} onPress={onNext} />
                            )}
                        </Row>
                    </>
                ) :
                    <>
                        {
                            device && format &&
                            <Camera
                                ref={cameraRef}
                                device={device}
                                format={format}
                                style={StyleSheet.absoluteFill}
                                isActive={true}
                                photo={true}
                                preview={true}
                            />
                        }
                        <Touchable onPress={goBack} style={{ position: "absolute", top: 50, left: widthPixel(20), zIndex: 10 }}>
                            <Icon source={images.back} size={28} tint_color={colors.white} />
                        </Touchable>
                        <View style={{ position: "absolute", top: 50, left: widthPixel(20), right: widthPixel(20), alignItems: "center" }}>
                            <Text color={colors.white} weight="bold" size={18}>
                                {currentStep === 'front' ? 'Take Front Picture' : 'Take Right Picture'}
                            </Text>
                        </View>
                        <Touchable
                            onPress={onScan}
                            disabled={validating}
                            style={{ position: "absolute", bottom: 80, justifyContent: "center", alignItems: "center", gap: heightPixel(5), alignSelf: "center", opacity: validating ? 0.5 : 1 }}
                        >
                            <View style={{ height: heightPixel(75), width: heightPixel(75), borderRadius: heightPixel(40), borderWidth: heightPixel(1.5), borderColor: colors.white, padding: heightPixel(3) }}>
                                <View style={{ height: "100%", width: "100%", backgroundColor: colors.danger, borderRadius: heightPixel(40) }} />
                            </View>
                            <View style={{ backgroundColor: "yellow", paddingHorizontal: widthPixel(10), borderRadius: heightPixel(6) }}>
                                <Text color={colors.black} weight="bold" size={18}>
                                    {validating ? "Validating..." : "Scan"}
                                </Text>
                            </View>
                        </Touchable>
                    </>
            }

        </>
    )
}

export default Scan