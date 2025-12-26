import { FC } from "react";
import { Modal, View, TouchableOpacity, Animated } from "react-native";
import Row from "../Row";
import Icon from "../Icon";
import images from "../../assets/images";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";

interface IReactionPicker {
    visible: boolean;
    onClose: () => void;
    onSelectReaction: (reaction: 'like' | 'heart') => void;
    position?: { x: number; y: number };
}

const ReactionPicker: FC<IReactionPicker> = ({ visible, onClose, onSelectReaction, position }) => {
    const reactions = [
        { type: 'like' as const, icon: images.post_like, label: 'Like' },
        { type: 'heart' as const, icon: images.heart, label: 'Love' },
    ];

    const handleSelectReaction = (type: 'like' | 'heart') => {
        onSelectReaction(type);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                }}
                activeOpacity={1}
                onPress={onClose}
            >
                <View
                    style={{
                        position: 'absolute',
                        top: position?.y || heightPixel(330),
                        left: position?.x || widthPixel(20),
                        backgroundColor: colors.blackish_gray,
                        borderRadius: heightPixel(30),
                        paddingHorizontal: widthPixel(8),
                        paddingVertical: heightPixel(8),
                        flexDirection: 'row',
                        elevation: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                        borderWidth: 1,
                        borderColor: colors.dark_gray,
                    }}
                >
                    {reactions.map((reaction, index) => (
                        <TouchableOpacity
                            key={reaction.type}
                            onPress={() => handleSelectReaction(reaction.type)}
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: widthPixel(8),
                            }}
                        >
                            <Icon
                                source={reaction.icon}
                                size={35}
                                tint_color={reaction.type === 'heart' ? colors.danger : colors.primary}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

export default ReactionPicker;

