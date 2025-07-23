import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";
import colors from "../../utils/colors";

const styles = StyleSheet.create({
    drawer_item_header: {
        marginVertical: heightPixel(6)
    },
    drawer_item: {
        borderRadius: heightPixel(12),
        paddingHorizontal: widthPixel(10),
        paddingVertical: heightPixel(10),
        marginVertical: heightPixel(1)
    },
    logout_button: {
        backgroundColor: colors.transparent,
        borderColor: colors.white,
        marginTop: heightPixel(30)
    }
})

export default styles