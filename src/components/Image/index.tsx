import { FC, memo } from "react"
import { Image as RNImage } from "react-native"
import { IImage } from "../../interfaces"
import styles from "./styles"

const Image: FC<IImage> = ({ source, style, resize = "contain" }) => {
    return (
        <RNImage source={source} style={[styles.container, style]} resizeMode={resize} />
    )
}

export default memo(Image)