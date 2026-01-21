import { StyleSheet } from "react-native";
import { heightPixel } from "../../../utils/helper";

const styles = StyleSheet.create({
    playlist_title: {
        marginVertical: heightPixel(25),
    },
    auth_container: {
        flex: 1,
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
    },
    full_width_button: {
        width: "100%",
    },
    list_content: {
        paddingBottom: 30,
    },
    list_footer: {
        marginVertical: heightPixel(50)
    }
})

export default styles