import React, { FC, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { widthPixel } from '../../utils/helper';
import Button from '../Button';
import Icon from '../Icon';
import Row from '../Row';
import Seperator from '../Seperator';
import Text from '../Text';
import { MIN_TIP_YALLA_POINTS, MIN_TIP_YALLA_POINTS_MESSAGE } from '../../utils/tip';

interface ITipModal {
    visible: boolean;
    onClose: () => void;
    /** Resolve when tip succeeds (modal shows built-in success). Reject so user stays on the tip form. */
    onSubmit: (coins: number) => Promise<void>;
    loading?: boolean;
}

type ModalView = 'select' | 'success' | 'error';

const TipModal: FC<ITipModal> = ({ visible, onClose, onSubmit, loading }) => {
    const [coins, setCoins] = useState(MIN_TIP_YALLA_POINTS);
    const [view, setView] = useState<ModalView>('select');

    const handleClose = () => {
        setCoins(MIN_TIP_YALLA_POINTS);
        setView('select');
        onClose();
    };

    const handleSubmit = async () => {
        try {
            await onSubmit(coins);
            setView('success');
        } catch {
            /* parent shows error modal; stay on select */
        }
    };

    const incrementCoins = () => {
        setCoins(prev => prev + 1);
    };

    const decrementCoins = () => {
        if (coins > MIN_TIP_YALLA_POINTS) {
            setCoins(prev => prev - 1);
        }
    };

    const renderSelectView = () => (
        <>
            <Text size={20} weight="bold" position="center">Tip</Text>
            <Seperator size={20} />

            <Text size={14} weight="semibold">
                Tip Quantity <Text color="#FF0000">*</Text>
            </Text>
            <Seperator size={6} />
            <Text size={12} color={colors.icon_gray}>
                {MIN_TIP_YALLA_POINTS_MESSAGE}
            </Text>
            <Seperator size={10} />

            <View style={styles.coin_selector}>
                <TouchableOpacity style={styles.coin_btn} onPress={incrementCoins}>
                    <Icon source={images.plus} size={18} tint_color={colors.white} />
                </TouchableOpacity>

                <View style={styles.coin_display}>
                    <Text size={14} weight="semibold">{coins} Yalla Points</Text>
                </View>

                <TouchableOpacity
                    style={[styles.coin_btn, coins <= MIN_TIP_YALLA_POINTS && styles.coin_btn_disabled]}
                    onPress={decrementCoins}
                    disabled={coins <= MIN_TIP_YALLA_POINTS}
                >
                    <Icon source={images.minus} size={18} tint_color={colors.white} />
                </TouchableOpacity>
            </View>

            <Seperator size={25} />

            <Button
                text="Send"
                onPress={handleSubmit}
                loading={loading}
                style={styles.submit_btn}
            />
        </>
    );

    const renderSuccessView = () => (
        <View style={styles.success_container}>
            <View style={styles.success_icon}>
                <Icon source={images.check} size={40} tint_color={colors.white} />
            </View>
            <Seperator size={15} />
            <Text size={20} weight="bold" position="center">Successfully</Text>
            <Seperator size={8} />
            <Text size={14} position="center" color={colors.icon_gray}>
                Tip Has Been Sent{'\n'}Successfully
            </Text>
            <Seperator size={25} />
            <Button
                text="Ok"
                onPress={handleClose}
                style={styles.submit_btn}
            />
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            <View style={styles.close_btn}>
                                <Icon
                                    rounded
                                    source={images.cross}
                                    size={30}
                                    onPress={handleClose}
                                    border={colors.white}
                                />
                            </View>

                            {view === 'select' && renderSelectView()}
                            {view === 'success' && renderSuccessView()}
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '85%',
        backgroundColor: colors.grayish_black,
        borderRadius: 15,
        padding: widthPixel(20),
    },
    close_btn: {
        alignItems: 'flex-end',
    },
    coin_selector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light_primary,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.icon_gray,
        padding: widthPixel(8),
    },
    coin_btn: {
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coin_btn_disabled: {
        opacity: 0.5,
    },
    coin_display: {
        flex: 1,
        alignItems: 'center',
    },
    submit_btn: {
        width: '60%',
        alignSelf: 'center',
    },
    success_container: {
        alignItems: 'center',
    },
    success_icon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TipModal;

