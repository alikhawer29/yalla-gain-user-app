import { RNMediapipe } from '@thinksys/react-native-mediapipe'
import { View } from "react-native"
import WebView from 'react-native-webview'
import Button from "../../components/Button"
import NoPermission from "../../components/NoPermission"
import Row from "../../components/Row"
import Wrapper from '../../components/Wrapper'
import { vh, vw } from "../../utils/helper"
import { goBack } from '../../utils/navigation'
import FeedbackCard from "./FeedbackCard"
import styles from "./styles"
import useMovementCorrectionCameraController from "./useMovementCorrectionCameraController"

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
            checking,
            isStopLoading,
            exercise,
            session_id
        },
        functions: {
            onLandmark,
            onEnd
        }
    } = useMovementCorrectionCameraController()

    if (checking) return null

    if (!permission_granted) {
        return <NoPermission message={"Camera Permission is required"} />
    }

    if (!device) return null
    return (
        <Wrapper no_padding>
            <WebView
                source={{
                    uri: `https://front-end-exercise-nine.vercel.app/?session_id=${session_id}&exercise=${exercise}`,
                }}
                style={{ flex: 1, backgroundColor: "transparent" }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                allowFileAccess={true}
                originWhitelist={['*']}
                onMessage={(event) => {
                    let data = JSON.parse(event?.nativeEvent?.data)
                    if (data?.event === "stop_exercise") {
                        goBack()
                    }
                }}
                mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
            />
        </Wrapper>
    )

    return (
        <View style={styles.container}>
            <RNMediapipe
                width={vw * 100}
                height={vh * 100}
                // face={true}
                // leftArm={true}
                // rightArm={true}
                // leftWrist={true}
                // rightWrist={true}
                // torso={true}
                // leftLeg={true}
                // rightLeg={true}
                // leftAnkle={true}
                // rightAnkle={true}
                // face={false}
                onLandmark={onLandmark}
            />
            {/* <Camera
                ref={cameraRef}
                device={device}
                isActive={true}
                style={StyleSheet.absoluteFill}
                photo={true}
            /> */}
            <Row style={styles.actions_container}>
                <Button
                    text="End"
                    type="custom"
                    style={styles.end_button}
                    onPress={onEnd}
                    loading={isStopLoading}
                />
                <Button text="Video Recommendation" onPress={onEnd} />
            </Row>
            <FeedbackCard exercise={exercise} reps={reps} formOk={formOk} feedback={feedback} />
            {/* <View style={styles.feedback_container}>
                <Text size={16}>Reps: {reps}</Text>
                <Text size={16}>
                    Form: {formOk ? "Good" : formOk === false ? "Fix posture" : "--"}
                </Text>
                <Text size={16}>{feedback}</Text>
            </View> */}
        </View>
    )
}

export default MovementCorrectionCamera