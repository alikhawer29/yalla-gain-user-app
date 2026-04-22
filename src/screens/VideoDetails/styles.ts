import { StyleSheet } from "react-native"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"

const styles = StyleSheet.create({
    thumbnail_wrapper: {
        overflow: "hidden",
        width: "100%",
        height: heightPixel(240),
        marginVertical: heightPixel(25),
        borderRadius: heightPixel(20),
        borderWidth: 1,
        borderColor: colors.white,
    },
    thumbnail_image: {
        height: "100%",
        width: "100%",
    },
    title_wrapper: {
        gap: heightPixel(10),
        marginBottom: heightPixel(6),
    },
    section: {
        marginVertical: heightPixel(6),
    },
    similar_videos_title: {
        marginVertical: heightPixel(14),
    },
})

export default styles