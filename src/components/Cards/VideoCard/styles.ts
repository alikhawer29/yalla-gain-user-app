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
        resizeMode: "cover"
    },
    icon: {
        width: heightPixel(12),
        height: heightPixel(12),
        resizeMode: "contain",
    }
})

export default styles