import { StyleSheet } from "react-native";
import { heightPixel } from "../../../utils/helper";

const styles = StyleSheet.create({
    container: {
        gap: heightPixel(10)
    },
    content_container: {
        flex: 0.6,
        height: "100%",
        justifyContent: "space-evenly"
    },
    image_container: {
        flex: 0.4,
        borderRadius: heightPixel(20),
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover"
    },
})

export default styles