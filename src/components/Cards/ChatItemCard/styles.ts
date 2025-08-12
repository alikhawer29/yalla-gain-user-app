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
        justifyContent: "flex-end",
    },
    receiver_container: {
        justifyContent: "flex-start",
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
});

export default styles