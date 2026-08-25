import AsyncStorage from '@react-native-async-storage/async-storage';
import { FC, memo, useEffect, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Video from 'react-native-video';
import images from "../../../assets/images";
import { useModal } from "../../../contexts/ModalContext";
import { useAppSelector } from "../../../hooks";
import { useSubscriptionAccess } from "../../../hooks/useSubscriptionAccess";
import { INewsFeedCard } from "../../../interfaces";
import { useDeleteFeedMutation, useReactFeedMutation, useReportFeedMutation, useVotePollMutation } from "../../../redux/Apis/User";
import { selectUser } from "../../../redux/Slices/AuthSlice";
import colors from "../../../utils/colors";
import { heightPixel, widthPixel } from "../../../utils/helper";
import { navigate } from "../../../utils/navigation";
import { ROUTES } from "../../../utils/routes";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Image from "../../Image";
import PostMediaImage from "../../PostMediaImage";
import MediaViewerModal from "../../MediaViewerModal";
import Menu from "../../Menu";
import PostCommentsModal from "../../PostCommentsModal";
import PostReactionsModal from "../../PostReactionsModal";
import ReactionPicker from "../../ReactionPicker";
import ReportConfirmModal from "../../ReportConfirmModal";
import ReportReasonModal from "../../ReportReasonModal";
import ReportSuccessModal from "../../ReportSuccessModal";
import Row from "../../Row";
import Text from "../../Text";

const getPollOptionId = (option: any): string | number | undefined =>
    option?.id ?? option?.poll_option_id;

const POLL_VOTE_KEY_PREFIX = '@poll_vote_';

// Scope the key by user so a new account on the same device never inherits
// another user's votes.
const getPollVoteKey = (
    userId?: string | number,
    postId?: string | number,
) => `${POLL_VOTE_KEY_PREFIX}${userId ?? 'anon'}_${postId}`;

const getStoredPollVote = async (
    userId?: string | number,
    postId?: string | number,
) => {
    if (postId == null || userId == null) return null;
    try {
        return await AsyncStorage.getItem(getPollVoteKey(userId, postId));
    } catch {
        return null;
    }
};

const setStoredPollVote = async (
    userId?: string | number,
    postId?: string | number,
    optionId?: string | number,
) => {
    if (postId == null || optionId == null || userId == null) return;
    try {
        await AsyncStorage.setItem(
            getPollVoteKey(userId, postId),
            String(optionId),
        );
    } catch {
        // ignore storage errors
    }
};

const removeStoredPollVote = async (
    userId?: string | number,
    postId?: string | number,
) => {
    if (postId == null || userId == null) return;
    try {
        await AsyncStorage.removeItem(getPollVoteKey(userId, postId));
    } catch {
        // ignore storage errors
    }
};

const normalizePollOptions = (options: any[] | undefined) =>
    (options ?? []).map(option => ({
        ...option,
        id: getPollOptionId(option),
    }));

const getPollOptionsFromProps = (pollOptions?: any[], poll?: INewsFeedCard['poll']) => {
    if (pollOptions?.length) {
        return normalizePollOptions(pollOptions);
    }
    if (poll?.options?.length) {
        return normalizePollOptions(poll.options);
    }
    return [];
};

const optionIdsMatch = (
    option: any,
    optionId: string | number | undefined,
) => String(getPollOptionId(option)) === String(optionId);

const NewsFeedCard: FC<INewsFeedCard> = ({
    id,
    title,
    content,
    media,
    post_media,
    poll,
    poll_options,
    is_poll,
    measurements,
    reaction_count = 0,
    comment_count = 0,
    user,
    created_at,
    time_ago,
    is_liked,
    is_reacted,
    reaction_type,
    isMyPost = false
}) => {
    const currentUser = useAppSelector(selectUser);
    const { showOkModal, showYesNoModal } = useModal();
    const [reactFeed] = useReactFeedMutation();
    const [reportFeed] = useReportFeedMutation();
    const [votePoll] = useVotePollMutation();
    const [deleteFeed] = useDeleteFeedMutation();
    const { guardAccess } = useSubscriptionAccess();

    const [showReactionsModal, setShowReactionsModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    // Initialize user reaction from API response
    const getInitialReaction = () => {
        if (is_reacted && reaction_type) {
            return reaction_type === 'love' ? 'heart' : 'like'
        }
        return is_liked ? 'like' : null
    }

    const [userReaction, setUserReaction] = useState<'like' | 'heart' | null>(getInitialReaction());
    const [likeButtonPosition, setLikeButtonPosition] = useState({ x: 0, y: 0 });
    const likeButtonRef = useRef<View>(null);

    // Local counts for optimistic updates
    const [localReactionCount, setLocalReactionCount] = useState(reaction_count);
    const [localCommentCount, setLocalCommentCount] = useState(comment_count);

    // Report modals state
    const [showReportConfirm, setShowReportConfirm] = useState(false);
    const [showReportReason, setShowReportReason] = useState(false);
    const [showReportSuccess, setShowReportSuccess] = useState(false);

    // Media viewer state
    const [showMediaViewer, setShowMediaViewer] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState({ url: '', isVideo: false });

    // Poll voting state - track user's own vote locally (API is_selected is not per-user)
    const initialPollOptions = getPollOptionsFromProps(poll_options, poll);
    const [localPollOptions, setLocalPollOptions] = useState(initialPollOptions);
    const [selectedOptionId, setSelectedOptionId] = useState<string | number | null>(null);
    const isVotingRef = useRef(false);
    const [isVoting, setIsVoting] = useState(false);

    useEffect(() => {
        let active = true;
        // Reset first so switching accounts never shows the previous user's vote.
        setSelectedOptionId(null);
        getStoredPollVote(currentUser?.id, id).then(stored => {
            if (active && stored != null) {
                setSelectedOptionId(stored);
            }
        });
        return () => {
            active = false;
        };
    }, [id, currentUser?.id]);

    // Sync local poll options when feed data refreshes (counts only)
    useEffect(() => {
        if (isVotingRef.current) return;

        const nextOptions = getPollOptionsFromProps(poll_options, poll);
        if (nextOptions.length > 0) {
            setLocalPollOptions(nextOptions);
        }
    }, [poll_options, poll, isVoting]);

    // Check if this is user's own post
    const isOwnPost = currentUser?.id === user?.id;

    const handleReaction = async (reaction: 'like' | 'heart') => {
        const previousReaction = userReaction;
        const previousCount = localReactionCount;

        // Optimistic update
        setUserReaction(reaction);
        if (!previousReaction) {
            // Adding new reaction
            setLocalReactionCount(prev => prev + 1);
        }

        try {
            await reactFeed({
                id,
                body: { reaction: reaction === 'heart' ? 'love' : 'like' }
            }).unwrap();
        } catch (error) {
            // Revert on error
            setUserReaction(previousReaction);
            setLocalReactionCount(previousCount);
            console.error('React error:', error);
        }
    };

    const handleReportClick = () => {
        setShowReportConfirm(true);
    };

    const handleReportConfirm = () => {
        setShowReportConfirm(false);
        setShowReportReason(true);
    };

    const handleReportSubmit = async (reason: string) => {
        try {
            await reportFeed({
                id,
                body: { reason }
            }).unwrap();

            setShowReportReason(false);
            setShowReportSuccess(true);
        } catch (error: any) {
            console.error('Report error:', error);
            setShowReportReason(false);
        }
    };

    const handleVotePoll = async (optionId: string | number) => {
        if (
            !localPollOptions?.length ||
            isVotingRef.current ||
            selectedOptionId != null
        ) {
            return;
        }

        const previousOptions = localPollOptions;
        const previousSelectedOptionId = selectedOptionId;

        isVotingRef.current = true;
        setIsVoting(true);

        const updatedOptions = localPollOptions.map((opt: any) => ({
            ...opt,
            votes: optionIdsMatch(opt, optionId)
                ? (opt.votes || 0) + 1
                : (opt.votes || 0),
        }));

        setSelectedOptionId(optionId);
        setLocalPollOptions(updatedOptions);
        await setStoredPollVote(currentUser?.id, id, optionId);

        try {
            await votePoll({
                post_id: id,
                option_id: optionId,
            }).unwrap();
        } catch (error: any) {
            console.error('Vote poll error:', error);
            setSelectedOptionId(previousSelectedOptionId);
            setLocalPollOptions(previousOptions);
            await removeStoredPollVote(currentUser?.id, id);
        } finally {
            isVotingRef.current = false;
            setIsVoting(false);
        }
    };

    const handleReportSuccessClose = () => {
        setShowReportSuccess(false);
    };

    const handleEditPost = () => {
        navigate(ROUTES.EDIT_POST, {
            postId: id,
            postData: {
                id,
                title,
                content,
                media,
                post_media,
                poll_options,
                is_poll
            }
        });
    };

    const handleDeletePost = () => {
        showYesNoModal(
            {
                type: "error",
                title: "Remove Post",
                message: "Are You Sure You Wish To Remove This Post?"
            },
            async () => {
                try {
                    await deleteFeed(id).unwrap();
                    showOkModal({
                        type: "success",
                        title: "Successfully",
                        message: "Post Has Been Removed Successfully"
                    });
                } catch (error: any) {
                    console.error('Delete post error:', error);
                    showOkModal({
                        type: "error",
                        title: "Error",
                        message: error?.data?.message || "Failed to delete post"
                    });
                }
            }
        );
    };

    const handleMediaPress = (mediaUrl: string, isVideo: boolean) => {
        setSelectedMedia({ url: mediaUrl, isVideo });
        setShowMediaViewer(true);
    };

    const handleUserProfileClick = () => {
        if (isMyPost || isOwnPost) {
            guardAccess('messaging', () => navigate(ROUTES.MY_POSTS));
        } else if (user?.id) {
            // Navigate to User Profile
            navigate(ROUTES.USER_PROFILE, { userId: user.id });
        }
    };

    const isVideoFile = (url: string) => {
        if (!url) return false;
        const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
        const lowerUrl = url.toLowerCase();
        return videoExtensions.some(ext => lowerUrl.includes(ext));
    };

    const renderMedia = () => {
        // Use post_media from API or fallback to media
        const mediaItems = post_media && post_media.length > 0 ? post_media : media

        if (!mediaItems || mediaItems.length === 0) return null;

        if (mediaItems.length === 1) {
            const item = mediaItems[0];

            // Get the media URL - handle different API response formats
            let sourceUri: string | undefined;
            if ('path' in item) {
                // API format: { path: "url" }
                sourceUri = item.path;
            } else if ('media_url' in item) {
                // Alternative format: { media_url: "url" }
                sourceUri = item.media_url;
            } else if ('source' in item) {
                // Local format: { source: { uri: "url" } } or { source: "url" }
                sourceUri = typeof item.source === 'string' ? item.source : item.source?.uri;
            }

            // Detect if it's a video from file extension
            const isVideo = isVideoFile(sourceUri || '');

            return (
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleMediaPress(sourceUri || '', isVideo)}
                    style={{ height: heightPixel(250), borderRadius: heightPixel(10), overflow: "hidden", marginTop: heightPixel(10) }}
                >
                    <PostMediaImage uri={sourceUri} />
                    {isVideo && (
                        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                            <Video
                                source={{ uri: sourceUri }}
                                style={{ width: '100%', height: '100%' }}
                                controls
                                paused={true}
                                disableAudioSessionManagement
                            />
                        </View>
                    )}
                </TouchableOpacity>
            );
        }

        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: heightPixel(10) }}>
                {mediaItems.map((item, index) => {
                    // Get the media URL - handle different API response formats
                    let sourceUri: string | undefined;
                    if ('path' in item) {
                        // API format: { path: "url" }
                        sourceUri = item.path;
                    } else if ('media_url' in item) {
                        // Alternative format: { media_url: "url" }
                        sourceUri = item.media_url;
                    } else if ('source' in item) {
                        // Local format: { source: { uri: "url" } } or { source: "url" }
                        sourceUri = typeof item.source === 'string' ? item.source : item.source?.uri;
                    }

                    // Detect if it's a video from file extension
                    const isVideo = isVideoFile(sourceUri || '');

                    return (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.9}
                            onPress={() => handleMediaPress(sourceUri || '', isVideo)}
                            style={{
                                width: mediaItems.length === 2 ? '48%' : '31%',
                                height: heightPixel(150),
                                borderRadius: heightPixel(8),
                                overflow: 'hidden'
                            }}
                        >
                            <PostMediaImage uri={sourceUri} />
                            {isVideo && (
                                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                    <Video
                                        source={{ uri: sourceUri }}
                                        style={{ width: '100%', height: '100%' }}
                                        controls
                                        paused={true}
                                        disableAudioSessionManagement
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>
        );
    };

    const renderPoll = () => {
        if (!is_poll && !poll && !localPollOptions?.length) return null;

        const options = localPollOptions || [];
        if (options.length === 0) return null;

        const totalVotes = options.reduce((sum: number, opt: any) => {
            return sum + (opt.votes || 0);
        }, 0);

        const userHasVoted = selectedOptionId != null;

        return (
            <View style={{ marginTop: heightPixel(10) }}>
                {options.map((option: any, index: number) => {
                    const votes = option.votes || 0;
                    const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                    const optionText = option.option_text || option.label || option.option || '';
                    const optionId = getPollOptionId(option);
                    const isSelected =
                        selectedOptionId != null &&
                        optionIdsMatch(option, selectedOptionId);

                    return (
                        <TouchableOpacity
                            key={optionId ?? index}
                            style={{ marginBottom: heightPixel(10) }}
                            onPress={() => optionId != null && handleVotePoll(optionId)}
                            activeOpacity={0.7}
                            disabled={userHasVoted || isVoting}
                        >
                            <View style={{
                                backgroundColor: isSelected ? 'rgba(0, 128, 128, 0.2)' : 'rgba(60, 60, 60, 0.5)',
                                borderRadius: heightPixel(2),
                                overflow: 'hidden',
                                height: heightPixel(26.59),
                                justifyContent: 'center',
                                borderWidth: isSelected ? 1 : 0,
                                borderColor: isSelected ? colors.primary : 'transparent',
                                position: 'relative'
                            }}>
                                {/* Progress bar background - fills from left */}
                                <View style={{
                                    width: `${percentage}%`,
                                    backgroundColor: isSelected ? 'rgba(0, 128, 128, 0.4)' : 'rgba(80, 80, 80, 0.6)',
                                    height: '100%',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    borderRadius: heightPixel(2)
                                }} />

                                <View style={{ paddingHorizontal: widthPixel(12), zIndex: 1 }}>
                                    <Row justify="space-between" align="center">
                                        <Row align="center" gap={10}>
                                            {/* Number */}
                                            <Text size={14} weight="semibold" color={isSelected ? colors.primary : colors.icon_gray}>
                                                {index + 1}.
                                            </Text>

                                            {/* Checkmark for selected */}
                                            {isSelected && (
                                                <Icon source={images.check} size={18} />
                                            )}

                                            {/* Option text */}
                                            <Text size={14} weight={isSelected ? "semibold" : "regular"} color={colors.white}>
                                                {optionText}
                                            </Text>
                                        </Row>

                                        {/* Percentage */}
                                        <Text size={14} weight="semibold" color={colors.white}>
                                            {percentage}%
                                        </Text>
                                    </Row>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {/* Total votes counter */}
                {/* {userHasVoted && (
                    <Row align="center" gap={5} style={{ marginTop: heightPixel(5) }}>
                        <Icon source={images.post_like} size={16} color={colors.icon_gray} />
                        <Text size={12} color={colors.icon_gray}>
                            {totalVotes}
                        </Text>
                    </Row>
                )} */}
            </View>
        )
    };

    const renderMeasurements = () => {
        if (!measurements) return null;
        return (
            <View style={{ marginTop: heightPixel(10), alignItems: 'center' }}>
                <Text size={16} weight="bold" style={{ marginBottom: heightPixel(10) }}>Body Measurements</Text>
                <Row gap={20} style={{ marginBottom: heightPixel(20) }}>
                    <Text size={12} color={colors.icon_gray}>Height: <Text color={colors.white}>{measurements.height}</Text></Text>
                    <Text size={12} color={colors.icon_gray}>Weight: <Text color={colors.white}>{measurements.weight}</Text></Text>
                </Row>
                <View style={{ height: heightPixel(300), width: '100%', alignItems: 'center' }}>
                    <Image source={measurements.image} resize="contain" style={{ width: '80%', height: '100%' }} />
                    {/* Mock points based on Image 5 */}
                    {/* Chest */}
                    <View style={{ position: 'absolute', top: '30%', left: '25%', flexDirection: 'row', alignItems: 'center' }}>
                        <Text size={10} color={colors.icon_gray} style={{ marginRight: 5 }}>94 cm</Text>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
                        <View style={{ width: 40, height: 1, backgroundColor: colors.primary }} />
                    </View>
                    {/* Waist */}
                    <View style={{ position: 'absolute', top: '45%', right: '25%', flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 40, height: 1, backgroundColor: colors.primary }} />
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
                        <Text size={10} color={colors.icon_gray} style={{ marginLeft: 5 }}>84 cm</Text>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <CardWrapper padding={18} height={"auto"} color={colors.blackish_gray}>
            <Row align="center" gap={12}>
                <TouchableOpacity
                    style={{ flex: 0.9 }}
                    onPress={handleUserProfileClick}
                    activeOpacity={0.7}
                >
                    <Row align="center" gap={12}>
                        <Icon
                            source={user?.photo ? { uri: user.photo } : user?.image || images.dummy}
                            size={45}
                            rounded
                            no_padding
                            border={colors.white}
                            resize="cover"
                        />
                        <View>
                            <Text weight="semibold">{user?.first_name} {user?.last_name}</Text>
                            <Text size={12} color={colors.icon_gray}>{time_ago || created_at || "2 days ago"}</Text>
                        </View>
                    </Row>
                </TouchableOpacity>
                {isMyPost || isOwnPost ? (
                    <Menu
                        dropdown_items={[
                            { label: "Edit", onPress: handleEditPost },
                            { label: "Remove", onPress: handleDeletePost }
                        ]}
                        style={{ flex: 0.1, alignItems: "flex-end" }}
                    />
                ) : (
                    <Menu dropdown_items={[{ label: "Report", onPress: handleReportClick }]} style={{ flex: 0.1, alignItems: "flex-end" }} />
                )}
            </Row>
            <View style={{ marginVertical: heightPixel(15) }}>
                {(title || content) && <Text style={{ marginBottom: heightPixel(10) }}>{title || content}</Text>}
                {renderMedia()}
                {renderPoll()}
                {renderMeasurements()}
            </View>
            <Row justify="space-between">
                <TouchableOpacity onPress={() => setShowReactionsModal(true)}>
                    <Row align="center" gap={4}>
                        {/* Show user's reaction icon if they reacted, otherwise show heart */}
                        <Icon
                            source={userReaction === 'like' ? images.post_like : images.heart}
                            size={15}
                            tint_color={userReaction === 'like' ? colors.primary : userReaction === 'heart' ? colors.danger : colors.icon_gray}
                        />
                        <Text size={12}>{localReactionCount}</Text>
                    </Row>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowCommentsModal(true)}>
                    <Row align="center" gap={4}>
                        <Icon source={images.comment} size={15} />
                        <Text size={12}>{localCommentCount}</Text>
                    </Row>
                </TouchableOpacity>
            </Row>
            <Row justify="space-between" style={{ borderTopWidth: 1, borderColor: colors.dark_gray, paddingTop: heightPixel(10), marginTop: heightPixel(10) }}>
                <View ref={likeButtonRef}>
                    <TouchableOpacity
                        onPress={async () => {
                            if (userReaction) {
                                // Remove reaction if already reacted
                                const previousReaction = userReaction;
                                const previousCount = localReactionCount;
                                setUserReaction(null);
                                setLocalReactionCount(prev => Math.max(0, prev - 1));
                                try {
                                    await reactFeed({
                                        id,
                                        body: { reaction: previousReaction === 'heart' ? 'love' : 'like' }
                                    }).unwrap();
                                } catch (error) {
                                    setUserReaction(previousReaction);
                                    setLocalReactionCount(previousCount);
                                }
                            } else {
                                // Quick like
                                handleReaction('like');
                            }
                        }}
                        onLongPress={() => {
                            likeButtonRef.current?.measureInWindow((x, y, width, height) => {
                                // Calculate centered position above the Like button
                                // Picker width is approximately 110px (2 icons * 35px + padding)
                                const pickerWidth = 110;
                                const centeredX = x + (width / 2) - (pickerWidth / 2);
                                const topY = y - 60; // 60px above the button
                                setLikeButtonPosition({ x: centeredX, y: topY });
                            });
                            setShowReactionPicker(true);
                        }}
                        delayLongPress={100}
                    >
                        <Row align="center" gap={8}>
                            <Icon
                                source={userReaction === 'heart' ? images.heart : images.post_like}
                                size={18}
                                tint_color={
                                    userReaction === 'heart' ? colors.danger :
                                        userReaction === 'like' ? colors.primary :
                                            colors.icon_gray
                                }
                            />
                            <Text
                                size={12}
                                color={userReaction ? colors.primary : colors.icon_gray}
                                weight={userReaction ? "semibold" : "regular"}
                            >
                                {userReaction === 'heart' ? 'Love' : 'Like'}
                            </Text>
                        </Row>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setShowCommentsModal(true)}>
                    <Row align="center" gap={8} style={{ marginRight: 20 }}>
                        <Icon source={images.comment} size={18} />
                        <Text size={12} color={colors.icon_gray}>Comments</Text>
                    </Row>
                </TouchableOpacity>
            </Row>

            {/* Modals */}
            <PostReactionsModal
                visible={showReactionsModal}
                onClose={() => setShowReactionsModal(false)}
                post_id={id}
                reaction_count={reaction_count}
            />
            <PostCommentsModal
                visible={showCommentsModal}
                onClose={() => setShowCommentsModal(false)}
                post_id={id}
                comment_count={localCommentCount}
                onCommentAdded={() => setLocalCommentCount(prev => prev + 1)}
                onCommentDeleted={() => setLocalCommentCount(prev => Math.max(0, prev - 1))}
            />
            <ReactionPicker
                visible={showReactionPicker}
                onClose={() => setShowReactionPicker(false)}
                onSelectReaction={(reaction) => {
                    handleReaction(reaction);
                    setShowReactionPicker(false);
                }}
                position={likeButtonPosition}
            />

            {/* Report Modals */}
            <ReportConfirmModal
                visible={showReportConfirm}
                onClose={() => setShowReportConfirm(false)}
                onConfirm={handleReportConfirm}
            />
            <ReportReasonModal
                visible={showReportReason}
                onClose={() => setShowReportReason(false)}
                onSubmit={handleReportSubmit}
            />
            <ReportSuccessModal
                visible={showReportSuccess}
                onClose={handleReportSuccessClose}
                userName={`${user?.first_name || 'User'} ${user?.last_name || 'Abc'}`}
            />

            {/* Media Viewer Modal */}
            <MediaViewerModal
                visible={showMediaViewer}
                mediaUrl={selectedMedia.url}
                isVideo={selectedMedia.isVideo}
                onClose={() => setShowMediaViewer(false)}
            />
        </CardWrapper>
    )
}

export default memo(NewsFeedCard)