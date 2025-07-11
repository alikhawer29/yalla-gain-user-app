import { StyleSheet } from "react-native";
import { heightPixel } from "../../../utils/helper";

const styles = StyleSheet.create({
    content_container: {
        flex: 0.5,
        alignItems: "center",
        justifyContent: "center"
    },
    image_container: {
        flex: 0.5,
        alignItems: "center",
        justifyContent: "center",
        padding: heightPixel(15)
    },
    image: {
        height: "100%",
        width: "100%",
        resizeMode: "contain"
    },
    progress_container: {
        flex: 0.7,
        justifyContent: "center",
    },
    text_container: {
        flex: 0.3,
        alignItems: "flex-end"
    }
})

export default styles