import { StyleSheet } from "react-native";
import { heightPixel } from "../../../utils/helper";

const styles = StyleSheet.create({
    content_container: {
        flex: 0.4,
        padding: heightPixel(8),
        justifyContent: "space-between"
    },
    image_container: {
        flex: 0.6,
        alignItems: "center",
        justifyContent: "center"
    },
    image: {
        height: "100%",
        width: "100%",
    },
    icon: {
        width: heightPixel(12),
        height: heightPixel(12),
        resizeMode: "contain",
    },
    save_icon: {
        position: "absolute",
        top: heightPixel(14),
        right: heightPixel(14)
    },
    secondary_save_icon: {
        top: heightPixel(5),
        right: heightPixel(5)
    }
})

export default styles