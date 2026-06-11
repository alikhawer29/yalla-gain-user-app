import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { useModal } from '../../contexts/ModalContext';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import {
  useGetWalletCoinsQuery,
  useGetTransactionCommissionQuery,
  useBuyYallaCoinMutation,
  useConfirmPaymentMutation,
} from '../../redux/Apis/User';
import { useStripe } from '@stripe/stripe-react-native';

const waitForModalDismiss = () =>
  new Promise<void>(resolve => {
    setTimeout(resolve, Platform.OS === 'ios' ? 350 : 100);
  });

const useWalletController = () => {
  const {
    data,
    isLoading,
    refetch: refetchWallet,
  } = useGetWalletCoinsQuery({});
  const [buyCoins, { isLoading: isBuyCoinsLoading }] =
    useBuyYallaCoinMutation();
  const [confirmPayment] = useConfirmPaymentMutation();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormResetToken, setPaymentFormResetToken] = useState(0);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { showOkModal } = useModal();

  const { data: commissionData, isFetching: isCommissionLoading } =
    useGetTransactionCommissionQuery(undefined, {
      skip: !showPaymentModal,
    });

  const commissionPercentage =
    commissionData?.data?.commission_percentage ?? null;

  const initializePaymentSheet = useCallback(
    async (clientSecret: string) => {
      try {
        const { error } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'YallaGain',
          allowsDelayedPaymentMethods: true,
          defaultBillingDetails: {
            address: {
              country: 'US',
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }
      } catch (error) {
        console.error('Error initializing payment sheet:', error);
        throw error;
      }
    },
    [initPaymentSheet],
  );

  const openPaymentSheet = useCallback(async () => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Error presenting payment sheet:', error);
      throw error;
    }
  }, [presentPaymentSheet]);

  const proceedWithPayment = useCallback(
    async (amount: string) => {
      try {
        const response = await buyCoins({ amount }).unwrap();

        if (!response?.client_secret) {
          throw new Error('No client secret received from server');
        }

        await initializePaymentSheet(response.client_secret);

        setShowPaymentModal(false);
        await waitForModalDismiss();

        const paymentSuccess = await openPaymentSheet();

        if (paymentSuccess) {
          try {
            const confirmResponse = await confirmPayment({
              intent_id: response.intent_id,
              amount: response.amount_aed,
              coins: response.coins,
            }).unwrap();

            refetchWallet();
            setPaymentFormResetToken(token => token + 1);

            showOkModal({
              type: 'success',
              title: 'Payment Successful',
              message:
                confirmResponse.message ||
                `Successfully purchased ${response.coins} coins for ${response.amount_aed}`,
            });
          } catch (confirmError: any) {
            console.error('Payment confirmation error:', confirmError);
            refetchWallet();
            setPaymentFormResetToken(token => token + 1);
            showOkModal({
              type: 'success',
              title: 'Payment Successful',
              message: `Successfully purchased ${response.coins} coins for ${response.amount_aed}. Please note: confirmation may take a moment to reflect.`,
            });
          }
        }
      } catch (error: any) {
        console.error('Payment error:', error);
        showOkModal({
          type: 'error',
          title: 'Payment Failed',
          message:
            error?.data?.message ||
            error?.message ||
            'Failed to process payment. Please try again.',
        });
      }
    },
    [
      buyCoins,
      confirmPayment,
      showOkModal,
      initializePaymentSheet,
      openPaymentSheet,
      refetchWallet,
    ],
  );

  const handlePayment = useCallback(
    (amount: string) => {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        showOkModal({
          type: 'error',
          title: 'Invalid Amount',
          message: 'Please enter a valid amount',
        });
        return;
      }

      void proceedWithPayment(amount);
    },
    [showOkModal, proceedWithPayment],
  );

  const handleAddCoins = useCallback(() => {
    setShowPaymentModal(true);
  }, []);

  const handleSendCoins = useCallback(() => {
    navigate(ROUTES.TRANSFER);
  }, []);

  const closePaymentModal = useCallback(() => {
    setShowPaymentModal(false);
  }, []);

  return {
    values: {
      data: data || [],
      isLoading,
      showPaymentModal,
      isBuyCoinsLoading,
      commissionPercentage,
      isCommissionLoading,
      paymentFormResetToken,
    },
    functions: {
      handleAddCoins,
      handleSendCoins,
      handlePayment,
      closePaymentModal,
    },
  };
};

export default useWalletController;
