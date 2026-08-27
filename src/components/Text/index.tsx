import { Children, FC, memo, ReactNode } from "react"
import { Text as RNText, TextStyle } from "react-native"
import { IText } from "../../interfaces"
import colors from "../../utils/colors"
import { EMOJI_FONT_FAMILY, splitByEmoji } from "../../utils/emoji"
import { font } from "../../utils/helper"
import styles from "./styles"

const renderWithEmoji = (node: ReactNode): ReactNode => {
    return Children.map(node, (child, childIndex) => {
        if (typeof child !== "string") {
            return child
        }

        const parts = splitByEmoji(child)
        if (parts.every(part => !part.isEmoji)) {
            return child
        }

        return parts.map((part, partIndex) =>
            part.isEmoji ? (
                <RNText
                    key={`${childIndex}-${partIndex}`}
                    allowFontScaling={false}
                    style={{ fontFamily: EMOJI_FONT_FAMILY }}
                >
                    {part.value}
                </RNText>
            ) : (
                part.value
            )
        )
    })
}

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
            style={[style, styles[weight] ?? styles.regular, default_style]}
            onPress={onPress}
            numberOfLines={lines}
        >
            {renderWithEmoji(children)}
        </RNText>
    )
}

export default memo(Text)