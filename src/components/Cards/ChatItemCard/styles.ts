import { StyleSheet } from "react-native";
import colors from "../../../utils/colors";
import { heightPixel } from "../../../utils/helper";

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        maxWidth: "90%",
    },
    sender_container: {
        flexDirection: "row-reverse",
        alignSelf: "flex-end",
    },
    receiver_container: {
        alignSelf: "flex-start",
    },
    message_bubble: {
        width: "80%",
        borderRadius: heightPixel(10),
        padding: heightPixel(10),
        marginTop: heightPixel(8),
        backgroundColor: colors.blackish_gray,
    },
    sender_bubble: {
        borderTopRightRadius: 0,
    },
    receiver_bubble: {
        borderTopLeftRadius: 0,
    },
    tailLeft: {
        position: 'absolute',
        top: 0,
        left: -16,
        transform: [{rotate: '180deg'}],
        zIndex: 99
    },
    tailRight: {
        position: 'absolute',
        top: 0,
        right: -16,
        transform: [{rotate: '180deg'}],
        zIndex: 99
    },
});

export default styles