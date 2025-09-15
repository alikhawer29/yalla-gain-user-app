import { useEffect } from "react";
import { useStartExerciseMutation } from "../../redux/Apis/MovementCorrection";
import { useGetWorkoutQuery } from "../../redux/Apis/User";
import { capitalize } from "../../utils/helper";
import { navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";
import { EXERCISE_SCHEMA } from "../../utils/validators";

type TData = {
    exercise: string
}

const initial: TData = {
    exercise: ""
}

const useMovementCorrectionController = () => {

    const { data: workouts, isLoading: isDataLoading } = useGetWorkoutQuery({})
    const [start, { data, isLoading, isSuccess }] = useStartExerciseMutation()

    useEffect(() => {
        if (isSuccess) {
            if (data?.status === "started") {
                navigate(ROUTES.MOVEMENT_CORRECTION_CAMERA, { session_id: data?.session_id, exercise: capitalize(data?.exercise) })
            }
        }
    }, [isSuccess, data, isLoading])

    const onSubmit = (data: TData) => {
        start(JSON.stringify(data))
    }

    return {
        schema: EXERCISE_SCHEMA,
        values: {
            initial,
            dropdown_data: workouts?.data?.map((item: any) => ({ label: item?.title, value: item?.exercise_key || "barbell biceps curl" })) || [],
            isLoading,
            isDataLoading
        },
        functions: {
            onSubmit,
        }
    }

}

export default useMovementCorrectionController