import { StyleSheet } from "react-native";
import { heightPixel } from "../../../utils/helper";
import colors from "../../../utils/colors";

const styles = StyleSheet.create({
    container: {
        gap: heightPixel(10)
    },
    content_container: {
        flex: 0.6,
        height: "100%",
        justifyContent: "center"
    },
    image_container: {
        flex: 0.4,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
    },
    image_wrapper: {
        width: heightPixel(96),
        height: heightPixel(96),
        backgroundColor: colors.primary,
        borderRadius: heightPixel(200),
        justifyContent: "center",
        alignItems: "center",
        padding: heightPixel(18),
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "contain"
    },
})

export default styles