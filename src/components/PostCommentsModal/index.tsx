import { FC, useState, useRef, useMemo } from "react";
import { Modal, View, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import Row from "../Row";
import Icon from "../Icon";
import Text from "../Text";
import images from "../../assets/images";
import colors from "../../utils/colors";
import { heightPixel, widthPixel, font } from "../../utils/helper";
import ReactionPicker from "../ReactionPicker";
import { useGetCommentsQuery, usePostCommentMutation, useReactCommentMutation } from "../../redux/Apis/User";

interface IPostCommentsModal {
    visible: boolean;
    onClose: () => void;
    post_id?: string | number;
    comment_count: number;
    onCommentAdded?: () => void;
}

interface CommentReaction {
    [commentId: number]: 'like' | 'heart' | null;
}

const PostCommentsModal: FC<IPostCommentsModal> = ({ visible, onClose, post_id, comment_count, onCommentAdded }) => {
    const [commentText, setCommentText] = useState("");
    const [commentReactions, setCommentReactions] = useState<CommentReaction>({});
    const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null);
    const [reactionButtonPositions, setReactionButtonPositions] = useState<{ [key: number]: { x: number, y: number } }>({});
    const reactionButtonRefs = useRef<{ [key: number]: View | null }>({});

    // API hooks
    const { data, isLoading, isFetching, refetch } = useGetCommentsQuery(post_id, {
        skip: !visible || !post_id, // Skip query if modal is not visible or no post_id
    });
    const [postComment, { isLoading: isPostingComment }] = usePostCommentMutation();
    const [reactComment] = useReactCommentMutation();

    // Map API response to component structure
    const comments = useMemo(() => {
        if (!data?.data) return [];
        return data.data.map((item: any) => ({
            id: item.id,
            user: item.user,
            comment: item.comment,
            reaction_count: item.reactions?.length || 0,
            reactions: item.reactions || [],
            created_at: item.created_at
        }));
    }, [data]);

    const handleSendComment = async () => {
        if (commentText.trim() && post_id) {
            try {
                await postComment({
                    id: post_id,
                    body: { comment: commentText }
                }).unwrap();
                setCommentText("");
                refetch(); // Refresh comments list
                onCommentAdded?.(); // Notify parent to increment count
            } catch (error) {
                console.error('Post comment error:', error);
            }
        }
    };

    const handleReaction = async (commentId: number, reaction: 'like' | 'heart') => {
        const previousReaction = commentReactions[commentId];
        // Optimistic update
        setCommentReactions(prev => ({
            ...prev,
            [commentId]: prev[commentId] === reaction ? null : reaction
        }));
        
        try {
            await reactComment({
                id: commentId,
                body: { reaction: reaction === 'heart' ? 'love' : 'like' }
            }).unwrap();
        } catch (error) {
            // Revert on error
            setCommentReactions(prev => ({ ...prev, [commentId]: previousReaction }));
            console.error('React comment error:', error);
        }
    };

    const toggleReaction = async (commentId: number) => {
        const currentReaction = commentReactions[commentId];
        if (currentReaction) {
            // Remove reaction if already reacted
            const previousReaction = currentReaction;
            setCommentReactions(prev => ({ ...prev, [commentId]: null }));
            try {
                await reactComment({
                    id: commentId,
                    body: { reaction: previousReaction === 'heart' ? 'love' : 'like' }
                }).unwrap();
            } catch (error) {
                setCommentReactions(prev => ({ ...prev, [commentId]: previousReaction }));
            }
        } else {
            // Quick like
            handleReaction(commentId, 'like');
        }
    };

    const renderCommentItem = ({ item }: { item: any }) => {
        const userPhoto = item.user?.photo || item.user?.image
        const photoSource = userPhoto ? { uri: userPhoto } : images.dummy
        
        return (
            <View style={{
                paddingVertical: heightPixel(15),
                borderBottomWidth: 1,
                borderBottomColor: colors.dark_gray,
            }}>
                <Row align="flex-start" gap={12}>
                    <Icon
                        source={photoSource}
                        size={45}
                        rounded
                        no_padding
                        border={colors.white}
                        resize="cover"
                    />
                    <View style={{ flex: 1 }}>
                        <Row justify="space-between" align="center" style={{ marginBottom: heightPixel(5) }}>
                            <Text weight="semibold" size={15}>
                                {item.user?.first_name} {item.user?.last_name}
                            </Text>
                            <TouchableOpacity>
                                <Icon source={images.dots} size={15} tint_color={colors.white} />
                            </TouchableOpacity>
                        </Row>

                        <Text size={13} color={colors.icon_gray} style={{ lineHeight: 20 }}>
                            {item.comment}
                        </Text>

                    <Row align="center" gap={15} style={{ marginTop: heightPixel(8) }}>
                        {/* Reaction Button */}
                        <View
                            ref={(ref) => {
                                if (ref) {
                                    reactionButtonRefs.current[item.id] = ref;
                                }
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => toggleReaction(item.id)}
                                onLongPress={() => {
                                    reactionButtonRefs.current[item.id]?.measureInWindow((x, y, width, height) => {
                                        // Calculate centered position above the Like button
                                        // Picker width is approximately 110px (2 icons * 35px + padding)
                                        const pickerWidth = 110;
                                        const centeredX = x + (width / 2) - (pickerWidth / 2);
                                        const topY = y - 60; // 60px above the button
                                        setReactionButtonPositions(prev => ({
                                            ...prev,
                                            [item.id]: { x: centeredX, y: topY }
                                        }));
                                    });
                                    setShowReactionPicker(item.id);
                                }}
                                delayLongPress={100}
                            >
                                <Row align="center" gap={4}>
                                    <Icon
                                        source={
                                            commentReactions[item.id] === 'heart' ? images.heart :
                                                images.post_like
                                        }
                                        size={14}
                                        tint_color={
                                            commentReactions[item.id] === 'heart' ? colors.danger :
                                                commentReactions[item.id] === 'like' ? colors.primary :
                                                    colors.icon_gray
                                        }
                                    />
                                    <Text
                                        size={12}
                                        color={commentReactions[item.id] ? colors.primary : colors.icon_gray}
                                        weight={commentReactions[item.id] ? "semibold" : "regular"}
                                    >
                                        {commentReactions[item.id] === 'heart' ? 'Love' : 'Like'}
                                    </Text>
                                </Row>
                            </TouchableOpacity>
                        </View>

                        {/* Reaction Count */}
                        <Row align="center" gap={4}>
                            <Icon source={images.heart} size={12} tint_color={colors.icon_gray} />
                            <Text size={12} color={colors.icon_gray}>
                                {item.reaction_count}
                            </Text>
                        </Row>
                    </Row>
                </View>
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1, maxHeight: '90%' }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: colors.blackish_gray,
                            borderTopLeftRadius: heightPixel(20),
                            borderTopRightRadius: heightPixel(20),
                            flex: 1,
                        }}
                    >
                        {/* Header */}
                        <View style={{
                            paddingHorizontal: widthPixel(20),
                            paddingVertical: heightPixel(20),
                            borderBottomWidth: 1,
                            borderBottomColor: colors.dark_gray,
                        }}>
                            <Row align="center" gap={15}>
                                <TouchableOpacity onPress={onClose}>
                                    <Icon source={images.back} size={20} tint_color={colors.white} />
                                </TouchableOpacity>
                                <Row align="center" gap={8}>
                                    {/* Matches the 'V 200' style in image */}
                                    <Icon source={images.post_like} size={20} tint_color={colors.primary} />
                                    <Text weight="semibold" size={16}>
                                        {comment_count || comments.length}
                                    </Text>
                                </Row>
                            </Row>
                        </View>

                        {/* List of comments - Scrollable */}
                        {isLoading || isFetching ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(50) }}>
                                <ActivityIndicator size="large" color={colors.primary} />
                            </View>
                        ) : comments.length === 0 ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(50) }}>
                                <Text size={14} color={colors.icon_gray}>No comments yet</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={comments}
                                renderItem={renderCommentItem}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={{
                                    paddingHorizontal: widthPixel(20),
                                    paddingBottom: heightPixel(100) // Extra padding for input area
                                }}
                                showsVerticalScrollIndicator={true}
                                style={{ flex: 1 }}
                            />
                        )}

                        {/* Comment Input - Fixed at Bottom */}
                        <View style={{
                            paddingHorizontal: widthPixel(20),
                            paddingVertical: heightPixel(15),
                            borderTopWidth: 1,
                            borderTopColor: colors.dark_gray,
                            backgroundColor: colors.blackish_gray,
                        }}>
                            <Row align="center" gap={12}>
                                <View style={{
                                    flex: 1,
                                    backgroundColor: colors.blackish_gray,
                                    borderRadius: heightPixel(10),
                                    paddingHorizontal: widthPixel(15),
                                    paddingVertical: heightPixel(12),
                                    borderWidth: 1,
                                    borderColor: colors.dark_gray
                                }}>
                                    <TextInput
                                        style={{
                                            color: colors.white,
                                            fontSize: font(14),
                                            padding: 0,
                                            maxHeight: heightPixel(100),
                                        }}
                                        placeholder="Write Comment"
                                        placeholderTextColor={colors.white}
                                        value={commentText}
                                        onChangeText={setCommentText}
                                        multiline
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={handleSendComment}
                                    disabled={isPostingComment || !commentText.trim()}
                                    style={{
                                        width: 45,
                                        height: 45,
                                        borderRadius: 25,
                                        backgroundColor: colors.primary,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        opacity: (isPostingComment || !commentText.trim()) ? 0.5 : 1
                                    }}
                                >
                                    {isPostingComment ? (
                                        <ActivityIndicator color={colors.white} size="small" />
                                    ) : (
                                        <Icon source={images.send} size={20} tint_color={colors.white} />
                                    )}
                                </TouchableOpacity>
                            </Row>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </TouchableOpacity>

            {/* Reaction Picker */}
            {showReactionPicker !== null && (
                <ReactionPicker
                    visible={showReactionPicker !== null}
                    onClose={() => setShowReactionPicker(null)}
                    onSelectReaction={(reaction) => {
                        handleReaction(showReactionPicker, reaction);
                        setShowReactionPicker(null);
                    }}
                    position={reactionButtonPositions[showReactionPicker]}
                />
            )}
        </Modal>
    );
};

export default PostCommentsModal;

