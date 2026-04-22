import React, { FC } from "react";
import { Modal, View, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "../Icon";
import Text from "../Text";
import images from "../../assets/images";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";

interface IConfirmModal {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    icon?: any;
    messageColor?: string;
}

const ConfirmModal: FC<IConfirmModal> = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Yes",
    cancelText = "No",
    icon = images.warning,
    messageColor = colors.icon_gray,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Close Button */}
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon source={images.cross} size={15} tint_color={colors.white} />
                    </TouchableOpacity>

                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Icon source={icon} size={80} />
                    </View>

                    {/* Title */}
                    <Text size={24} weight="bold" color={colors.white} style={styles.title}>
                        {title}
                    </Text>

                    {/* Message */}
                    <Text size={14} color={messageColor} position="center" style={styles.message}>
                        {message}
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
                            <Text size={16} weight="semibold" color={colors.white}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                            <Text size={16} weight="semibold" color={colors.white}>
                                {cancelText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: widthPixel(20),
    },
    container: {
        backgroundColor: '#282828',
        borderRadius: heightPixel(20),
        padding: heightPixel(30),
        width: '90%',
        maxWidth: widthPixel(350),
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: heightPixel(15),
        right: widthPixel(15),
        width: heightPixel(30),
        height: heightPixel(30),
        borderRadius: heightPixel(15),
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: heightPixel(20),
    },
    title: {
        marginBottom: heightPixel(15),
    },
    message: {
        marginBottom: heightPixel(30),
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: widthPixel(15),
        width: '100%',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingVertical: heightPixel(15),
        borderRadius: heightPixel(10),
        alignItems: 'center',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingVertical: heightPixel(15),
        borderRadius: heightPixel(10),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.dark_gray,
    },
});

export default ConfirmModal;
