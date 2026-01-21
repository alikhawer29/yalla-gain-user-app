import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(20),
        paddingBottom: heightPixel(40),
    },
    text: {
        lineHeight: heightPixel(22),
        marginBottom: heightPixel(20),
    },
    image: {
        width: "100%",
        height: heightPixel(280),
        borderRadius: heightPixel(15),
        marginTop: heightPixel(10),
    }
});

export default styles;
