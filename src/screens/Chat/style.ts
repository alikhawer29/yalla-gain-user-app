import { StyleSheet } from "react-native"
import { heightPixel } from "../../utils/helper"

const SPACING = 15

const styles = StyleSheet.create({
    list_header: {
        marginBottom: heightPixel(SPACING)
    },
    header_container: {
        gap: heightPixel(SPACING)
    },
    filter_container: {
        flex: 0.15,
        justifyContent: "center",
        alignItems: "flex-end"
    },
    search_container: {
        flex: 0.85
    }
})

export default styles