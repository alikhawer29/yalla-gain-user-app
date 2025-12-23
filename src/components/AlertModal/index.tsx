import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import Button from '../Button';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';
import Icon from '../Icon';
import images from '../../assets/images';
import Image from '../Image';

interface AlertModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'success' | 'error';
    title: string;
    message: string;
    onOk?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
    visible,
    onClose,
    type,
    title,
    message,
    onOk,
}) => {
    const handleOk = () => {
        if (onOk) {
            onOk();
        }
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleOk}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={handleOk}
            >
                <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Close button in top right */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon source={images.cross} size={10} />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: type === 'success' ? colors.success : colors.error }]}>
                            <Image
                                source={type === 'success' ? images.modal_check : images.modal_cross}
                                size={30}
                                tint_color={colors.white}
                            />
                        </View>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <Button
                            text="OK"
                            type="primary"
                            onPress={handleOk}
                        // style={styles.okButton}
                        />
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = {
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    modalContainer: {
        backgroundColor: '#2C2C2E',
        borderRadius: heightPixel(20),
        padding: heightPixel(32),
        width: widthPixel(320),
        alignItems: 'center' as const,
        position: 'relative' as const,
    },
    closeButton: {
        position: 'absolute' as const,
        top: heightPixel(16),
        right: heightPixel(16),
        width: heightPixel(32),
        height: heightPixel(32),
        borderRadius: heightPixel(16),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    iconContainer: {
        marginBottom: heightPixel(24),
    },
    iconCircle: {
        width: heightPixel(80),
        height: heightPixel(80),
        borderRadius: heightPixel(40),
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    content: {
        alignItems: 'center' as const,
        width: '100%' as const,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        color: colors.white,
        marginBottom: heightPixel(8),
        textAlign: 'center' as const,
    },
    message: {
        fontSize: 16,
        color: colors.white,
        textAlign: 'center' as const,
        marginBottom: heightPixel(32),
        lineHeight: 22,
    },
    okButton: {
        width: '100%' as const,
        backgroundColor: colors.success,
    },
};

export default AlertModal;
