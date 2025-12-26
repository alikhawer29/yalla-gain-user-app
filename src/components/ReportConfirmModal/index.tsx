import { FC } from "react";
import { Modal, View, TouchableOpacity } from "react-native";
import Icon from "../Icon";
import Text from "../Text";
import images from "../../assets/images";
import colors from "../../utils/colors";
import { heightPixel, widthPixel, font } from "../../utils/helper";

interface IReportConfirmModal {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ReportConfirmModal: FC<IReportConfirmModal> = ({ visible, onClose, onConfirm }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: widthPixel(20),
                }}
            >
                <View
                    style={{
                        backgroundColor: '#333333',
                        borderRadius: heightPixel(20),
                        padding: heightPixel(30),
                        width: '90%',
                        maxWidth: widthPixel(350),
                        alignItems: 'center',
                    }}
                >
                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            position: 'absolute',
                            top: heightPixel(15),
                            right: widthPixel(15),
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            // backgroundColor: colors.dark_gray,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Icon source={images.close_button} size={30} />
                    </TouchableOpacity>

                    {/* Warning Icon */}
                    {/* <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: colors.danger,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: heightPixel(20),
                        }}
                    >
                        <Icon source={images.warning} size={80} />
                    </View> */}
                    <Icon source={images.warning} size={80} />

                    {/* Title */}
                    <Text size={24} weight="bold" color={colors.white} style={{ marginBottom: heightPixel(15) }}>
                        Report
                    </Text>

                    {/* Message */}
                    <Text
                        size={14}
                        color={colors.icon_gray}
                        position="center"
                        style={{ marginBottom: heightPixel(30), lineHeight: 22 }}
                    >
                        Are You Sure You Want To Report{'\n'}This Post?
                    </Text>

                    {/* Buttons */}
                    <View style={{ flexDirection: 'row', gap: widthPixel(15), width: '100%' }}>
                        <TouchableOpacity
                            onPress={onConfirm}
                            style={{
                                flex: 1,
                                backgroundColor: colors.primary,
                                paddingVertical: heightPixel(15),
                                borderRadius: heightPixel(10),
                                alignItems: 'center',
                            }}
                        >
                            <Text size={16} weight="semibold" color={colors.white}>
                                Yes
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onClose}
                            style={{
                                flex: 1,
                                backgroundColor: 'transparent',
                                paddingVertical: heightPixel(15),
                                borderRadius: heightPixel(10),
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: colors.dark_gray,
                            }}
                        >
                            <Text size={16} weight="semibold" color={colors.white}>
                                No
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ReportConfirmModal;

