import { useEffect } from "react";
import { useStartExerciseMutation } from "../../redux/Apis/MovementCorrection";
import { useGetWorkoutQuery } from "../../redux/Apis/User";
import { navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";
import { EXERCISE_SCHEMA } from "../../utils/validators";

const initial = {
    exercise: ""
}

const useMovementCorrectionController = () => {

    const { data: workouts } = useGetWorkoutQuery({})
    const [start, { data, isLoading, isSuccess }] = useStartExerciseMutation()

    useEffect(() => {
        if (isSuccess) {
            if (data?.status === "started") {
                navigate(ROUTES.MOVEMENT_CORRECTION_CAMERA, { session_id: data?.session_id })
            }
        }
    }, [isSuccess, data])

    const onSubmit = (data) => {
        start(JSON.stringify(data))
    }

    return {
        schema: EXERCISE_SCHEMA,
        values: {
            initial,
            dropdown_data: workouts?.data?.map((item: any) => ({ label: item?.title, value: item?.exercise_key || "barbell biceps curl" })) || [],
            isLoading,
        },
        functions: {
            onSubmit,
        }
    }

}

export default useMovementCorrectionController