import { FC, useState, useRef, useMemo, useEffect } from "react";
import { Modal, View, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, Text as RNText } from "react-native";
import Row from "../Row";
import Icon from "../Icon";
import Text from "../Text";
import images from "../../assets/images";
import colors from "../../utils/colors";
import { heightPixel, widthPixel, font } from "../../utils/helper";
import { EMOJI_FONT_FAMILY, insertEmojiAt, TextSelection } from "../../utils/emoji";
import EmojiPicker from "../EmojiPicker";
import ReactionPicker from "../ReactionPicker";
import { useGetCommentsQuery, usePostCommentMutation, useReactCommentMutation, useDeleteCommentMutation } from "../../redux/Apis/User";
import { useAppSelector } from "../../hooks";
import { selectUser } from "../../redux/Slices/AuthSlice";
import { useModal } from "../../contexts/ModalContext";

interface IPostCommentsModal {
    visible: boolean;
    onClose: () => void;
    post_id?: string | number;
    comment_count: number;
    onCommentAdded?: () => void;
    onCommentDeleted?: () => void;
}

interface CommentReaction {
    [commentId: number]: 'like' | 'heart' | null;
}

const PostCommentsModal: FC<IPostCommentsModal> = ({ visible, onClose, post_id, comment_count, onCommentAdded, onCommentDeleted }) => {
    const [commentText, setCommentText] = useState("");
    const [commentReactions, setCommentReactions] = useState<CommentReaction>({});
    const [isUpdatingReaction, setIsUpdatingReaction] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const selectionRef = useRef<TextSelection>({ start: 0, end: 0 });
    const currentUser = useAppSelector(selectUser);
    const currentUserId = currentUser?.id;

    const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null);
    const [reactionButtonPositions, setReactionButtonPositions] = useState<{ [key: number]: { x: number, y: number } }>({});
    const reactionButtonRefs = useRef<{ [key: number]: View | null }>({});

    // API hooks
    const { data, isLoading, isFetching, refetch } = useGetCommentsQuery(post_id, {
        skip: !visible || !post_id, // Skip query if modal is not visible or no post_id
    });
    const [postComment, { isLoading: isPostingComment }] = usePostCommentMutation();
    const [reactComment] = useReactCommentMutation();
    const [deleteComment, { isLoading: isDeletingComment }] = useDeleteCommentMutation();
    const { showYesNoModal } = useModal();

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

    // Initialize comment reactions from API response
    useEffect(() => {
        if (currentUserId && data?.data) {
            const reactions: CommentReaction = {};
            // Process all comments from API data
            data.data.forEach((item: any) => {
                // Find current user's reaction
                const userReaction = item.reactions?.find((r: any) => r.user?.id === currentUserId);
                if (userReaction) {
                    // Map API reaction type to component reaction type
                    reactions[item.id] = userReaction.reaction === 'love' ? 'heart' : 'like';
                } else {
                    // Explicitly set to null if user has no reaction
                    reactions[item.id] = null;
                }
            });
            // Always update to ensure removed reactions are cleared
            setCommentReactions(reactions);
        }
    }, [data, currentUserId]);

    useEffect(() => {
        if (!visible) {
            setShowEmojiPicker(false);
        }
    }, [visible]);

    const handleSendComment = async () => {
        if (commentText.trim() && post_id) {
            try {
                await postComment({
                    id: post_id,
                    body: { comment: commentText }
                }).unwrap();
                setCommentText("");
                selectionRef.current = { start: 0, end: 0 };
                setShowEmojiPicker(false);
                refetch(); // Refresh comments list
                onCommentAdded?.(); // Notify parent to increment count
            } catch (error) {
                console.error('Post comment error:', error);
            }
        }
    };

    const handleSelectEmoji = (emoji: string) => {
        const result = insertEmojiAt(commentText, emoji, selectionRef.current);
        setCommentText(result.text);
        selectionRef.current = result.selection;
    };

    const toggleEmojiPicker = () => {
        if (showEmojiPicker) {
            setShowEmojiPicker(false);
            return;
        }
        Keyboard.dismiss();
        setShowEmojiPicker(true);
    };

    const handleReaction = async (commentId: number, reaction: 'like' | 'heart') => {
        const previousReaction = commentReactions[commentId];
        const isRemoving = previousReaction === reaction;

        // Optimistic update
        setCommentReactions(prev => ({
            ...prev,
            [commentId]: isRemoving ? null : reaction
        }));

        setIsUpdatingReaction(true);
        try {
            await reactComment({
                id: commentId,
                body: { reaction: reaction === 'heart' ? 'love' : 'like' }
            }).unwrap();
            // Refetch to get updated reactions and wait for it to complete
            await refetch();
        } catch (error) {
            // Revert on error
            setCommentReactions(prev => ({ ...prev, [commentId]: previousReaction }));
            console.error('React comment error:', error);
        } finally {
            setIsUpdatingReaction(false);
        }
    };

    const toggleReaction = async (commentId: number) => {
        const currentReaction = commentReactions[commentId];
        if (currentReaction) {
            // Remove reaction if already reacted
            const previousReaction = currentReaction;
            setCommentReactions(prev => ({ ...prev, [commentId]: null }));
            setIsUpdatingReaction(true);
            try {
                await reactComment({
                    id: commentId,
                    body: { reaction: previousReaction === 'heart' ? 'love' : 'like' }
                }).unwrap();
                // Refetch to get updated reactions and wait for it to complete
                await refetch();
            } catch (error) {
                setCommentReactions(prev => ({ ...prev, [commentId]: previousReaction }));
                console.error('Unreact comment error:', error);
            } finally {
                setIsUpdatingReaction(false);
            }
        } else {
            // Quick like
            handleReaction(commentId, 'like');
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            await deleteComment(commentId).unwrap();
            // Refresh comments list
            await refetch();
            // Notify parent to decrement count
            onCommentDeleted?.();
        } catch (error) {
            console.error('Delete comment error:', error);
        }
    };

    const confirmDeleteComment = (commentId: number) => {
        showYesNoModal(
            {
                type: 'warning',
                title: 'Delete Comment',
                message: 'Are you sure you want to delete this comment? This action cannot be undone.',
            },
            () => {
                handleDeleteComment(commentId);
            }
        );
    };

    const renderCommentItem = ({ item }: { item: any }) => {
        const userPhoto = item.user?.photo || item.user?.image
        const photoSource = userPhoto ? { uri: userPhoto } : images.dummy

        // Calculate reaction types and counts
        const hasReactions = item.reactions && item.reactions.length > 0;
        const userReaction = commentReactions[item.id];

        // Count reaction types (excluding current user's reaction to avoid double counting)
        const likeCount = item.reactions?.filter((r: any) => r.reaction === 'like').length || 0;
        const heartCount = item.reactions?.filter((r: any) => r.reaction === 'love').length || 0;
        const totalReactions = item.reaction_count || 0;

        // Determine which icons to show (like Facebook)
        // Show like icon if: there are likes from others OR user has liked
        const showLikeIcon = likeCount > 0 || (userReaction === 'like');
        // Show heart icon if: there are hearts from others OR user has heart reacted
        const showHeartIcon = heartCount > 0 || (userReaction === 'heart');
        // Show both icons if both conditions are true
        const showBothIcons = showLikeIcon && showHeartIcon;

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
                            {item.user?.id === currentUserId && (
                                <TouchableOpacity
                                    onPress={() => confirmDeleteComment(item.id)}
                                    disabled={isDeletingComment}
                                >
                                    <Icon
                                        source={images.dots}
                                        size={15}
                                        tint_color={isDeletingComment ? colors.icon_gray : colors.white}
                                    />
                                </TouchableOpacity>
                            )}
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
                                        {/* <Icon
                                            source={userReaction === 'heart' ? images.heart : images.post_like}
                                            size={14}
                                            tint_color={userReaction ? (userReaction === 'heart' ? colors.danger : colors.primary) : colors.icon_gray}
                                        /> */}
                                        <Text
                                            size={12}
                                            color={userReaction ? (userReaction === 'heart' ? colors.danger : colors.primary) : colors.icon_gray}
                                            weight={userReaction ? "semibold" : "regular"}
                                        >
                                            {userReaction === 'heart' ? 'Love' : 'Like'}
                                        </Text>
                                    </Row>
                                </TouchableOpacity>
                            </View>

                            {/* Reaction Count - Show icons like Facebook */}
                            {hasReactions && totalReactions > 0 && (
                                <Row align="center" gap={4}>
                                    {showBothIcons && (
                                        <>
                                            <Icon
                                                source={images.heart}
                                                size={14}
                                                tint_color={colors.danger}
                                            />
                                            <Icon
                                                source={images.post_like}
                                                size={14}
                                                tint_color={colors.primary}
                                            />
                                        </>
                                    )}
                                    {!showBothIcons && showHeartIcon && (
                                        <Icon
                                            source={images.heart}
                                            size={14}
                                            tint_color={colors.danger}
                                        />
                                    )}
                                    {!showBothIcons && showLikeIcon && !showHeartIcon && (
                                        <Icon
                                            source={images.post_like}
                                            size={14}
                                            tint_color={colors.primary}
                                        />
                                    )}
                                    <Text size={12} color={colors.icon_gray}>
                                        {totalReactions}
                                    </Text>
                                </Row>
                            )}
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
                                        {comments.length > 0 ? comments.length : comment_count}
                                    </Text>
                                </Row>
                            </Row>
                        </View>

                        {/* List of comments - Scrollable */}
                        {isLoading || (isFetching && !isUpdatingReaction) ? (
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
                                        onChangeText={(text) => {
                                            setCommentText(text);
                                            selectionRef.current = { start: text.length, end: text.length };
                                        }}
                                        onSelectionChange={(event) => {
                                            selectionRef.current = event.nativeEvent.selection;
                                        }}
                                        onFocus={() => setShowEmojiPicker(false)}
                                        multiline
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={toggleEmojiPicker}
                                    style={{
                                        width: 45,
                                        height: 45,
                                        borderRadius: 25,
                                        backgroundColor: colors.dark_gray,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <RNText
                                        allowFontScaling={false}
                                        style={{
                                            fontSize: font(20),
                                            fontFamily: EMOJI_FONT_FAMILY,
                                        }}
                                    >
                                        😊
                                    </RNText>
                                </TouchableOpacity>
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
                            <EmojiPicker visible={showEmojiPicker} onSelect={handleSelectEmoji} />
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

