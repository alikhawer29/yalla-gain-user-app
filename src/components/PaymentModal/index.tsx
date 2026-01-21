import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
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

    const handlePayment = () => {
        if (amount) {
            onPayment(amount);
        }
    };

    const handleClose = () => {
        setAmount('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
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
                            1 Yalla Coin Is Equal To {coinValue}
                        </Text>

                        <View style={styles.inputContainer}>
                            <Input
                                label="Fund Amount"
                                required
                                placeholder="Enter amount"
                                onChangeText={setAmount}
                                type="number"
                                value={amount}
                            />
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
        </Modal>
    );
};

export default PaymentModal;
