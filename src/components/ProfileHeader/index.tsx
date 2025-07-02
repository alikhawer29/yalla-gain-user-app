import { FC, memo } from "react"
import { View } from "react-native"
import images from "../../assets/images"
import { USER } from "../../utils/data"
import { getGreetingText } from "../../utils/helper"
import Button from "../Button"
import Image from "../Image"
import Row from "../Row"
import Text from "../Text"
import styles from "./styles"

const ProfileHeader: FC = () => {
    return (
        <Row align="center" style={styles.container}>
            <Row align="center" style={styles.content_container}>
                <View style={styles.image_container}>
                    <Image source={images.dummy} style={styles.image} />
                </View>
                <View>
                    <Text size={13}>{getGreetingText()}</Text>
                    <Text weight="bold" size={18}>Hi, {USER.first_name} {USER.last_name} 👋</Text>
                </View>
            </Row>
            <View style={styles.button_container}>
                <Button text="Change Avatar" style={styles.button} font_size={12} />
            </View>
        </Row>
    )
}

export default memo(ProfileHeader)