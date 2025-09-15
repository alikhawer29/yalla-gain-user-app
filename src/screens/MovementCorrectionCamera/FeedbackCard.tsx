import { View, StyleSheet } from "react-native";
import Text from "../../components/Text";
import colors from "../../utils/colors";

export default function FeedbackCard({ reps, formOk, feedback }) {
    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.label}>Reps:</Text>
                <Text style={styles.value}>{reps}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Form:</Text>
                <Text
                    style={[
                        styles.value,
                        formOk === false ? styles.bad : styles.good,
                    ]}
                >
                    {formOk ? "Good" : formOk === false ? "Fix posture" : "--"}
                </Text>
            </View>
            <View style={styles.feedbackBox}>
                <Text style={styles.feedback}>{feedback}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        position: "absolute",
        bottom: 120,
        alignSelf: "center",
        width: "90%",
        backgroundColor: colors.light_primary,
        borderRadius: 12,
        padding: 16,
        margin: 16,
        // elevation: 3, // Android shadow
        // shadowColor: "#000", // iOS shadow
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        zIndex: 99
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#444",
    },
    value: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    good: {
        color: "green",
    },
    bad: {
        color: "red",
    },
    feedbackBox: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.gray,
        borderRadius: 8,
    },
    feedback: {
        fontSize: 14,
        color: "#555",
    },
});
