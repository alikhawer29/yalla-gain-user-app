import { StyleSheet } from "react-native";
import { heightPixel } from "../../../utils/helper";

const styles = StyleSheet.create({
    image: {
        height: heightPixel(70),
        width: heightPixel(70),
        resizeMode: "cover",
        borderRadius: heightPixel(10),
    },
})

export default styles