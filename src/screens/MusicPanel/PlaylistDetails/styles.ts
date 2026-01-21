import { StyleSheet } from "react-native"
import { heightPixel, widthPixel } from "../../../utils/helper"

const styles = StyleSheet.create({
    header_image: {
        height: heightPixel(300),
    },
    header_image_inner: {
        borderBottomLeftRadius: heightPixel(50),
        overflow: "hidden",
    },
    gradient: {
        flex: 1,
        borderBottomLeftRadius: heightPixel(50),
        padding: heightPixel(30),
        justifyContent: "flex-end",
    },
    content: {
        paddingHorizontal: widthPixel(20),
    },
    title_container: {
        marginVertical: heightPixel(30),
    }
})

export default styles