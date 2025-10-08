import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        right: widthPixel(10),
        bottom: heightPixel(10),
        zIndex: 99
    }
})

export default styles