import { FC, memo } from "react"
import { View, ViewStyle } from "react-native";
import { IRow } from "../../interfaces";
import Touchable from "../Touchable";
import { widthPixel } from "../../utils/helper";

const Row: FC<IRow> = ({
    children,
    align = "flex-start",
    justify = "flex-start",
    onPress,
    gap,
    style
}) => {

    let default_style: ViewStyle = {
        flexDirection: "row",
        alignItems: align,
        justifyContent: justify,
    }

    if (gap) default_style.gap = widthPixel(gap)

    const Component = onPress ? Touchable : View

    return (
        <Component style={[default_style, style]} onPress={onPress}>
            {children}
        </Component>
    )
}

export default memo(Row)