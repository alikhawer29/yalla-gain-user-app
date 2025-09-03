import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { useGetVideoDetailsQuery, useSaveVideoMutation } from "../../redux/Apis/User";

const useVideoDetailController = () => {

    const { params } = useRoute()

    const { data, isLoading, refetch } = useGetVideoDetailsQuery(params?.id)
    const [save, { isSuccess: saveSuccess }] = useSaveVideoMutation()

    useEffect(() => {
        if (saveSuccess) {
            refetch()
        }
    }, [saveSuccess])

    const onSave = useCallback((id: number) => {
        save(id)
    }, [])

    return {
        values: {
            data: data?.data || null,
            isLoading,
        },
        functions: {
            onSave
        }
    }

}

export default useVideoDetailController