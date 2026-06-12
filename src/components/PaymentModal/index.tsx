import React, { useEffect, useMemo, useState } from 'react';
import {
    Keyboard,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
    getTransactionFeeAmountLabel,
    getTransactionFeeInlineLabel,
} from '../../utils/transactionCommission';
import Button from '../Button';
import Input from '../Input';
import styles from './styles.ts';

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    onPayment: (amount: string) => void;
    coinValue: string;
    commissionPercentage?: string | number | null;
    isCommissionLoading?: boolean;
    isLoading: boolean;
    formResetToken?: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    visible,
    onClose,
    onPayment,
    coinValue,
    commissionPercentage,
    isCommissionLoading = false,
    isLoading,
    formResetToken = 0,
}) => {
    const [amount, setAmount] = useState('');
    const [amountError, setAmountError] = useState('');

    const resetForm = () => {
        setAmount('');
        setAmountError('');
    };

    useEffect(() => {
        if (formResetToken > 0) {
            resetForm();
        }
    }, [formResetToken]);

    const coinRate = useMemo(() => {
        const parsed = parseFloat(String(coinValue).replace(/[^0-9.]/g, ''));
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }, [coinValue]);

    const estimatedCoins = useMemo(() => {
        const parsedAmount = parseFloat(amount);
        if (!coinRate || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return null;
        }
        return parsedAmount / coinRate;
    }, [amount, coinRate]);

    const formatCoins = (value: number) => {
        if (Number.isInteger(value)) return String(value);
        return value.toFixed(2).replace(/\.?0+$/, '');
    };

    const commissionLabel = getTransactionFeeInlineLabel(commissionPercentage);
    const commissionAmountLabel = getTransactionFeeAmountLabel(
        amount,
        commissionPercentage,
    );

    const handleAmountChange = (value: string) => {
        setAmount(value);
        if (amountError) {
            setAmountError('');
        }
    };

    const handlePayment = () => {
        Keyboard.dismiss();
        const trimmed = amount.trim();
        if (!trimmed) {
            setAmountError('Fund Amount is required');
            return;
        }
        setAmountError('');
        onPayment(trimmed);
    };

    const handleClose = () => {
        if (isLoading) {
            return;
        }
        Keyboard.dismiss();
        resetForm();
        onClose();
    };

    if (!visible) {
        return null;
    }

    return (
        <View style={styles.rootOverlay}>
            <KeyboardAwareScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid
                extraScrollHeight={Platform.OS === 'ios' ? 120 : 80}
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={handleClose}
                    disabled={isLoading}
                >
                    <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>Payment</Text>
                        </View>

                        <View style={styles.content}>
                            <View style={styles.coinValueBox}>
                                <Text style={styles.coinValue}>
                                    1 Yalla Coin Is Equal To {coinValue} AED
                                </Text>
                                {isCommissionLoading ? (
                                    <Text style={styles.commissionNote}>
                                        Loading transaction fee...
                                    </Text>
                                ) : commissionLabel ? (
                                    <Text style={styles.commissionNote}>
                                        {commissionLabel}
                                    </Text>
                                ) : null}
                                {commissionAmountLabel ? (
                                    <Text style={styles.commissionAmount}>
                                        {commissionAmountLabel}
                                    </Text>
                                ) : null}
                            </View>

                            <View style={styles.inputContainer}>
                                <Input
                                    label="Fund Amount"
                                    required
                                    placeholder="Enter amount"
                                    onChangeText={handleAmountChange}
                                    type="number"
                                    value={amount}
                                    error={amountError}
                                />
                                <View style={styles.conversionContainer}>
                                    {estimatedCoins != null ? (
                                        <Text style={styles.conversionPreview}>
                                            You will receive {formatCoins(estimatedCoins)} Yalla
                                            Coins for {amount} AED
                                        </Text>
                                    ) : null}
                                </View>
                            </View>

                            <View style={styles.buttonContainer}>
                                <Button
                                    text="Cancel"
                                    type="outlined"
                                    onPress={handleClose}
                                    style={styles.cancelButton}
                                />
                                <Button
                                    text="Pay Now"
                                    type="primary"
                                    onPress={handlePayment}
                                    loading={isLoading}
                                    style={styles.confirmButton}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </View>
    );
};

export default PaymentModal;
