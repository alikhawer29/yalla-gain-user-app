import { FC } from "react";
import { Modal, View, FlatList, TouchableOpacity } from "react-native";
import Row from "../Row";
import Icon from "../Icon";
import Text from "../Text";
import images from "../../assets/images";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";

interface IPostReactionsModal {
    visible: boolean;
    onClose: () => void;
    post_id?: string | number;
    reaction_count: number;
}

const PostReactionsModal: FC<IPostReactionsModal> = ({ visible, onClose, post_id, reaction_count }) => {
    // Mock data - replace with actual API call
    const reactions = [
        { id: 1, user: { first_name: "Marvel", last_name: "Edward", image: images.dummy } },
        { id: 2, user: { first_name: "Madvin", last_name: "", image: images.dummy } },
        { id: 3, user: { first_name: "Marvel", last_name: "Edward", image: images.dummy } },
        { id: 4, user: { first_name: "Juliana", last_name: "David", image: images.dummy } },
        { id: 5, user: { first_name: "Roy", last_name: "Rose", image: images.dummy } },
        { id: 6, user: { first_name: "Marvel", last_name: "Edward", image: images.dummy } },
        { id: 7, user: { first_name: "Colin", last_name: "Shaien", image: images.dummy } },
    ];

    const renderReactionItem = ({ item }: { item: any }) => (
        <View style={{
            paddingVertical: heightPixel(15),
            borderBottomWidth: 1,
            borderBottomColor: colors.dark_gray,
        }}>
            <Row align="center" gap={15}>
                <Icon
                    source={item.user?.image || images.dummy}
                    size={45}
                    rounded
                    no_padding
                    border={colors.white}
                    resize="cover"
                />
                <Text weight="medium" size={15}>
                    {item.user?.first_name} {item.user?.last_name}
                </Text>
            </Row>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'flex-end',
                }}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        backgroundColor: colors.light_primary, // Dark background
                        borderTopLeftRadius: heightPixel(20),
                        borderTopRightRadius: heightPixel(20),
                        height: '90%', // Taller modal
                    }}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <View style={{
                        paddingHorizontal: widthPixel(20),
                        paddingVertical: heightPixel(20),
                        // borderBottomWidth: 1,
                        // borderBottomColor: colors.dark_gray,
                    }}>
                        <Row align="center" gap={10}>
                            <TouchableOpacity onPress={onClose}>
                                <Icon source={images.back} size={20} tint_color={colors.white} />
                            </TouchableOpacity>
                            <Text weight="semibold" size={16}>People Who Reacted</Text>
                        </Row>
                    </View>

                    {/* Reaction Tabs */}
                    <View style={{ paddingHorizontal: widthPixel(20), borderBottomWidth: 1, borderBottomColor: colors.dark_gray }}>
                        <TouchableOpacity style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingBottom: heightPixel(10),
                            borderBottomWidth: 2,
                            borderBottomColor: colors.primary, // Green underline
                            alignSelf: 'flex-start',
                            gap: 5
                        }}>
                            <Icon source={images.like} size={15} tint_color={colors.primary} />
                            <Text size={14} color={colors.icon_gray}>1.25k</Text>
                        </TouchableOpacity>
                    </View>

                    {/* List of people who reacted */}
                    <FlatList
                        data={reactions}
                        renderItem={renderReactionItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{
                            paddingHorizontal: widthPixel(20),
                            paddingBottom: heightPixel(20),
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

export default PostReactionsModal;

