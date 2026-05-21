import { StyleSheet } from "react-native";
import { heightPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    heading: {
        marginVertical: heightPixel(20)
    },
    cancelled_note: {
        marginBottom: heightPixel(10),
        lineHeight: heightPixel(18),
    },
})

export default styles