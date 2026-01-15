import { View, Platform } from "react-native"
import { useState, useEffect } from "react"
import Button from "../../components/Button"
import Icon from "../../components/Icon"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import { useAppSelector } from "../../hooks"
import { selectUser } from "../../redux/Slices/AuthSlice"
import colors from "../../utils/colors"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import { getUnityGameFileInfo } from "../../utils/unityGameData"
import { useModal } from "../../contexts/ModalContext"
import styles from "./styles"

const MyProfile = () => {
    const user = useAppSelector(selectUser)
    const { showOkModal } = useModal()
    const [unityFileInfo, setUnityFileInfo] = useState<any>(null)
    const [isCheckingUnityFile, setIsCheckingUnityFile] = useState(false)

    const checkUnityFile = async () => {
        setIsCheckingUnityFile(true)
        try {
            const info = await getUnityGameFileInfo()
            setUnityFileInfo(info)

            if (info.exists) {
                showOkModal({
                    type: 'success',
                    title: 'Unity Game File Status',
                    message: `✅ File exists!\n\n📁 Path:\n${info.path}\n\n👤 User ID: ${info.user_id}\n\n📄 Content:\n${info.content}`,
                })
            } else {
                showOkModal({
                    type: 'error',
                    title: 'Unity Game File Status',
                    message: `❌ File not found!\n\n📁 Expected Path:\n${info.path}\n\n⚠️ Error: ${info.error || 'File does not exist'}\n\n💡 Make sure you are logged in.`,
                })
            }
        } catch (error: any) {
            showOkModal({
                type: 'error',
                title: 'Error',
                message: `Failed to check Unity file: ${error?.message || 'Unknown error'}`,
            })
        } finally {
            setIsCheckingUnityFile(false)
        }
    }

    useEffect(() => {
        // Check file status on mount
        if (Platform.OS === 'android' && user?.id) {
            getUnityGameFileInfo().then(setUnityFileInfo)
        }
    }, [user?.id])

    return (
        <Wrapper bottom_bar floating scrollable>
            <View style={styles.icon_container}>
                <Icon source={{ uri: user?.photo }} size={100} rounded no_padding resize="cover" />
            </View>
            <Row style={styles.item_container}>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>User's Unique Id</Text>
                    <Text weight="bold">{user?.id}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>First Name</Text>
                    <Text weight="bold">{user?.first_name}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Last Name</Text>
                    <Text weight="bold">{user?.last_name}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Phone Number</Text>
                    <Text weight="bold">({user?.dialing_code}) {user?.phone}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray} lines={1}>Email Address</Text>
                    <Text weight="bold">{user?.email}</Text>
                </View>
                {
                    user?.dob &&
                    <View style={[styles.item, styles.item_width]}>
                        <Text color={colors.icon_gray}>DOB</Text>
                        <Text weight="bold">{user?.dob}</Text>
                    </View>
                }
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Language</Text>
                    <Text weight="bold" capitalize>{user?.language}</Text>
                </View>
            </Row>

            {/* Unity Game File Status (Android only) */}
            {/* {Platform.OS === 'android' && (
                <View style={[styles.item, { marginTop: 20, padding: 15, backgroundColor: colors.blackish_gray, borderRadius: 10 }]}>
                    <Text weight="semibold" size={16} style={{ marginBottom: 10 }}>
                        Unity Game Data Status
                    </Text>
                    {unityFileInfo ? (
                        <View>
                            <Row align="center" gap={8} style={{ marginBottom: 8 }}>
                                <Text color={unityFileInfo.exists ? colors.success : colors.danger}>
                                    {unityFileInfo.exists ? '✅' : '❌'}
                                </Text>
                                <Text color={colors.icon_gray}>
                                    File {unityFileInfo.exists ? 'exists' : 'not found'}
                                </Text>
                            </Row>
                            {unityFileInfo.exists && (
                                <View style={{ marginTop: 5 }}>
                                    <Text size={12} color={colors.icon_gray}>
                                        User ID: <Text color={colors.white} weight="bold">{unityFileInfo.user_id}</Text>
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <Text size={12} color={colors.icon_gray}>
                            Checking file status...
                        </Text>
                    )}
                    <Button
                        text={isCheckingUnityFile ? "Checking..." : "Check Unity File Status"}
                        type="outlined"
                        style={{ marginTop: 10 }}
                        onPress={checkUnityFile}
                        loading={isCheckingUnityFile}
                    />
                    <Text size={11} color={colors.icon_gray} style={{ marginTop: 10, fontStyle: 'italic' }}>
                        💡 To view file on device: Use a file manager app and navigate to Android/data/com.blitzapp.yallagain/files/MyGameSaves/userData.json
                    </Text>
                </View>
            )} */}

            <Button text="Edit Profile" style={styles.item} onPress={() => navigate(ROUTES.EDIT_PROFILE)} />
            <Button text="Change Password" type="outlined" style={styles.item} onPress={() => navigate(ROUTES.CHANGE_PASSWORD)} />
        </Wrapper>
    )
}

export default MyProfile