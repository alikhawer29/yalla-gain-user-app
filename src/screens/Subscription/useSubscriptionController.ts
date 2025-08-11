import { useCallback, useEffect } from "react";
import { useGetSubscriptionPlansQuery, useSubscribeMutation } from "../../redux/Apis/User";
import { openInAppBrowser } from "../../utils/browser";
import { navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";

const useSubscriptionController = () => {

    const { data, isLoading } = useGetSubscriptionPlansQuery({})
    const [subscribe, { data: subscribeData, isSuccess: isSubscribeSuccess, isLoading: isSubscribeLoading }] = useSubscribeMutation()

    useEffect(() => {
        if (isSubscribeSuccess) {
            openInAppBrowser(subscribeData?.url)
        }
    }, [isSubscribeSuccess, subscribeData])

    const onChoosePlan = useCallback((plan_id: number) => {
        subscribe({ plan_id })
    }, [])

    const onSubscriptionLogs = useCallback(() => {
        navigate(ROUTES.SUBSCRIPTION_LOGS)
    }, [])

    return {
        values: {
            data: data?.data || [],
            isLoading,
            isSubscribeLoading
        },
        functions: {
            onChoosePlan,
            onSubscriptionLogs
        }
    }

}

export default useSubscriptionController