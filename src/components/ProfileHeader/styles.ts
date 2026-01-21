import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    container: {
        minHeight: heightPixel(50),
        width: "100%",
    },
    content_container: {
        flex: 0.7,
        height: "100%",
    },
    image_container: {
        width: "22%",
    },
    text_container: {
        width: "78%",
        paddingHorizontal: widthPixel(10)
    },
    button_container: {
        flex: 0.3,
        alignItems: "center",
        justifyContent: "center",
    },
    button: {
        height: heightPixel(35),
        minWidth: "100%",
        paddingHorizontal: widthPixel(10)
    }
})

export default styles