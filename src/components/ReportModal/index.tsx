import React, { FC, useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import fonts from '../../assets/fonts';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { font, heightPixel, widthPixel } from '../../utils/helper';
import Button from '../Button';
import Icon from '../Icon';
import Row from '../Row';
import Seperator from '../Seperator';
import Text from '../Text';

interface IReportModal {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reason: string, files: any[]) => void;
    loading?: boolean;
}

const ReportModal: FC<IReportModal> = ({ visible, onClose, onSubmit, loading }) => {
    const [reason, setReason] = useState('');
    const [files, setFiles] = useState<any[]>([]);

    const handleClose = () => {
        setReason('');
        setFiles([]);
        onClose();
    };

    const handleSubmit = () => {
        onSubmit(reason, files);
    };

    const handlePickFiles = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'mixed',
                selectionLimit: 0, // 0 means unlimited
            });
            if (result.assets && result.assets.length > 0) {
                const newFiles = result.assets.map(asset => ({
                    uri: asset.uri,
                    type: asset.type,
                    name: asset.fileName || `file_${Date.now()}`,
                }));
                setFiles(prev => [...prev, ...newFiles]);
            }
        } catch (err) {
            console.error('Error picking files:', err);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
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

                            <Text size={16} weight="bold" style={styles.title}>
                                Report Details<Text color="#FF0000">*</Text> :
                            </Text>
                            <Seperator size={12} />

                            <TextInput
                                style={styles.textInput}
                                placeholder="Write Here......"
                                placeholderTextColor={colors.icon_gray}
                                value={reason}
                                onChangeText={setReason}
                                multiline
                                numberOfLines={4}
                            />

                            <Seperator size={15} />

                            <TouchableOpacity style={styles.upload_btn} onPress={handlePickFiles}>
                                <Icon source={images.upload} size={24} tint_color={colors.white} />
                                <Text size={14}>
                                    Upload Files <Text size={12} color={colors.icon_gray}>(Images/Videos)</Text>
                                </Text>
                            </TouchableOpacity>

                            {files.length > 0 && (
                                <View style={styles.files_container}>
                                    {files.map((file, index) => (
                                        <Row key={index} align="center" justify="space-between" style={styles.file_item}>
                                            <Text size={12} lines={1} style={styles.file_name}>{file.name}</Text>
                                            <TouchableOpacity onPress={() => removeFile(index)}>
                                                <Icon source={images.cross} size={16} tint_color={colors.white} />
                                            </TouchableOpacity>
                                        </Row>
                                    ))}
                                </View>
                            )}

                            <Seperator size={25} />

                            <Button
                                text="Report"
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
    title: {
        fontStyle: 'italic',
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
    upload_btn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    files_container: {
        marginTop: heightPixel(10),
    },
    file_item: {
        backgroundColor: colors.light_primary,
        padding: widthPixel(8),
        borderRadius: 5,
        marginBottom: heightPixel(5),
    },
    file_name: {
        flex: 1,
        marginRight: widthPixel(10),
    },
    submit_btn: {
        width: '60%',
        alignSelf: 'center',
    },
});

export default ReportModal;

