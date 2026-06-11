import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Input from '../Input';
import Button from '../Button';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';
import styles from './styles.ts';

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    onPayment: (amount: string) => void;
    coinValue: string;
    isLoading: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    visible,
    onClose,
    onPayment,
    coinValue,
    isLoading,
}) => {
    const [amount, setAmount] = useState('');
    const [amountError, setAmountError] = useState('');

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
        Keyboard.dismiss();
        setAmount('');
        setAmountError('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={handleClose}
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
                            <Text style={styles.coinValue}>
                                1 Yalla Coin Is Equal To {coinValue} AED
                            </Text>

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
                                {estimatedCoins != null ? (
                                    <Text style={styles.conversionPreview}>
                                        You will receive {formatCoins(estimatedCoins)} Yalla
                                        Coins for {amount} AED
                                    </Text>
                                ) : null}
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
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default PaymentModal;
