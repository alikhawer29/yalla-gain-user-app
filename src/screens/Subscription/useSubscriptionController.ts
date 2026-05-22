import { useCallback, useEffect, useState } from 'react';
import {
  useGetSubscriptionPlansQuery,
  useSubscribeMutation,
} from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import {
  getSubscribePaymentMessage,
  type SubscribePaymentResponse,
} from '../../utils/subscription';

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
    if (!isSubscribeSuccess || subscribeData == null) return;

    const payload = subscribeData as SubscribePaymentResponse;

    if (payload.status === true) {
      setAlertModal({
        visible: true,
        type: 'success',
        title: 'Successfully',
        message: getSubscribePaymentMessage(
          payload,
          'Subscription purchased successfully.',
        ),
      });
      return;
    }

    setAlertModal({
      visible: true,
      type: 'error',
      title: 'Unsuccessful!',
      message: getSubscribePaymentMessage(
        payload,
        'Payment was unsuccessful. Please try again.',
      ),
    });
  }, [isSubscribeSuccess, subscribeData]);

  const handleModalOk = () => {
    if ((subscribeData as SubscribePaymentResponse)?.status === true) {
      navigate(ROUTES.SUBSCRIPTION_LOGS);
    }
    setAlertModal(prev => ({ ...prev, visible: false }));
  };

  const onChoosePlan = useCallback(
    (plan_id: number) => {
      subscribe({ plan_id });
    },
    [subscribe],
  );

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
