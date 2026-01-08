import { useCallback, useEffect, useRef, useState } from "react"
import { Platform, StyleSheet, View } from "react-native"
import { Camera, useCameraDevice, useCameraFormat } from "react-native-vision-camera"
import Text from "../../components/Text"
import Touchable from "../../components/Touchable"
import usePermissions from "../../hooks/usePermissions"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import NoPermission from "../../components/NoPermission"
import Image from "../../components/Image"
import Row from "../../components/Row"
import Button from "../../components/Button"
import { useModal } from "../../contexts/ModalContext"
import { validatePhoto } from "../../utils/photoValidation"

const Scan = () => {

    const cameraRef = useRef<Camera>(null)

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
    const { showOkModal } = useModal()

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

            // Validate the photo (with tolerance for resolution)
            const validation = await validatePhoto(res)

            // If validation fails with resolution errors but has correct aspect ratio, allow it
            const hasResolutionError = validation.errors.some(err => err.includes('resolution'))
            const hasOtherErrors = validation.errors.some(err => !err.includes('resolution'))

            if (hasOtherErrors || (hasResolutionError && validation.errors.length > 1)) {
                // Has format or size errors, or multiple errors - show error
                showOkModal({
                    type: "error",
                    title: "Photo Requirements Not Met",
                    message: validation.errors.join("\n\n") + "\n\nPlease retake the photo."
                })
                setValidating(false)
                return
            }

            // If only resolution error but aspect ratio is correct, allow with warning
            if (hasResolutionError && !hasOtherErrors) {
                // Photo will be processed before submission, so allow it
                console.log("Photo resolution doesn't match exactly but will be processed")
            }

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

    const onProceed = useCallback(() => {
        if (frontPhoto && rightPhoto) {
            navigate(ROUTES.AVATAR_SCAN_FORM, {
                frontPhoto,
                rightPhoto
            })
        }
    }, [frontPhoto, rightPhoto])

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
                        <View style={{ position: "absolute", top: 50, left: widthPixel(20), right: widthPixel(20), alignItems: "center" }}>
                            <Text color={colors.white} weight="bold" size={18}>
                                {currentStep === 'front' ? 'Front Picture' : 'Right Picture'}
                            </Text>
                        </View>
                        <Row style={{ position: "absolute", bottom: 80, left: widthPixel(20), right: widthPixel(20) }} justify="space-between">
                            <Button text="Retake" style={{ width: "49%" }} type="secondary" onPress={onRetake} />
                            {currentStep === 'right' && rightPhoto ? (
                                <Button text="Proceed" style={{ width: "49%" }} onPress={onProceed} />
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