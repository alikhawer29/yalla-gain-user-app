import { useCallback, useEffect, useState } from 'react';
import {
  useGetSubscriptionPlansQuery,
  useSubscribeMutation,
} from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';

const useSubscriptionController = () => {
  const [alertModal, setAlertModal] = useState({
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: '',
  });

  const { data, isLoading } = useGetSubscriptionPlansQuery({});
  const [
    subscribe,
    {
      data: subscribeData,
      isSuccess: isSubscribeSuccess,
      isLoading: isSubscribeLoading,
    },
  ] = useSubscribeMutation();

  useEffect(() => {
    if (isSubscribeSuccess) {
      if (subscribeData?.status) {
        setAlertModal({
          visible: true,
          type: 'success',
          title: 'Successfully',
          message: 'Payment has been Made Successfully.',
        });
      } else {
        console.log(subscribeData);
        setAlertModal({
          visible: true,
          type: 'error',
          title: 'Unsuccessful!',
          message:
            subscribeData?.error ||
            'Payment was Unsuccessful.\nPlease try again.',
        });
      }
    }
  }, [isSubscribeSuccess, subscribeData]);

  const handleModalOk = () => {
    if (subscribeData?.status) {
      navigate(ROUTES.SUBSCRIPTION_LOGS);
    }
  };

  const onChoosePlan = useCallback((plan_id: number) => {
    subscribe({ plan_id });
  }, []);

  const onSubscriptionLogs = useCallback(() => {
    navigate(ROUTES.SUBSCRIPTION_LOGS);
  }, []);

  return {
    values: {
      data: data?.data || [],
      isLoading,
      isSubscribeLoading,
      alertModal,
    },
    functions: {
      onChoosePlan,
      onSubscriptionLogs,
      handleModalOk,
      setAlertModal,
    },
  };
};

export default useSubscriptionController;
