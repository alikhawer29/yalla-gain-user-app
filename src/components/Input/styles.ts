import { StyleSheet } from "react-native";
import fonts from "../../assets/fonts";
import colors from "../../utils/colors";
import { font, heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    container: {
        marginVertical: heightPixel(7.5),
        width: "100%"
    },
    label: {
        marginBottom: heightPixel(10),
        marginHorizontal: widthPixel(2)
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: heightPixel(1),
        borderColor: colors.white,
        borderRadius: heightPixel(5),
        paddingHorizontal: widthPixel(15),
        backgroundColor: colors.transparent,
        overflow: "hidden",
        gap: widthPixel(5)
    },
    input: {
        flex: 1,
        fontSize: font(14),
        fontFamily: fonts.sfpro.regular,
        color: colors.white,
        height: heightPixel(54)
    },
    multiline_input_container: {
        borderRadius: heightPixel(5),
    },
    multiline_input: {
        height: heightPixel(150),
    },
    focusedInputContainer: {
        borderColor: colors.primary,
    },
    error: {
        marginTop: heightPixel(4),
        marginLeft: widthPixel(15),
    },
});

export default styles