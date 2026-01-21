import { StyleSheet } from "react-native";
import { heightPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    icon_container: {
        justifyContent: "center",
        alignItems: "center"
    },
    item_container: {
        flexWrap: 'wrap',
        marginVertical: heightPixel(30)
    },
    item_width: {
        width: "50%",
    },
    item: {
        marginBottom: heightPixel(20)
    }
})

export default styles