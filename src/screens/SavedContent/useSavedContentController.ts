import { useCallback, useEffect } from "react";
import { useGetSavedContentQuery, useSaveVideoMutation } from "../../redux/Apis/User";
import { navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";

const useSavedContentController = () => {

    const { data, isFetching: isLoading, refetch } = useGetSavedContentQuery({})
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
            onPress
        }
    }

}

export default useSavedContentController