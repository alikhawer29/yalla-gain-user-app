import { StyleSheet } from "react-native";
import colors from "../../utils/colors";
import { heightPixel, vw, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    bg_image: {
        height: heightPixel(220),
        width: vw * 80,
        position: "absolute",
        top: 0,
        left: vw * 10,
        right: vw * 10,
        zIndex: 0,
    },
    left_image: {
        height: heightPixel(136),
        width: widthPixel(54),
        position: "absolute",
        top: 0,
        left: 0,
        // zIndex: 1
    },
    right_image: {
        height: heightPixel(843),
        width: heightPixel(244),
        position: "absolute",
        top: 0,
        right: 0
    }
})

export default styles