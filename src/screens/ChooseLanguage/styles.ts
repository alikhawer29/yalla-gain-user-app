import { StyleSheet } from "react-native";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(20),
    },
    description: {
        marginBottom: heightPixel(40),
        lineHeight: heightPixel(22),
    },
    label: {
        marginBottom: heightPixel(15),
    },
    dropdownContainer: {
        zIndex: 100,
        marginBottom: heightPixel(300), // Space for absolute dropdown
    },
    dropdownHeader: {
        height: heightPixel(56),
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: heightPixel(8),
        paddingHorizontal: widthPixel(15),
    },
    dropdownList: {
        position: 'absolute',
        top: heightPixel(60),
        left: 0,
        right: 0,
        backgroundColor: colors.blackish_gray,
        borderRadius: heightPixel(8),
        borderWidth: 1,
        borderColor: colors.gray,
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: heightPixel(15),
        borderBottomWidth: 1,
        borderBottomColor: colors.gray + '33',
    },
    applyButton: {
        marginTop: heightPixel(30),
    }
});

export default styles;
