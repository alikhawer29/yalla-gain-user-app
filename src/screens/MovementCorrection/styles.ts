import { StyleSheet } from "react-native"
import { heightPixel } from "../../utils/helper"

const styles = StyleSheet.create({
    cover_container: {
        height: "30%",
    },
    cover_image: {
        borderRadius: heightPixel(10),
    },
    description: {
        marginTop: heightPixel(10),
    },
    dropdown_wrapper: {
        marginVertical: heightPixel(20),
    },
})

export default styles
