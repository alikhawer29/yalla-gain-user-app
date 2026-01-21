import { StyleSheet } from "react-native"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"

const styles = StyleSheet.create({
    buffering_overlay: {
        flex: 1,
        justifyContent: "center",
    },
    loader_container: {
        zIndex: 99,
        width: heightPixel(80),
        height: heightPixel(80),
        backgroundColor: colors.blackish_gray,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        alignSelf: "center",
    },
    loader: {
        width: heightPixel(30),
        height: heightPixel(30),
    },
    video: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: colors.transparent,
    },
})

export default styles