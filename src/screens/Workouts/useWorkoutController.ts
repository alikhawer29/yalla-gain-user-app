import { useCallback } from "react";
import { useGetWorkoutQuery } from "../../redux/Apis/User";
import { navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";

const useWorkoutController = () => {

    const { data, isFetching: isLoading, refetch } = useGetWorkoutQuery({})

    const onPress = useCallback((id: number, title: string) => {
        navigate(ROUTES.WORKOUT_DETAILS, { id, title })
    }, [])

    return {
        values: {
            data: data?.data || [],
            isLoading,
        },
        functions: {
            onReload: refetch,
            onPress
        }
    }

}

export default useWorkoutController