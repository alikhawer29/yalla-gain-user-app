import { FC, memo } from "react"
import { View, ViewStyle } from "react-native"
import { IIcon } from "../../interfaces"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"
import Image from "../Image"
import Touchable from "../Touchable"
import styles from "./styles"

const Icon: FC<IIcon> = props => {

    const {
        size = 28,
        color = colors.transparent,
        source,
        rounded = false,
        tint_color,
        onPress,
        border,
        less_padding = false,
        less_rounded = false,
        no_padding = false,
        rotate = false,
        resize = "contain"
    } = props

    let default_styles = {
        ...(rounded ? { borderRadius: typeof size === "string" ? size : heightPixel(less_rounded ? 10 : size * 2), padding: no_padding ? 0 : typeof size === "string" ? size : heightPixel(size / (less_padding ? 5 : 3.5)) } : {}),
        ...(border ? { borderWidth: heightPixel(1), borderColor: border } : {}),
        ...(size ? { height: typeof size === "string" ? size : heightPixel(size), width: typeof size === "string" ? size : heightPixel(size), } : {}),
        backgroundColor: color,
        overflow: "hidden"
    } as ViewStyle

    let icon_style = {
        ...(tint_color ? { tintColor: tint_color } : {}),
        ...(rotate ? {
            transform: [{ rotate: '90deg' }],
        } : {}),
    }

    let Component = onPress ? Touchable : View

    return (
        <Component onPress={onPress} style={[styles.container, default_styles]}>
            <Image source={source} style={[styles.icon, icon_style]} resize={resize} />
        </Component>
    )
}

export default memo(Icon)