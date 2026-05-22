import {
  useCancelSubscriptionMutation,
  useGetSubscriptionLogsQuery,
} from '../../redux/Apis/User';
import { useModal } from '../../contexts/ModalContext';
import colors from '../../utils/colors';

type ApiPayload = {
  status?: boolean;
  message?: string;
  error?: string;
  subscription?: Record<string, unknown>;
  data?: { message?: string };
};

const getApiMessage = (response: unknown, fallback: string): string => {
  if (!response || typeof response !== 'object') return fallback;
  const payload = response as ApiPayload;
  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error;
  }
  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }
  if (payload.data && typeof payload.data.message === 'string') {
    return payload.data.message;
  }
  return fallback;
};

const isApiSuccess = (response: unknown): boolean => {
  if (!response || typeof response !== 'object') return true;
  return (response as ApiPayload).status !== false;
};

const useSubscriptionLogsController = () => {
  const { showOkModal } = useModal();

  const { data, isLoading, refetch } = useGetSubscriptionLogsQuery({});
  const [cancel, { isLoading: isCancelSubscriptionLoading }] =
    useCancelSubscriptionMutation();

  const showCancelResultModal = (response: unknown) => {
    const message = getApiMessage(
      response,
      'Your subscription has been successfully cancelled.',
    );
    const ok = isApiSuccess(response);
    showOkModal({
      type: ok ? 'success' : 'info',
      title: ok ? 'Success' : 'Notice',
      message,
    });
  };

  const onCancel = async (id: number) => {
    try {
      const response = await cancel(id).unwrap();
      showCancelResultModal(response);
      refetch();
    } catch (error: any) {
      const payload = error?.data as ApiPayload | undefined;
      if (payload?.message) {
        showCancelResultModal(payload);
        refetch();
        return;
      }
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel subscription. Please try again.',
      });
    }
  };

  /** User still has plan access (may be cancelled until expiry). */
  const hasCurrentSubscription = (subscription: any) => {
    if (!subscription) return false;
    return subscription.is_active === true;
  };

  const isSubscriptionCancelled = (subscription: any) => {
    if (!subscription) return false;
    return (
      subscription.is_cancelled === true || subscription.status === 'cancelled'
    );
  };

  const getCurrentSubscriptionLabel = (subscription: any) => {
    if (isSubscriptionCancelled(subscription)) {
      return {
        text: 'Cancelled',
        color: colors.danger,
        underline: false,
        onPress: undefined as undefined,
      };
    }
    return {
      text: isCancelSubscriptionLoading ? 'Hold On' : 'Cancel',
      color: isCancelSubscriptionLoading ? colors.gray : colors.primary,
      underline: true,
      onPress: isCancelSubscriptionLoading
        ? undefined
        : () => onCancel(subscription.id),
    };
  };

  const getCancelledAccessNote = (subscription: any) => {
    if (!isSubscriptionCancelled(subscription)) return null;
    const until = subscription.expired_on;
    const days = subscription.days_remaining;
    if (until && days != null) {
      return `Access remains until ${until} (${days} days left).`;
    }
    if (until) {
      return `Access remains until ${until}.`;
    }
    return 'Your plan stays active until the end of the billing period.';
  };

  return {
    values: {
      data: data?.data,
      isLoading,
      isCancelSubscriptionLoading,
    },
    functions: {
      onCancel,
      hasCurrentSubscription,
      isSubscriptionCancelled,
      getCurrentSubscriptionLabel,
      getCancelledAccessNote,
    },
  };
};

export default useSubscriptionLogsController;
