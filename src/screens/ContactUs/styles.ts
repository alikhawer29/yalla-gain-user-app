import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    button: {
        marginTop: heightPixel(50)
    },
    text: {
        marginHorizontal: widthPixel(30),
        marginBottom: heightPixel(30)
    }
})

export default styles