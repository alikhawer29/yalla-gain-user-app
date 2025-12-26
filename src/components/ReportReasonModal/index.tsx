import { FC, useState } from "react";
import { Modal, View, TouchableOpacity, TextInput } from "react-native";
import Icon from "../Icon";
import Text from "../Text";
import images from "../../assets/images";
import colors from "../../utils/colors";
import { heightPixel, widthPixel, font } from "../../utils/helper";

interface IReportReasonModal {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

const ReportReasonModal: FC<IReportReasonModal> = ({ visible, onClose, onSubmit }) => {
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        if (reason.trim()) {
            onSubmit(reason);
            setReason("");
        }
    };

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

                    {/* Title */}
                    <Text size={18} weight="bold" color={colors.white} style={{ marginBottom: heightPixel(20) }}>
                        Reason <Text color={colors.danger}>*</Text> :
                    </Text>

                    {/* Text Input */}
                    <TextInput
                        style={{
                            backgroundColor: '#333333',
                            borderRadius: heightPixel(10),
                            padding: heightPixel(15),
                            color: colors.white,
                            fontSize: font(14),
                            minHeight: heightPixel(120),
                            textAlignVertical: 'top',
                            marginBottom: heightPixel(25),
                            borderWidth: 1,
                            borderColor: colors.icon_gray,
                        }}
                        placeholder="Write Reason......"
                        placeholderTextColor={colors.icon_gray}
                        multiline
                        value={reason}
                        onChangeText={setReason}
                    />

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!reason.trim()}
                        style={{
                            backgroundColor: reason.trim() ? colors.primary : colors.icon_gray,
                            paddingVertical: heightPixel(15),
                            borderRadius: heightPixel(10),
                            alignItems: 'center', borderWidth: 1,
                            // borderColor: colors.icon_gray,
                        }}
                    >
                        <Text size={16} weight="semibold" color={colors.white}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default ReportReasonModal;

