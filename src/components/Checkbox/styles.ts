import { StyleSheet } from "react-native";
import { heightPixel } from "../../utils/helper";
import colors from "../../utils/colors";

const styles = StyleSheet.create({
    container: {
        height: heightPixel(16),
        width: heightPixel(16),
        borderWidth: heightPixel(1.5),
        borderColor: colors.white,
        borderRadius: heightPixel(2),
        backgroundColor: colors.transparent,
        justifyContent: "center",
        alignItems: "center",
    }
})

export default styles