import { useCallback, useEffect, useRef, useState } from "react"
import { Platform, StyleSheet, View } from "react-native"
import { Camera, useCameraDevice } from "react-native-vision-camera"
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

const Scan = () => {

    const cameraRef = useRef<Camera>(null)

    const [granted, setGranted] = useState(false)
    const [checking, setChecking] = useState(true)
    const [photo, setPhoto] = useState(null)

    const device = useCameraDevice("back")

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
        let res = await cameraRef?.current?.takePhoto()
        setPhoto(res)
    }, [cameraRef])

    if (checking) return null

    if (!granted) {
        return <NoPermission message={"Camera Permission is required"} />
    }

    if (!device) return null

    return (
        <>
            {
                photo ? (
                    <>
                        <Image source={{ uri: "file://" + photo?.path }} style={{ flex: 1 }} resize="cover" />
                        <Row style={{ position: "absolute", bottom: 80, left: widthPixel(20), right: widthPixel(20) }} justify="space-between">
                            <Button text="Retake" style={{ width: "49%" }} type="secondary" onPress={() => setPhoto(null)} />
                            <Button text="Proceed" style={{ width: "49%" }} onPress={() => navigate(ROUTES.CREATE_AVATAR)} />
                        </Row>
                    </>
                ) :
                    <>
                        {
                            device &&
                            <Camera
                                ref={cameraRef}
                                device={device}
                                style={StyleSheet.absoluteFill}
                                isActive={true}
                                photo={true}
                                preview={true}
                            />
                        }
                        <Touchable onPress={onScan} style={{ position: "absolute", bottom: 80, justifyContent: "center", alignItems: "center", gap: heightPixel(5), alignSelf: "center" }}>
                            <View style={{ height: heightPixel(75), width: heightPixel(75), borderRadius: heightPixel(40), borderWidth: heightPixel(1.5), borderColor: colors.white, padding: heightPixel(3) }}>
                                <View style={{ height: "100%", width: "100%", backgroundColor: colors.danger, borderRadius: heightPixel(40) }} />
                            </View>
                            <View style={{ backgroundColor: "yellow", paddingHorizontal: widthPixel(10), borderRadius: heightPixel(6) }}>
                                <Text color={colors.black} weight="bold" size={18}>Scan</Text>
                            </View>
                        </Touchable>
                    </>
            }

        </>
    )
}

export default Scan