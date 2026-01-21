import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";
import colors from "../../utils/colors";

const styles = StyleSheet.create({
    container: {
        // paddingHorizontal: widthPixel(20),
        paddingBottom: heightPixel(20),
    },
    subtitle: {
        textAlign: 'right',
        marginTop: heightPixel(10),
        marginBottom: heightPixel(30),
        lineHeight: 24,
    },
    label: {
        marginBottom: heightPixel(8),
    },
    asterisk: {
        color: colors.danger,
    },
    inputContainer: {
        marginBottom: heightPixel(20),
    },
    submitButton: {
        marginTop: heightPixel(10),
    }
});

export default styles;