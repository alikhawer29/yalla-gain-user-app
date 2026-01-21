import { FC, memo } from "react"
import { View } from "react-native"
import { ICardWrapper } from "../../interfaces"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"
import Touchable from "../Touchable"
import styles from "./styles"

const CardWrapper: FC<ICardWrapper> = ({ children, height = "100%", width = "100%", padding = 0, border = false, border_color = colors.white, border_radius = 10, color = colors.gray, onPress }) => {

    const Component = onPress ? Touchable : View

    return (
        <Component onPress={onPress} style={[styles.container, {
            width: typeof width === "number" ? widthPixel(width) : width,
            height: typeof height === "number" ? heightPixel(height) : height,
            padding: heightPixel(padding),
            borderWidth: border ? heightPixel(1.5) : 0,
            borderColor: border_color,
            backgroundColor: color,
            borderRadius: heightPixel(border_radius ?? 10)
        }]}>
            {children}
        </Component>
    )
}

export default memo(CardWrapper)