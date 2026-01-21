import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    logo: {
        height: heightPixel(105),
        width: "100%",
        resizeMode: "contain",
        zIndex: 99,
        marginTop: heightPixel(50),
    },
    title_wrapper: {
        marginTop: heightPixel(60),
        alignItems: "center",
        paddingHorizontal: widthPixel(30),
    },
    subtitle: {
        marginTop: heightPixel(8),
    },
    form_wrapper: {
        marginTop: heightPixel(25),
    },
    button: {
        width: "100%",
    },
    back_to_login: {
        marginTop: heightPixel(125),
    },
});

export default styles