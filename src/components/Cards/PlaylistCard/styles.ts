import { StyleSheet } from "react-native";
import { heightPixel } from "../../../utils/helper";

const styles = StyleSheet.create({
    row_container: {
        height: "100%",
    },
    image: {
        height: heightPixel(70),
        width: heightPixel(70),
        resizeMode: "contain",
        borderRadius: heightPixel(10),
    },
})

export default styles