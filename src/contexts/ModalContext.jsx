import React, { createContext, useContext, useState } from 'react';
import { Image, Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import images from '../assets/images';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Text from '../components/Text';
import colors from '../utils/colors';
import { font, heightPixel, widthPixel } from '../utils/helper';
import Row from '../components/Row';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {

    const [isVisible, setIsVisible] = useState(false);
    const [modalType, setModalType] = useState(null);

    const [modalContent, setModalContent] = useState({
        type: 'success',
        message: '',
        onConfirm: () => { },
        onCancel: () => { },
    });

    const showOkModal = (data, onConfirm) => {
        setModalType('ok');
        setModalContent({
            ...data,
            onConfirm: onConfirm ? onConfirm : () => setIsVisible(false),
            onCancel: () => setIsVisible(false),
        });
        setIsVisible(true);
    };

    const showYesNoModal = (data, onConfirm, onCancel) => {
        setModalType('yesNo');
        setModalContent({
            ...data,
            onConfirm,
            onCancel: onCancel ? onCancel : () => setIsVisible(false),
        });
        setIsVisible(true);
    };

    const showInformativeModal = (data, onConfirm, onCancel) => {
        setModalType('info');
        setModalContent({
            ...data,
            onConfirm,
            onCancel,
        });
        setIsVisible(true);
    };

    const hideModal = () => setIsVisible(false);

    return (
        <ModalContext.Provider
            value={{
                showOkModal,
                showYesNoModal,
                showInformativeModal,
                hideModal,
            }}
        >
            {children}
            {isVisible && (
                <Modal
                    transparent
                    visible={isVisible}
                    animationType="fade"
                    onRequestClose={hideModal}
                    statusBarTranslucent
                >
                    <TouchableWithoutFeedback onPress={hideModal} accessible={false}>
                        <View style={styles.modalContainer}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContent}>
                                    {
                                        modalContent.type !== "info" && (
                                            <View style={{ width: "100%", alignItems: "flex-end" }}>
                                                <Icon rounded source={images.cross} size={30} onPress={hideModal} border={colors.white} />
                                            </View>
                                        )
                                    }
                                    {
                                        modalContent.type !== "info" && (
                                            <Image source={modalContent.type === "success" ? images.modal_check : modalContent.type === "warning" ? images.warning : images.modal_cross} style={{ height: heightPixel(78), resizeMode: "contain", marginBottom: heightPixel(20) }} />
                                        )
                                    }
                                    <Text style={[styles.title, modalContent.type == "info" ? { width: "100%" } : {}]} color={colors.white} position="center" size={24} weight='bold' line_height={40}>{modalContent?.title}</Text>
                                    <Text style={[styles.message, modalContent.type == "info" ? { width: "100%" } : {}]} color={colors.white} position="center">{modalContent?.message}</Text>
                                    {modalType === 'ok' ? (
                                        <Button text="OK" onPress={() => {
                                            modalContent.onConfirm();
                                            hideModal();
                                        }} />
                                    ) : modalType === 'info' ? null : (
                                        <Row justify='space-between' align='center' gap={10} style={styles.buttonContainer}>
                                            <Button text="Yes"  style={{width: "50%", minWidth: 'auto'}} onPress={() => {
                                                modalContent.onConfirm();
                                                hideModal();
                                            }} />
                                            <Button text="No" type='outlined' style={{width: "50%", minWidth: 'auto'}} onPress={() => {
                                                if (modalContent?.onCancel) {
                                                    modalContent.onCancel();
                                                }
                                                hideModal();
                                            }} />
                                        </Row>
                                    )}
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </ModalContext.Provider>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '75%',
        padding: 20,
        // paddingBottom: heightPixel(40),
        backgroundColor: colors.blackish_gray,
        borderRadius: heightPixel(10),
        alignItems: 'center',
        borderWidth: font(2),
        borderColor: colors.gray
    },
    title: {
        width: "80%",
        marginBottom: heightPixel(10),
    },
    message: {
        marginBottom: heightPixel(30),
        width: "80%"
    },
    buttonContainer: {
        width: '90%',
    },
});
