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

  const { data, isLoading, refetch: refetchPlans } =
    useGetSubscriptionPlansQuery({});
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
      void refetchPlans();
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
  }, [isSubscribeSuccess, subscribeData, refetchPlans]);

  const handleModalOk = () => {
    if ((subscribeData as SubscribePaymentResponse)?.status === true) {
      navigate(ROUTES.SUBSCRIPTION_LOGS);
    }
    setAlertModal(prev => ({ ...prev, visible: false }));
  };

  const onChoosePlan = useCallback(
    (plan_id: number) => {
      const plan = (data?.data || []).find(
        (item: { id?: number; is_active?: boolean }) => item.id === plan_id,
      );
      // is_active means current non-cancelled plan — Choose Plan is disabled for it.
      if (plan?.is_active) {
        return;
      }
      subscribe({ plan_id });
    },
    [data?.data, subscribe],
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
