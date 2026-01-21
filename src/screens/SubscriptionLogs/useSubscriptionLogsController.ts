import { useEffect } from "react";
import { useCancelSubscriptionMutation, useGetSubscriptionLogsQuery } from "../../redux/Apis/User";
import { useModal } from "../../contexts/ModalContext";

const useSubscriptionLogsController = () => {

    const { showOkModal } = useModal()

    const { data, isLoading } = useGetSubscriptionLogsQuery({})
    const [cancel, { isSuccess: isCancelSubscriptionSuccess, isLoading: isCancelSubscriptionLoading }] = useCancelSubscriptionMutation()

    useEffect(() => {
        if (isCancelSubscriptionSuccess) {
            showOkModal({
                type: "success",
                title: "Success",
                message: "Your subscription has been successfully cancelled."
            })
        }
    }, [isCancelSubscriptionSuccess])

    const onCancel = (id: number) => {
        cancel(id)
    }

    return {
        values: {
            data: data?.data,
            isLoading,
            isCancelSubscriptionLoading
        },
        functions: {
            onCancel
        }
    }

}

export default useSubscriptionLogsController 
