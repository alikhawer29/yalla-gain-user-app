import { FC, memo } from "react"
import { View } from "react-native"
import { useAppSelector } from "../../hooks"
import { selectUser } from "../../redux/Slices/AuthSlice"
import { getGreetingText } from "../../utils/helper"
import { navigate } from "../../utils/navigation"
import { NAVIGATORS, ROUTES } from "../../utils/routes"
import Button from "../Button"
import Icon from "../Icon"
import Row from "../Row"
import Text from "../Text"
import styles from "./styles"

const ProfileHeader: FC = () => {

    const user = useAppSelector(selectUser)

    return (
        <Row align="center" style={styles.container}>
            <Row align="center" style={styles.content_container}>
                <View style={styles.image_container}>
                    <Icon source={{ uri: user?.photo }} size={50} rounded no_padding resize="cover" />
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
                    onPress={() =>
                        navigate(NAVIGATORS.DRAWER as any, {
                            screen: NAVIGATORS.AVATAR_STACK,
                            params: {
                                screen: ROUTES.AVATAR_SCAN_FORM,
                            },
                        })
                    }
                />
            </View>
        </Row>
    )
}

export default memo(ProfileHeader)