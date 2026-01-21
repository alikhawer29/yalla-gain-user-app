import { FC, memo } from "react"
import LoaderKitView from "react-native-loader-kit"
import { ILoader } from "../../interfaces"
import colors from "../../utils/colors"
import styles from "./styles"

const Loader: FC<ILoader> = ({ color = colors.white, type = "BallPulse" }) => {
    return (
        <LoaderKitView
            style={styles.loader}
            name={type}
            animationSpeedMultiplier={1.0}
            color={color}
        />
    )
}

export default memo(Loader)