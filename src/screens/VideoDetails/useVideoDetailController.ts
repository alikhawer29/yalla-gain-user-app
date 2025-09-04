import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { useGetVideoDetailsQuery, useSaveVideoMutation } from "../../redux/Apis/User";
import { navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";
import { useStartExerciseMutation } from "../../redux/Apis/MovementCorrection";
import { Platform } from "react-native";
import { PERMISSIONS, request, RESULTS } from "react-native-permissions";

const useVideoDetailController = () => {

    const { params } = useRoute()

    const { data, isLoading, refetch } = useGetVideoDetailsQuery(params?.id)
    const [save, { isSuccess: saveSuccess }] = useSaveVideoMutation()
    const [start, { data: startExerciseData, isLoading: isStartExerciseLoading, isSuccess: isStartExerciseSuccess }] = useStartExerciseMutation()

    useEffect(() => {
        if (saveSuccess) {
            refetch()
        }
    }, [saveSuccess])

    const askPermissions = async () => {
        try {
            const cameraStatus = await request(
                Platform.OS === "ios"
                    ? PERMISSIONS.IOS.CAMERA
                    : PERMISSIONS.ANDROID.CAMERA
            );

            const micStatus = await request(
                Platform.OS === "ios"
                    ? PERMISSIONS.IOS.MICROPHONE
                    : PERMISSIONS.ANDROID.RECORD_AUDIO
            );

            if (cameraStatus === RESULTS.GRANTED && micStatus === RESULTS.GRANTED) {
                if (startExerciseData?.session_id) {
                    navigate(ROUTES.MOVEMENT_CORRECTION_CAMERA, { session_id: startExerciseData?.session_id })
                }
            } else {
            }
        } catch (error) {
            console.warn("Permission error:", error);
        }
    };

    useEffect(() => {
        if (isStartExerciseSuccess) {
            if (startExerciseData?.status === "started") {
                askPermissions()
            }
        }
    }, [isStartExerciseSuccess, startExerciseData])

    const onSave = useCallback((id: number) => {
        save(id)
    }, [])

    const onPressVideo = () => {
        navigate(ROUTES.VIDEO_PLAYER, { video: data?.data?.video })
    }

    const onPressMovementCorrection = () => {
        start(JSON.stringify({ exercise: data?.data?.exercise_key || "barbell biceps curl" }))
    }

    return {
        values: {
            data: data?.data || null,
            isLoading,
            isStartExerciseLoading
        },
        functions: {
            onSave,
            onPressVideo,
            onPressMovementCorrection
        }
    }

}

export default useVideoDetailController