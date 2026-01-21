import { FC } from "react";
import { Modal, View, TouchableOpacity } from "react-native";
import Icon from "../Icon";
import Text from "../Text";
import images from "../../assets/images";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";

interface IContactSuccessModal {
    visible: boolean;
    onClose: () => void;
}

const ContactSuccessModal: FC<IContactSuccessModal> = ({ visible, onClose }) => {
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
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Icon source={images.close_button} size={30} />
                    </TouchableOpacity>

                    {/* Success Icon */}
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: heightPixel(20),
                        }}
                    >
                        <Icon source={images.modal_check} size={80} />
                    </View>

                    {/* Title */}
                    <Text size={24} weight="bold" color={colors.white} style={{ marginBottom: heightPixel(15) }}>
                        Successfully
                    </Text>

                    {/* Message */}
                    <Text
                        size={14}
                        color={colors.white}
                        position="center"
                        style={{ marginBottom: heightPixel(30), lineHeight: 22 }}
                    >
                        Your Message Has Been{'\n'}Submitted Successfully
                    </Text>

                    {/* OK Button */}
                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            backgroundColor: '#118076',
                            paddingVertical: heightPixel(15),
                            paddingHorizontal: widthPixel(60),
                            borderRadius: heightPixel(10),
                            alignItems: 'center',
                            borderWidth: 1,
                        }}
                    >
                        <Text size={16} weight="semibold" color={colors.white}>
                            Ok
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default ContactSuccessModal;
