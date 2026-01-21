import { StyleSheet } from "react-native";
import { heightPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    container: {
        padding: heightPixel(20),
        justifyContent: "center",
        alignItems: "center"
    },
    icon: {
        marginBottom: heightPixel(10)
    }
})

export default styles