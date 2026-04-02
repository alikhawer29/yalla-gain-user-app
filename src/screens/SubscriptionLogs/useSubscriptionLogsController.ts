import { useEffect } from 'react';
import {
  useCancelSubscriptionMutation,
  useGetSubscriptionLogsQuery,
} from '../../redux/Apis/User';
import { useModal } from '../../contexts/ModalContext';

const useSubscriptionLogsController = () => {
  const { showOkModal } = useModal();

  const { data, isLoading, refetch } = useGetSubscriptionLogsQuery({});
  const [
    cancel,
    {
      isSuccess: isCancelSubscriptionSuccess,
      isLoading: isCancelSubscriptionLoading,
    },
  ] = useCancelSubscriptionMutation();

  useEffect(() => {
    if (isCancelSubscriptionSuccess) {
      showOkModal({
        type: 'success',
        title: 'Success',
        message: 'Your subscription has been successfully cancelled.',
      });
      refetch();
    }
  }, [isCancelSubscriptionSuccess, refetch]);

  const onCancel = (id: number) => {
    cancel(id);
  };

  const isActiveSubscription = (subscription: any) => {
    if (!subscription) return false;
    // Use the is_active field from the API response
    return subscription.is_active === true;
  };

  return {
    values: {
      data: data?.data,
      isLoading,
      isCancelSubscriptionLoading,
    },
    functions: {
      onCancel,
      isActiveSubscription,
    },
  };
};

export default useSubscriptionLogsController;
