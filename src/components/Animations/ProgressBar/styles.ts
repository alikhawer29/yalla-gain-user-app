import { StyleSheet } from "react-native";
import colors from "../../../utils/colors";
import { heightPixel } from "../../../utils/helper";

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: heightPixel(4.5),
        backgroundColor: colors.dark_gray,
        borderRadius: heightPixel(25),
        overflow: "hidden"
    },
    bar: {
        backgroundColor: colors.primary,
        height: "100%"
    }
})

export default styles