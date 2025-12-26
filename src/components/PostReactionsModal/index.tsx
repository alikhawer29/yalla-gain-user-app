import { FC, useState, useMemo } from "react";
import { Modal, View, FlatList, TouchableOpacity, ScrollView } from "react-native";
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

type ReactionType = 'all' | 'like' | 'heart';

const PostReactionsModal: FC<IPostReactionsModal> = ({ visible, onClose, post_id, reaction_count }) => {
    const [selectedTab, setSelectedTab] = useState<ReactionType>('all');

    // Mock data - replace with actual API call
    const reactions = [
        { id: 1, user: { first_name: "Marvel", last_name: "Edward", image: images.dummy }, reaction_type: 'like' as const },
        { id: 2, user: { first_name: "Madvin", last_name: "", image: images.dummy }, reaction_type: 'heart' as const },
        { id: 3, user: { first_name: "Marvel", last_name: "Edward", image: images.dummy }, reaction_type: 'like' as const },
        { id: 4, user: { first_name: "Juliana", last_name: "David", image: images.dummy }, reaction_type: 'heart' as const },
        { id: 5, user: { first_name: "Roy", last_name: "Rose", image: images.dummy }, reaction_type: 'like' as const },
        { id: 6, user: { first_name: "Marvel", last_name: "Edward", image: images.dummy }, reaction_type: 'heart' as const },
        { id: 7, user: { first_name: "Colin", last_name: "Shaien", image: images.dummy }, reaction_type: 'like' as const },
        { id: 8, user: { first_name: "Juliana", last_name: "David", image: images.dummy }, reaction_type: 'heart' as const },
        { id: 9, user: { first_name: "Roy", last_name: "Rose", image: images.dummy }, reaction_type: 'like' as const },
        { id: 10, user: { first_name: "Marvel", last_name: "Edward", image: images.dummy }, reaction_type: 'heart' as const },
        { id: 11, user: { first_name: "Colin", last_name: "Shaien", image: images.dummy }, reaction_type: 'like' as const },
    ];

    // Filter reactions based on selected tab
    const filteredReactions = useMemo(() => {
        if (selectedTab === 'all') return reactions;
        return reactions.filter(r => r.reaction_type === selectedTab);
    }, [selectedTab]);

    // Count reactions by type
    const reactionCounts = useMemo(() => {
        const counts = { all: reactions.length, like: 0, heart: 0 };
        reactions.forEach(r => {
            if (r.reaction_type === 'like') counts.like++;
            if (r.reaction_type === 'heart') counts.heart++;
        });
        return counts;
    }, []);

    const renderReactionItem = ({ item }: { item: any }) => (
        <View style={{
            paddingVertical: heightPixel(15),
            borderBottomWidth: 1,
            borderBottomColor: colors.dark_gray,
        }}>
            <Row align="center" gap={15}>
                {/* User Avatar with Reaction Badge */}
                <View style={{ position: 'relative' }}>
                    <Icon
                        source={item.user?.image || images.dummy}
                        size={45}
                        rounded
                        no_padding
                        border={colors.white}
                        resize="cover"
                    />
                    {/* Reaction Badge - Bottom Right Corner */}
                    <View style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        backgroundColor: colors.light_primary,
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: colors.light_primary,
                    }}>
                        <Icon
                            source={item.reaction_type === 'heart' ? images.heart : images.post_like}
                            size={16}
                            tint_color={item.reaction_type === 'heart' ? colors.danger : colors.primary}
                        />
                    </View>
                </View>
                <Text weight="semibold" size={15}>
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
                    onPress={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: colors.light_primary, // Dark background
                        borderTopLeftRadius: heightPixel(20),
                        borderTopRightRadius: heightPixel(20),
                        maxHeight: '90%', // Taller modal
                        flex: 1,
                    }}
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
                    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.dark_gray }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: widthPixel(20) }}
                        >
                            {/* All Tab */}
                            <TouchableOpacity
                                onPress={() => setSelectedTab('all')}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingBottom: heightPixel(10),
                                    paddingHorizontal: widthPixel(15),
                                    borderBottomWidth: 2,
                                    borderBottomColor: selectedTab === 'all' ? colors.primary : 'transparent',
                                    gap: 5,
                                    marginRight: widthPixel(10),
                                }}
                            >
                                <Text
                                    size={14}
                                    color={selectedTab === 'all' ? colors.white : colors.icon_gray}
                                    weight={selectedTab === 'all' ? "semibold" : "regular"}
                                >
                                    All
                                </Text>
                                <Text size={14} color={colors.icon_gray}>
                                    {reactionCounts.all}
                                </Text>
                            </TouchableOpacity>

                            {/* Like Tab */}
                            <TouchableOpacity
                                onPress={() => setSelectedTab('like')}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingBottom: heightPixel(10),
                                    paddingHorizontal: widthPixel(15),
                                    borderBottomWidth: 2,
                                    borderBottomColor: selectedTab === 'like' ? colors.primary : 'transparent',
                                    gap: 5,
                                    marginRight: widthPixel(10),
                                }}
                            >
                                <Icon source={images.post_like} size={18} tint_color={colors.primary} />
                                <Text size={14} color={colors.icon_gray}>
                                    {reactionCounts.like}
                                </Text>
                            </TouchableOpacity>

                            {/* Heart Tab */}
                            <TouchableOpacity
                                onPress={() => setSelectedTab('heart')}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingBottom: heightPixel(10),
                                    paddingHorizontal: widthPixel(15),
                                    borderBottomWidth: 2,
                                    borderBottomColor: selectedTab === 'heart' ? colors.primary : 'transparent',
                                    gap: 5,
                                }}
                            >
                                <Icon source={images.heart} size={18} tint_color={colors.danger} />
                                <Text size={14} color={colors.icon_gray}>
                                    {reactionCounts.heart}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* List of people who reacted */}
                    <FlatList
                        data={filteredReactions}
                        renderItem={renderReactionItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{
                            paddingHorizontal: widthPixel(20),
                            paddingBottom: heightPixel(20),
                        }}
                        showsVerticalScrollIndicator={true}
                        style={{ flex: 1 }}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

export default PostReactionsModal;

