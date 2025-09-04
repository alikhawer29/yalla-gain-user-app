import { StyleSheet } from "react-native"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    actions_container: {
        width: "100%",
        padding: 10,
        justifyContent: "space-between",
        position: "absolute",
        bottom: heightPixel(40)
    },
    end_button: {
        backgroundColor: colors.danger,
        borderColor: colors.danger,
    },
    feedback_container: {
        padding: widthPixel(20),
        backgroundColor: "rgba(0,0,0,0.4)",
        position: "absolute",
        bottom: heightPixel(120),
        left: 0,
        right: 0
    }
})

export default styles