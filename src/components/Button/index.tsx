import { FC, memo } from "react"
import { IButton } from "../../interfaces"
import colors from "../../utils/colors"
import Text from "../Text"
import Touchable from "../Touchable"
import styles from "./styles"

const Button: FC<IButton> = ({ text, style, onPress, type = "primary", font_size = 16 }) => {

    const button_default_style = {
        ...(type === "outlined" ? { backgroundColor: colors.transparent } : type === "secondary" ? { backgroundColor: colors.white } : {})
    }

    return (
        <Touchable onPress={onPress} style={[styles.container, style, button_default_style]}>
            <Text size={font_size} weight="semibold" color={(type === "outlined" || type === "secondary") ? colors.primary : colors.white}>{text}</Text>
        </Touchable>
    )
}

export default memo(Button)