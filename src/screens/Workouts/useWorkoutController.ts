import { useCallback } from "react";
import { useDebouncedSearch } from "../../hooks/useSearch";
import { useGetWorkoutQuery } from "../../redux/Apis/User";
import { navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";

const useWorkoutController = () => {

    const { search, debouncedSearch, onChange: onSearch } = useDebouncedSearch()

    const { data, isFetching: isLoading, refetch } = useGetWorkoutQuery({ search: debouncedSearch })

    const onPress = useCallback((id: number, title: string) => {
        navigate(ROUTES.WORKOUT_DETAILS, { id, title })
    }, [])

    return {
        values: {
            data: data?.data || [],
            isLoading,
            search
        },
        functions: {
            onReload: refetch,
            onPress,
            onSearch
        }
    }

}

export default useWorkoutController