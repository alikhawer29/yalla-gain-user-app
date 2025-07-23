import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../../utils/helper";

const styles = StyleSheet.create({
    container: {
        height: "100%"
    },
    icon_container: {
        flex: 0.12
    },
    content_container: {
        flex: 0.88,
        height: "100%",
        justifyContent: "space-between"
    },
    badge: {
        paddingVertical: heightPixel(1),
        paddingHorizontal: widthPixel(26)
    }
})

export default styles