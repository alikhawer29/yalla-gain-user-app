import { StyleSheet } from "react-native"
import { heightPixel } from "../../utils/helper"

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text_wrapper: {
        width: "100%",
        marginTop: heightPixel(20),
        justifyContent: "center",
        alignItems: "center",
    },
    message: {
        marginTop: heightPixel(10),
        width: "80%",
    },
    buttons_row: {
        width: "100%",
        marginTop: heightPixel(20),
    },
})

export default styles