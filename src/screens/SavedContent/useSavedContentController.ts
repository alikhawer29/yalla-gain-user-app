import { useCallback, useEffect } from "react";
import useSearch from "../../hooks/useSearch";
import { useGetSavedContentQuery, useSaveVideoMutation } from "../../redux/Apis/User";
import { navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";

const useSavedContentController = () => {

    const { search, debouncedSearch, onChange: onSearch } = useSearch()

    const { data, isFetching: isLoading, refetch } = useGetSavedContentQuery({ search: debouncedSearch })
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
            search
        },
        functions: {
            onReload: refetch,
            onSave,
            onPress,
            onSearch
        }
    }

}

export default useSavedContentController