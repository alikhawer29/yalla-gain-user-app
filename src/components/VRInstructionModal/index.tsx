import React, { FC } from 'react';
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { font, heightPixel, widthPixel } from '../../utils/helper';
import Button from '../Button';
import Icon from '../Icon';
import Row from '../Row';
import Seperator from '../Seperator';
import Text from '../Text';

interface IVRInstructionModal {
    visible: boolean;
    onClose: () => void;
}

const VRInstructionModal: FC<IVRInstructionModal> = ({
    visible,
    onClose,
}) => {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            {/* Header */}
                            <Row align="center" gap={15}>
                                <TouchableOpacity onPress={onClose}>
                                    <Icon source={images.back} size={18} tint_color={colors.white} />
                                </TouchableOpacity>
                                <Text size={18} weight="semibold">VR Instructions</Text>
                            </Row>

                            <Seperator size={25} />

                            <Text size={14} color={colors.white} style={styles.instructionText}>
                                In order to use the VR Environment download the (Yalla Gain) and required VR device.
                            </Text>

                            <Seperator size={25} />

                            {/* Close Button */}
                            <Button
                                text="GOT IT"
                                onPress={onClose}
                                style={styles.close_btn}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.grayish_black,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: widthPixel(20),
        paddingBottom: heightPixel(40),
        maxHeight: '80%',
    },
    instructionText: {
        lineHeight: 22,
        marginBottom: heightPixel(8),
    },
    close_btn: {
        flex: 1,
    },
});

export default VRInstructionModal;
