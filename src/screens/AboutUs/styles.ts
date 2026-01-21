import { StyleSheet } from "react-native";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(20),
        paddingBottom: heightPixel(40),
    },
    text: {
        lineHeight: heightPixel(22),
        marginBottom: heightPixel(20),
    },
    footerContainer: {
        marginTop: heightPixel(40),
        alignItems: 'center',
    },
    followRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: heightPixel(30),
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: colors.white,
    },
    followText: {
        marginHorizontal: widthPixel(15),
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: widthPixel(15),
    },
    socialIcon: {
        width: heightPixel(60),
        height: heightPixel(60),
        borderRadius: heightPixel(30),
        borderWidth: 1,
        // borderColor: colors.gray,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default styles;
