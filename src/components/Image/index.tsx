import { FC, memo } from "react"
import { Image as RNImage } from "react-native"
import { IImage } from "../../interfaces"

const Image: FC<IImage> = ({ source, style }) => {
    return (
        <RNImage source={source} style={style} />
    )
}

export default memo(Image)