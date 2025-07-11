import { StyleSheet } from "react-native";
import colors from "../../../utils/colors";
import { heightPixel, widthPixel } from "../../../utils/helper";

const styles = StyleSheet.create({
    container: {
        height: heightPixel(71),
        backgroundColor: colors.primary,
        borderRadius: heightPixel(10),
        paddingHorizontal: widthPixel(15),
        paddingVertical: heightPixel(10),
        gap: heightPixel(10),
        overflow: "hidden"
    },
    content_container: {
        flex: 0.75,
    },
    left_image_container: {
        flex: 0.15,
        justifyContent: "center",
        alignItems: "center",
    },
    right_image_container: {
        flex: 0.1,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "contain"
    },
    abstract_graphic: {
        height: heightPixel(120),
        width: heightPixel(120),
        borderRadius: heightPixel(120),
        position: "absolute",
        backgroundColor: colors.transparent_black,
    },
    top_graphic: {
        right: -widthPixel(40),
        bottom: heightPixel(20)
    },
    bottom_graphic: {
        right: -widthPixel(40),
        top: -heightPixel(10)
    },
})

export default styles