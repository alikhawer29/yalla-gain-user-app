import { StyleSheet } from "react-native";
import { heightPixel } from "../../../utils/helper";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title_container: {
        flex: 0.3
    },
    content_container: {
        flex: 0.7,
        gap: heightPixel(6)
    },
    progress_container: {
        flex: 0.5,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    image_container: {
        flex: 0.5,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        height: "100%",
        width: "100%",
        resizeMode: "contain"
    },
    progress: {
        marginTop: heightPixel(20)
    }
})

export default styles