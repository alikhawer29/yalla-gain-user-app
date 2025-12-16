import { useCallback, useState } from "react";
import { useModal } from "../../contexts/ModalContext";
import { navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";
import { useGetWalletCoinsQuery, useBuyYallaCoinMutation, useConfirmPaymentMutation } from "../../redux/Apis/User";
import { useStripe } from '@stripe/stripe-react-native';

const useWalletController = () => {
    const { data, isLoading } = useGetWalletCoinsQuery({})
    const [buyCoins, { isLoading: isBuyCoinsLoading }] = useBuyYallaCoinMutation()
    const [confirmPayment] = useConfirmPaymentMutation()
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const { initPaymentSheet, presentPaymentSheet } = useStripe()
    
    const { showOkModal } = useModal()

    const initializePaymentSheet = useCallback(async (clientSecret: string) => {
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
    }, [initPaymentSheet]);

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

    const handlePayment = useCallback(async (amount: string) => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            showOkModal({
                type: "error",
                title: "Invalid Amount",
                message: "Please enter a valid amount"
            })
            return
        }

        try {
            // Make the API call to buy coins and get clientSecret
            const response = await buyCoins({ amount }).unwrap();
            
            if (!response?.client_secret) {
                throw new Error('No client secret received from server');
            }

            console.log('Payment response:', response);

            // Initialize payment sheet with clientSecret
            await initializePaymentSheet(response.client_secret);
            
            // Present payment sheet to user
            const paymentSuccess = await openPaymentSheet();
            
            if (paymentSuccess) {
                // Call after-payment API to confirm the payment
                try {
                    const confirmResponse = await confirmPayment({
                        intent_id: response.intent_id,
                        amount: response.amount,
                        coins: response.coins
                    }).unwrap();

                    console.log('Payment confirmation response:', confirmResponse);

                    setShowPaymentModal(false);
                    showOkModal({
                        type: "success",
                        title: "Payment Successful",
                        message: confirmResponse.message || `Successfully purchased ${response.coins} coins for ${response.amount}`
                    });
                } catch (confirmError: any) {
                    console.error('Payment confirmation error:', confirmError);
                    // Still show success but with a warning
                    setShowPaymentModal(false);
                    showOkModal({
                        type: "success",
                        title: "Payment Successful",
                        message: `Successfully purchased ${response.coins} coins for ${response.amount}. Please note: confirmation may take a moment to reflect.`
                    });
                }
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            showOkModal({
                type: "error",
                title: "Payment Failed",
                message: error?.data?.message || error?.message || "Failed to process payment. Please try again."
            });
        }
    }, [buyCoins, confirmPayment, showOkModal, initializePaymentSheet, openPaymentSheet]);

    const handleAddCoins = useCallback(() => {
        setShowPaymentModal(true)
    }, [])

    const handleSendCoins = useCallback(() => {
        navigate(ROUTES.TRANSFER)
    }, [])

    const closePaymentModal = useCallback(() => {
        setShowPaymentModal(false)
    }, [])

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
        }
    }
}

export default useWalletController 
