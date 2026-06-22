import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";
import colors from "../../utils/colors";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(20),
        paddingBottom: heightPixel(40),
    },
    itemContainer: {
        marginBottom: heightPixel(30),
    },
    question: {
        marginBottom: heightPixel(10),
    },
    answer: {
        lineHeight: heightPixel(20),
        marginBottom: heightPixel(20),
    },
    image: {
        width: "100%",
        height: heightPixel(250),
        borderRadius: heightPixel(15),
        marginTop: heightPixel(10),
    },
    video: {
        width: "100%",
        height: heightPixel(250),
        borderRadius: heightPixel(15),
        marginTop: heightPixel(10),
        backgroundColor: colors.blackish_gray,
        overflow: 'hidden',
        position: 'relative',
    },
    videoPlayer: {
        width: '100%',
        height: '100%',
    },
    videoPlayOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    videoPlayIcon: {
        width: heightPixel(60),
        height: heightPixel(60),
    },
});

export default styles;
