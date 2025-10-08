import { StyleSheet } from "react-native";
import { heightPixel } from "../../utils/helper";
import colors from "../../utils/colors";

const styles = StyleSheet.create({
    icon_container: {
        justifyContent: "center",
        alignItems: "center"
    },
    button: {
        marginTop: heightPixel(20),
        width: "100%"
    },
    upload_container: {
        position: "absolute",
        right: 0,
        bottom: 0
    },
    image: {
        height: heightPixel(100),
        width: heightPixel(100),
        borderRadius: heightPixel(50),
        borderWidth: heightPixel(1),
        borderColor: colors.white
    }
})

export default styles