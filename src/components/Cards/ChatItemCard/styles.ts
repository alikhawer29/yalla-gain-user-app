import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../../utils/helper";
import colors from "../../../utils/colors";

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginVertical: heightPixel(10),
        paddingHorizontal: 8,
        gap: 10
    },
    senderContainer: {
        justifyContent: "flex-end",
    },
    receiverContainer: {
        justifyContent: "flex-start",
    },
    avatar: {
        width: 35,
        height: 35,
        borderRadius: 18,
        marginRight: 6,
    },
    messageBubble: {
        maxWidth: "80%",
        borderRadius: 16,
        padding: 10,
    },
    senderBubble: {
        backgroundColor: colors.blackish_gray,
        borderTopRightRadius: 0,
    },
    receiverBubble: {
        backgroundColor: colors.blackish_gray,
        borderTopLeftRadius: 0,
    },
    messageText: {
        fontSize: 16,
        color: "#000",
    },
    timeText: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
        textAlign: "right",
    },
});

export default styles