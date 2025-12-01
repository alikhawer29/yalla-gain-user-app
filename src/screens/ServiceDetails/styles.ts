import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    image_container: {
        height: heightPixel(200),
        borderRadius: heightPixel(12),
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    info_row: {
        paddingVertical: heightPixel(10),
    },
    charges_row: {
        marginTop: heightPixel(5),
    },
    description: {
        marginTop: heightPixel(10),
        lineHeight: heightPixel(22),
    },
});

export default styles;

