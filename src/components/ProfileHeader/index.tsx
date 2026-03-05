import { FC, memo } from "react"
import { View } from "react-native"
import { useAppSelector } from "../../hooks"
import { selectUser } from "../../redux/Slices/AuthSlice"
import { getGreetingText } from "../../utils/helper"
import Button from "../Button"
import Icon from "../Icon"
import Row from "../Row"
import Text from "../Text"
import styles from "./styles"
import { useNavigation } from "@react-navigation/native"
import { NAVIGATORS, ROUTES } from "../../utils/routes"

const ProfileHeader: FC = () => {

    const user = useAppSelector(selectUser)

    const navigation = useNavigation<any>();

    const handlePress = () => {
        // Switch to the MyProfile bottom-tab stack, then show the MyProfile screen
        navigation.navigate(NAVIGATORS.MY_PROFILE_STACK, {
            screen: ROUTES.MY_PROFILE,
        });
    };

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
                    onPress={handlePress}
                />
            </View>
        </Row>
    )
}

export default memo(ProfileHeader)