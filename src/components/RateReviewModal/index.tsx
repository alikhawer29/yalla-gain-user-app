import React, { FC, useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import fonts from '../../assets/fonts';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { font, heightPixel, widthPixel } from '../../utils/helper';
import Button from '../Button';
import Icon from '../Icon';
import Row from '../Row';
import Seperator from '../Seperator';
import Text from '../Text';

interface IRateReviewModal {
    visible: boolean;
    onClose: () => void;
    onSubmit: (rating: number, review: string) => void;
    loading?: boolean;
}

const RateReviewModal: FC<IRateReviewModal> = ({ visible, onClose, onSubmit, loading }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const handleClose = () => {
        setRating(0);
        setReview('');
        onClose();
    };

    const handleSubmit = () => {
        onSubmit(rating, review);
    };

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, i) => (
            <TouchableOpacity key={i} onPress={() => setRating(i + 1)}>
                <Icon
                    source={images.helpdesk.star}
                    size={20}
                    tint_color={i < rating ? "#FFD700" : colors.icon_gray}
                />
            </TouchableOpacity>
        ));
    };

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

                            <Text size={20} weight="bold" position="center">Rate & Review</Text>
                            <Seperator size={20} />

                            <Text size={14} weight="semibold">
                                Rating <Text color="#FF0000">*</Text>
                            </Text>
                            <Seperator size={8} />
                            <Row gap={4}>{renderStars()}</Row>

                            <Seperator size={20} />

                            <Text size={14} weight="semibold">
                                Review <Text color="#FF0000">*</Text>
                            </Text>
                            <Seperator size={8} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Write Here"
                                placeholderTextColor={colors.icon_gray}
                                value={review}
                                onChangeText={setReview}
                                multiline
                                numberOfLines={4}
                            />

                            <Seperator size={25} />

                            <Button
                                text="Send"
                                onPress={handleSubmit}
                                loading={loading}
                                style={styles.submit_btn}
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
    textInput: {
        backgroundColor: colors.light_primary,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.icon_gray,
        padding: widthPixel(12),
        color: colors.white,
        fontFamily: fonts.sfpro.regular,
        fontSize: font(14),
        minHeight: heightPixel(100),
        textAlignVertical: 'top',
    },
    submit_btn: {
        width: '60%',
        alignSelf: 'center',
    },
});

export default RateReviewModal;

