import { FC, memo, useCallback, useState } from "react"
import { View } from "react-native"
import { useAppSelector } from "../../hooks"
import { selectUser } from "../../redux/Slices/AuthSlice"
import { getGreetingText } from "../../utils/helper"
import { navigateToAvatarForm } from "../../utils/navigation"

import Button from "../Button"
import Icon from "../Icon"
import Row from "../Row"
import Text from "../Text"
import styles from "./styles"
import { useNavigation } from "@react-navigation/native"
import { NAVIGATORS, ROUTES } from "../../utils/routes"
import { useModal } from "../../contexts/ModalContext"
import { userApi } from "../../redux/Apis/User"

const ProfileHeader: FC = () => {

    const user = useAppSelector(selectUser)

    const navigation = useNavigation<any>();
    const { showOkModal } = useModal()
    const [scanStatus, { isLoading: isLoadingScanStatus }] =
        userApi.useScanStatusMutation()
    const [avatarLoading, setAvatarLoading] = useState(false)

    const handlePress = () => {
        // Switch to the MyProfile bottom-tab stack, then show the MyProfile screen
        navigation.navigate(NAVIGATORS.MY_PROFILE_STACK, {
            screen: ROUTES.MY_PROFILE,
        });
    };

    const handleAvatarPress = useCallback(async () => {
        const userId = user?.id
        if (!userId) return

        try {
            setAvatarLoading(true)
            const res = await scanStatus(userId).unwrap()

            if (res?.can_scan) {
                navigateToAvatarForm()
                return
            }

            const nextScanAt = res?.next_scan_at
            showOkModal({
                type: "info",
                title: "Create Your Avatar",
                message: nextScanAt
                    ? (() => {
                        const dateOnly = String(nextScanAt).split(' ')[0]
                        return `User must wait until next eligible scan window.\nNext scan: ${dateOnly}`
                      })()
                    : "User must wait until next eligible scan window.",
            })
        } catch (e) {
            showOkModal({
                type: "error",
                title: "Error",
                message: "Failed to check scan status. Please try again.",
            })
        } finally {
            setAvatarLoading(false)
        }
    }, [scanStatus, showOkModal, user?.id])

    return (
        <Row align="center" style={styles.container}>
            <Row align="center" style={styles.content_container}>
                <View style={styles.image_container}>
                    <Icon source={{ uri: user?.photo }} size={50} rounded no_padding resize="cover" onPress={handlePress} />
                </View>
                <View style={styles.text_container}>
                    <Text size={13}>{getGreetingText()}</Text>
                    <Text weight="bold" size={18}>Hi, {user?.first_name} {user?.last_name} 👋</Text>
                </View>
            </Row>
            <View style={styles.button_container}>
                <Button
                    text="Avatar"
                    style={styles.button}
                    font_size={12}
                    onPress={handleAvatarPress}
                    loading={avatarLoading || isLoadingScanStatus}
                />
            </View>
        </Row>
    )
}

export default memo(ProfileHeader)