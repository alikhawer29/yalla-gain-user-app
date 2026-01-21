import { StyleSheet } from "react-native"
import { heightPixel, widthPixel } from "../../utils/helper"

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(6),
        borderRadius: heightPixel(6),
        gap: widthPixel(10)
    }
})

export default styles