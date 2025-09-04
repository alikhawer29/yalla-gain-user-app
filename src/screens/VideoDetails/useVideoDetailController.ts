import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { useStartExerciseMutation } from "../../redux/Apis/MovementCorrection";
import { useGetVideoDetailsQuery, useSaveVideoMutation } from "../../redux/Apis/User";
import { navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";

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

    useEffect(() => {
        if (isStartExerciseSuccess) {
            if (startExerciseData?.status === "started") {
                navigate(ROUTES.MOVEMENT_CORRECTION_CAMERA, { session_id: startExerciseData?.session_id })
            }
        }
    }, [isStartExerciseSuccess, startExerciseData])

    const onSave = useCallback((id: number) => {
        save(id)
    }, [])

    const onPressVideo = useCallback(() => {
        navigate(ROUTES.VIDEO_PLAYER, { video: data?.data?.video })
    }, [data])

    const onPressMovementCorrection = useCallback(() => {
        start(JSON.stringify({ exercise: data?.data?.exercise_key }))
    }, [data])

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