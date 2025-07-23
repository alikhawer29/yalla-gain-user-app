import { memo } from "react"
import LoaderKitView from "react-native-loader-kit"
import colors from "../../utils/colors"
import { View } from "react-native"

const Loader = ({ color = colors.white, type = "BallPulse" }) => {
    return (
        <LoaderKitView
            style={{ width: 30, height: 30, alignSelf: "center" }}
            name={type}
            animationSpeedMultiplier={1.0}
            color={color}
        />
    )
}

export default memo(Loader)