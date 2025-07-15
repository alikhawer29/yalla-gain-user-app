import { FC, memo } from "react"
import { View } from "react-native"
import { ISeperator } from "../../interfaces"
import { heightPixel, widthPixel } from "../../utils/helper"

const Seperator: FC<ISeperator> = ({ size = 10, horizontal = false }) => {

    let default_style = {
        height: horizontal ? 0 : heightPixel(size),
        width: horizontal ? widthPixel(size) : 0
    }

    return (
        <View style={default_style} />
    )
}

export default memo(Seperator)