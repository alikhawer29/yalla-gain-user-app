import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { useGetVideosByWorkoutQuery, useSaveVideoMutation } from "../../redux/Apis/User";
import { navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";

const useWorkoutDetailController = () => {

    const { params } = useRoute()

    const { data, isFetching: isLoading, refetch } = useGetVideosByWorkoutQuery(params?.id)
    const [save, { isSuccess: saveSuccess }] = useSaveVideoMutation()

    useEffect(() => {
        if (saveSuccess) {
            refetch()
        }
    }, [saveSuccess])

    const onSave = useCallback((id: number) => {
        save(id)
    }, [])

    const onPress = useCallback((id: number) => {
        navigate(ROUTES.VIDEO_DETAILS, { id })
    }, [])

    return {
        values: {
            data: data?.data || [],
            isLoading,
        },
        functions: {
            onReload: refetch,
            onSave,
            onPress,
        }
    }

}

export default useWorkoutDetailController