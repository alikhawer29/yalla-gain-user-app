import { FC, useState, useMemo } from "react";
import { Modal, View, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Row from "../Row";
import Icon from "../Icon";
import Text from "../Text";
import images from "../../assets/images";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";
import { useGetReactsQuery } from "../../redux/Apis/User";

interface IPostReactionsModal {
    visible: boolean;
    onClose: () => void;
    post_id?: string | number;
    reaction_count: number;
}

type ReactionType = 'all' | 'like' | 'heart';

const PostReactionsModal: FC<IPostReactionsModal> = ({ visible, onClose, post_id, reaction_count }) => {
    const [selectedTab, setSelectedTab] = useState<ReactionType>('all');

    // Fetch reactions from API
    const { data, isLoading, isFetching } = useGetReactsQuery(post_id, {
        skip: !visible || !post_id, // Skip query if modal is not visible or no post_id
    });

    // Map API response to match our component structure
    const reactions = useMemo(() => {
        if (!data?.data) return [];
        return data.data.map((item: any) => ({
            id: item.id,
            user: item.user,
            reaction_type: item.reaction === 'love' ? 'heart' : 'like' as 'like' | 'heart'
        }));
    }, [data]);

    // Filter reactions based on selected tab
    const filteredReactions = useMemo(() => {
        if (selectedTab === 'all') return reactions;
        return reactions.filter((r: any) => r.reaction_type === selectedTab);
    }, [selectedTab, reactions]);

    // Count reactions by type
    const reactionCounts = useMemo(() => {
        const counts = { all: reactions.length, like: 0, heart: 0 };
        reactions.forEach((r: any) => {
            if (r.reaction_type === 'like') counts.like++;
            if (r.reaction_type === 'heart') counts.heart++;
        });
        return counts;
    }, [reactions]);

    const renderReactionItem = ({ item }: { item: any }) => {
        const userPhoto = item.user?.photo || item.user?.image
        const photoSource = userPhoto ? { uri: userPhoto } : images.dummy

        return (
            <View style={{
                paddingVertical: heightPixel(15),
                borderBottomWidth: 1,
                borderBottomColor: colors.dark_gray,
            }}>
                <Row align="center" gap={15}>
                    {/* User Avatar with Reaction Badge */}
                    <View style={{ position: 'relative' }}>
                        <Icon
                            source={photoSource}
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
        )
    };

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
                    {isLoading || isFetching ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(50) }}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : filteredReactions.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(50) }}>
                            <Text size={14} color={colors.icon_gray}>No reactions yet</Text>
                        </View>
                    ) : (
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
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

export default PostReactionsModal;

