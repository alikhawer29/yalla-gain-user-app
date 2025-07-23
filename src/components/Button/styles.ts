import { StyleSheet } from "react-native"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"

const styles = StyleSheet.create({
    container: {
        height: heightPixel(51),
        minWidth: widthPixel(120),
        borderRadius: heightPixel(5),
        paddingHorizontal: widthPixel(25),
        backgroundColor: colors.primary,
        borderWidth: heightPixel(1),
        borderColor: colors.primary
    }
})

export default styles