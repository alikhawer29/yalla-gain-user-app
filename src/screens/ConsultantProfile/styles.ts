import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    profile_header: {
        marginBottom: heightPixel(15),
    },
    profile_image_container: {
        width: widthPixel(120),
        height: heightPixel(140),
        borderRadius: heightPixel(10),
        overflow: "hidden",
    },
    profile_image: {
        width: "100%",
        height: "100%",
    },
    profile_info: {
        flex: 1,
        justifyContent: "space-between",
    },
    location_row: {
        marginBottom: heightPixel(10),
    },
    section_title: {
        marginBottom: heightPixel(10),
    },
    about_text: {
        lineHeight: heightPixel(22),
    },
    education_row: {
        marginBottom: heightPixel(15),
    },
});

export default styles;

