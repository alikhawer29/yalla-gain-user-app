import { useCallback, useState } from 'react';
import { useModal } from '../../contexts/ModalContext';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import {
  userApi,
  useGetWalletCoinsQuery,
  useBuyYallaCoinMutation,
  useConfirmPaymentMutation,
} from '../../redux/Apis/User';
import { useStripe } from '@stripe/stripe-react-native';
import { confirmTransactionWithFee } from '../../utils/transactionCommission';

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
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { showOkModal, showYesNoModal } = useModal();
  const [fetchTransactionCommission] =
    userApi.useLazyGetTransactionCommissionQuery();

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

      return true; // Payment successful
    } catch (error) {
      console.error('Error presenting payment sheet:', error);
      throw error;
    }
  }, [presentPaymentSheet]);

  const proceedWithPayment = useCallback(
    async (amount: string) => {
      try {
        // Make the API call to buy coins and get clientSecret
        const response = await buyCoins({ amount }).unwrap();

        if (!response?.client_secret) {
          throw new Error('No client secret received from server');
        }

        // Initialize payment sheet with clientSecret
        await initializePaymentSheet(response.client_secret);

        // Present payment sheet to user
        const paymentSuccess = await openPaymentSheet();

        if (paymentSuccess) {
          // Call after-payment API to confirm the payment
          try {
            const confirmResponse = await confirmPayment({
              intent_id: response.intent_id,
              amount: response.amount_aed,
              coins: response.coins,
            }).unwrap();

            // Refetch wallet data to show updated coin balance
            refetchWallet();

            setShowPaymentModal(false);
            showOkModal({
              type: 'success',
              title: 'Payment Successful',
              message:
                confirmResponse.message ||
                `Successfully purchased ${response.coins} coins for ${response.amount_aed}`,
            });
          } catch (confirmError: any) {
            console.error('Payment confirmation error:', confirmError);
            // Still show success but with a warning and refetch wallet
            refetchWallet();
            setShowPaymentModal(false);
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
    async (amount: string) => {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        showOkModal({
          type: 'error',
          title: 'Invalid Amount',
          message: 'Please enter a valid amount',
        });
        return;
      }

      await confirmTransactionWithFee(
        fetchTransactionCommission,
        showYesNoModal,
        showOkModal,
        'buy',
        () => {
          void proceedWithPayment(amount);
        },
      );
    },
    [
      fetchTransactionCommission,
      showYesNoModal,
      showOkModal,
      proceedWithPayment,
    ],
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
