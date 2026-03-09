import React, { FC, useState, useEffect } from 'react';
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { font, heightPixel, widthPixel } from '../../utils/helper';
import Button from '../Button';
import Icon from '../Icon';
import Row from '../Row';
import Seperator from '../Seperator';
import Text from '../Text';

interface IChatFilterModal {
    visible: boolean;
    onClose: () => void;
    onApply: (filter: string) => void;
    selectedFilter: string;
}

const FILTER_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Read', value: 'read' },
    { label: 'Unread', value: 'unread' },
];

const ChatFilterModal: FC<IChatFilterModal> = ({
    visible,
    onClose,
    onApply,
    selectedFilter,
}) => {
    const [tempSelectedFilter, setTempSelectedFilter] = useState(selectedFilter);

    // Reset temp filter when modal opens
    useEffect(() => {
        if (visible) {
            setTempSelectedFilter(selectedFilter);
        }
    }, [visible, selectedFilter]);

    const handleApply = (filter: string) => {
        onApply(filter);
        onClose();
    };

    const handleClear = () => {
        onApply('all');
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

                            {/* Filter Options */}
                            <Text size={14} weight="semibold">Status</Text>
                            <Seperator size={15} />

                            {FILTER_OPTIONS.map((filter) => (
                                <TouchableOpacity
                                    key={filter.value}
                                    style={[
                                        styles.filterOption,
                                        tempSelectedFilter === filter.value && styles.selectedFilterOption,
                                    ]}
                                    onPress={() => setTempSelectedFilter(filter.value)}
                                >
                                    <Text
                                        size={14}
                                        color={colors.white}
                                    >
                                        {filter.label}
                                    </Text>
                                    {tempSelectedFilter === filter.value && (
                                        <Icon
                                            source={images.check}
                                            size={16}
                                            tint_color={colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}

                            <Seperator size={30} />

                            {/* Buttons */}
                            <Row gap={15}>
                                <Button
                                    text="APPLY"
                                    onPress={() => handleApply(tempSelectedFilter)}
                                    style={styles.apply_btn}
                                />
                                <Button
                                    text="CLEAR"
                                    onPress={handleClear}
                                    style={styles.clear_btn}
                                    type="outlined"
                                />
                            </Row>
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
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.light_primary,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.icon_gray,
        padding: widthPixel(15),
        height: heightPixel(48),
        marginBottom: heightPixel(10),
    },
    selectedFilterOption: {
        borderColor: colors.primary,
        backgroundColor: colors.light_primary,
    },
    apply_btn: {
        flex: 1,
    },
    clear_btn: {
        flex: 1,
    },
});

export default ChatFilterModal;
