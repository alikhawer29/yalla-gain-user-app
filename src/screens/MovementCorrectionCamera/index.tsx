import { StyleSheet, View } from "react-native"
import { Camera } from "react-native-vision-camera"
import Button from "../../components/Button"
import Row from "../../components/Row"
import styles from "./styles"
import useMovementCorrectionCameraController from "./useMovementCorrectionCameraController"
import { goBack } from "../../utils/navigation"
import Text from "../../components/Text"
import NoPermission from "../../components/NoPermission"

const MovementCorrectionCamera = () => {

    const {
        refs: {
            cameraRef
        },
        values: {
            feedback,
            reps,
            formOk,
            device,
            permission_granted,
            checking
        },
    } = useMovementCorrectionCameraController()

    if (checking) return null

    if (!permission_granted) {
        return <NoPermission message={"Camera Permission is required"} />
    }

    if (!device) return null

    return (
        <View style={styles.container}>
            <Camera
                ref={cameraRef}
                device={device}
                isActive={true}
                style={StyleSheet.absoluteFill}
                photo={true}
            />
            <Row style={styles.actions_container}>
                <Button
                    text="End"
                    type="custom"
                    style={styles.end_button}
                    onPress={() => goBack()}
                />
                <Button text="Video Recommendation" onPress={() => goBack()} />
            </Row>
            <View style={styles.feedback_container}>
                <Text size={16}>Reps: {reps}</Text>
                <Text size={16}>
                    Form: {formOk ? "Good" : formOk === false ? "Fix posture" : "--"}
                </Text>
                <Text size={16}>{feedback}</Text>
            </View>
        </View>
    )
}

export default MovementCorrectionCamera