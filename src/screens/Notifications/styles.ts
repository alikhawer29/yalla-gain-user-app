import { StyleSheet } from "react-native";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    tabsContainer: {
        marginTop: heightPixel(20),
        marginBottom: heightPixel(20),
    },
    list: {
        paddingBottom: heightPixel(100),
    },
    card: {
        padding: heightPixel(15),
        borderRadius: heightPixel(15),
        marginBottom: heightPixel(15),
        borderWidth: 1,
        borderColor: colors.gray + '33', // Subtle border
    },
    unreadCard: {
        backgroundColor: colors.primary + '22', // Very light primary for unread
        borderColor: colors.primary + '55',
    },
    readCard: {
        backgroundColor: colors.gray + '11', // Very dark gray for read
    },
    message: {
        marginBottom: heightPixel(15),
    },
    footer: {
        alignItems: 'center',
    },
    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(10),
    },
    dateTimeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(5),
    },
    markButton: {
        textDecorationLine: 'underline',
    },
    tabItem: {
        paddingHorizontal: widthPixel(15),
        paddingVertical: heightPixel(8),
        borderRadius: heightPixel(5),
        borderWidth: 1,
        borderColor: colors.gray,
        marginRight: widthPixel(10),
    },
    selectedTabItem: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    }
});

export default styles;
