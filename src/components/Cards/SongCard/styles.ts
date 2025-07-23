import { StyleSheet } from "react-native";
import { heightPixel } from "../../../utils/helper";

const styles = StyleSheet.create({
    image: {
        height: heightPixel(60),
        width: heightPixel(60),
        resizeMode: "cover",
        borderRadius: heightPixel(10),
    },
})

export default styles