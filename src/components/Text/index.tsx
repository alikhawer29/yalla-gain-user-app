import { FC, memo } from "react"
import { Text as RNText, TextStyle } from "react-native"
import { IText } from "../../interfaces"
import colors from "../../utils/colors"
import { font } from "../../utils/helper"
import styles from "./styles"

const Text: FC<IText> = ({
    children,
    weight = "regular",
    size = 14,
    style,
    color = colors.white,
    line_height = 22,
    underline = false,
    onPress,
    position,
    lines,
    capitalize = false
}) => {

    let default_style: TextStyle = {
        fontSize: font(size),
        color: color,
        lineHeight: font(line_height),
        textDecorationLine: underline ? "underline" : "none",
        textAlign: position,
        textTransform: capitalize ? "capitalize" : "none"
    }

    return (
        <RNText
            allowFontScaling={false}
            style={[style, styles[weight], default_style]}
            onPress={onPress}
            numberOfLines={lines}
        >
            {children}
        </RNText>
    )
}

export default memo(Text)