import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    container: {
        height: heightPixel(50),
        width: "100%",
        marginTop: heightPixel(120)
    },
    content_container: {
        flex: 0.7,
        height: "100%",
        gap: widthPixel(10)
    },
    image_container: {
        height: heightPixel(50),
        width: heightPixel(50),
        borderRadius: heightPixel(25)
    },
    image: {
        height: "100%",
        width: "100%",
        resizeMode: "contain"
    },
    button_container: {
        flex: 0.3,
        height: "100%",
        alignItems: "center",
        justifyContent: "center"
    },
    button: {
        height: heightPixel(35),
        minWidth: "100%",
        paddingHorizontal: widthPixel(10)
    }
})

export default styles