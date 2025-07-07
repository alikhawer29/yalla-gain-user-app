import { StyleSheet } from "react-native";
import { heightPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    item_container: {
        flexWrap: 'wrap'
    },
    item_width: {
        width: "50%",
    },
    item: {
        marginBottom: heightPixel(20)
    },
    button: {
        marginTop: heightPixel(50)
    }
})

export default styles