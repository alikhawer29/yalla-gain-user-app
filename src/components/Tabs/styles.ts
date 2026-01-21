import { StyleSheet } from "react-native";
import { heightPixel } from "../../utils/helper";
import colors from "../../utils/colors";

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: heightPixel(50),
        backgroundColor: colors.light_primary,
        borderRadius: heightPixel(5),
        borderWidth: heightPixel(1),
        borderColor: colors.primary
    },
    item: {
        height: "100%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderColor: colors.primary
    },
    container_basic: {
        width: "100%",
        height: heightPixel(50),
    },
    item_basic: {
        height: "100%",
        // flex: 1,
        // justifyContent: "center",
        // alignItems: "center",
        // borderColor: colors.primary
    }
})

export default styles