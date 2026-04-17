import React, { FC, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import fonts from '../../assets/fonts';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { dateFormatter, font, heightPixel, widthPixel } from '../../utils/helper';
import Button from '../Button';
import Icon from '../Icon';
import Row from '../Row';
import Seperator from '../Seperator';
import Text from '../Text';

interface IDateFilterModal {
    visible: boolean;
    onClose: () => void;
    onApply: (fromDate: string | null, toDate: string | null) => void;
    initialFromDate?: string | null;
    initialToDate?: string | null;
}

const DateFilterModal: FC<IDateFilterModal> = ({
    visible,
    onClose,
    onApply,
    initialFromDate,
    initialToDate,
}) => {
    const [fromDate, setFromDate] = useState<Date | null>(initialFromDate ? new Date(initialFromDate) : null);
    const [toDate, setToDate] = useState<Date | null>(initialToDate ? new Date(initialToDate) : null);
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const handleApply = () => {
        onApply(
            fromDate ? dateFormatter(fromDate) : null,
            toDate ? dateFormatter(toDate) : null
        );
        onClose();
    };

    const handleClear = () => {
        setFromDate(null);
        setToDate(null);
        onApply(null, null);
        onClose();
    };

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
                                <Text size={18} weight="semibold">Filter By</Text>
                            </Row>

                            <Seperator size={25} />

                            <Text size={14} weight="semibold">Filter By  Date</Text>
                            <Seperator size={15} />

                            {/* From Date */}
                            <Text size={14} color={colors.icon_gray}>From</Text>
                            <Seperator size={8} />
                            <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
                                <Text size={14} color={fromDate ? colors.white : colors.icon_gray}>
                                    {fromDate ? dateFormatter(fromDate) : 'YYYY/MM/DD'}
                                </Text>
                                <Icon source={images.calendar} size={18} tint_color={colors.icon_gray} />
                            </TouchableOpacity>

                            <Seperator size={15} />

                            {/* To Date */}
                            <Text size={14} color={colors.icon_gray}>To</Text>
                            <Seperator size={8} />
                            <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
                                <Text size={14} color={toDate ? colors.white : colors.icon_gray}>
                                    {toDate ? dateFormatter(toDate) : 'YYYY/MM/DD'}
                                </Text>
                                <Icon source={images.calendar} size={18} tint_color={colors.icon_gray} />
                            </TouchableOpacity>

                            <Seperator size={30} />

                            {/* Buttons */}
                            <Row gap={15}>
                                <Button text="APPLY" onPress={handleApply} style={styles.apply_btn} />
                                <Button text="CLEAR" onPress={handleClear} style={styles.clear_btn} mode="outlined" />
                            </Row>

                            {/* Date Pickers */}
                            <DatePicker
                                modal
                                mode="date"
                                open={showFromPicker}
                                date={fromDate || new Date()}
                                onConfirm={(date) => {
                                    setShowFromPicker(false);
                                    setFromDate(date);
                                }}
                                onCancel={() => setShowFromPicker(false)}
                            />
                            <DatePicker
                                modal
                                mode="date"
                                open={showToPicker}
                                date={toDate || new Date()}
                                minimumDate={fromDate || undefined}
                                onConfirm={(date) => {
                                    setShowToPicker(false);
                                    setToDate(date);
                                }}
                                onCancel={() => setShowToPicker(false)}
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
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.light_primary,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.icon_gray,
        padding: widthPixel(12),
        height: heightPixel(48),
    },
    apply_btn: {
        flex: 1,
    },
    clear_btn: {
        flex: 1,
    },
});

export default DateFilterModal;

