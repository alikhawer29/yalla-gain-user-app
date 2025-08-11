import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between"
    },
    row: {
        flex: 0.5,
        flexDirection: "row",
        width: "100%"
    },
    first: {
        flex: 0.45
    },
    second: {
        flex: 0.35
    },
    third: {
        flex: 0.2
    }
})

export default styles