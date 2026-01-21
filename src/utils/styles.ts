import { StyleSheet } from "react-native";
import colors from "./colors";
import { heightPixel } from "./helper";

const globalStyles = StyleSheet.create({
    list_header_component: {
        marginBottom: heightPixel(10)
    },
    overlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.light_transparent_primary,
        justifyContent: "center",
        alignItems: "center",
    },
})

export default globalStyles