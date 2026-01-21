import { FC, useCallback } from "react"
import { View } from "react-native"
import images from "../../assets/images"
import { IFloatingButton } from "../../interfaces"
import colors from "../../utils/colors"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import Icon from "../Icon"
import styles from "./styles"

const FloatingButton: FC<IFloatingButton> = ({ style }) => {

    const onPress = useCallback(() => {
        navigate(ROUTES.CHATBOT)
    }, [])

    return (
        <View style={[styles.container, style]}>
            <Icon source={images.chatbot} rounded less_padding size={55} color={colors.white} onPress={onPress} />
        </View>
    )
}

export default FloatingButton