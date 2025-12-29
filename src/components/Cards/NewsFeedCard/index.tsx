import { FC, memo, useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, ImageBackground } from "react-native";
import images from "../../../assets/images";
import { INewsFeedCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import { heightPixel, widthPixel, font } from "../../../utils/helper";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Image from "../../Image";
import Menu from "../../Menu";
import Row from "../../Row";
import Text from "../../Text";
import PostReactionsModal from "../../PostReactionsModal";
import PostCommentsModal from "../../PostCommentsModal";
import ReactionPicker from "../../ReactionPicker";
import ReportConfirmModal from "../../ReportConfirmModal";
import ReportReasonModal from "../../ReportReasonModal";
import ReportSuccessModal from "../../ReportSuccessModal";
import MediaViewerModal from "../../MediaViewerModal";
import { useReactFeedMutation, useReportFeedMutation } from "../../../redux/Apis/User";
import { useAppSelector } from "../../../hooks";
import { selectUser } from "../../../redux/Slices/AuthSlice";
import Video from 'react-native-video';


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
    reaction_type
}) => {
    const currentUser = useAppSelector(selectUser);
    const [reactFeed] = useReactFeedMutation();
    const [reportFeed] = useReportFeedMutation();

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

    const handleReportSuccessClose = () => {
        setShowReportSuccess(false);
    };

    const handleMediaPress = (mediaUrl: string, isVideo: boolean) => {
        console.log('Media pressed:', mediaUrl, 'isVideo:', isVideo);
        setSelectedMedia({ url: mediaUrl, isVideo });
        setShowMediaViewer(true);
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
                    <Image source={{ uri: sourceUri }} resize="cover" style={{ width: '100%', height: '100%' }} />
                    {isVideo && (
                        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                            <Video
                                source={{ uri: sourceUri }}
                                style={{ width: '100%', height: '100%' }}
                                controls
                                paused={true}
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
                            <Image source={{ uri: sourceUri }} resize="cover" style={{ width: '100%', height: '100%' }} />
                            {isVideo && (
                                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                    <Video
                                        source={{ uri: sourceUri }}
                                        style={{ width: '100%', height: '100%' }}
                                        controls
                                        paused={true}
                                    />                                </View>
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>
        );
    };

    const renderPoll = () => {
        // Check if it's a poll from API
        if (!is_poll && !poll) return null;

        const pollData = poll || { question: title, options: poll_options || [] }

        if (!pollData.options || pollData.options.length === 0) return null;

        return (
            <View style={{ marginTop: heightPixel(10), gap: heightPixel(10) }}>
                <Text weight="semibold">{pollData.question || title}</Text>
                {pollData.options.map((option: any) => (
                    <View key={option.id} style={{ marginBottom: heightPixel(5) }}>
                        <View style={{
                            backgroundColor: colors.gray,
                            borderRadius: heightPixel(5),
                            overflow: 'hidden',
                            height: heightPixel(35),
                            justifyContent: 'center'
                        }}>
                            <View style={{
                                width: `${option.percentage || 0}%`,
                                backgroundColor: option.is_selected ? colors.primary : colors.dark_gray,
                                height: '100%',
                                position: 'absolute'
                            }} />
                            <Row justify="space-between" style={{ paddingHorizontal: widthPixel(10) }}>
                                <Text size={12} weight="regular">{option.label || option.option}</Text>
                                <Text size={12} weight="regular">{option.percentage || 0}%</Text>
                            </Row>
                        </View>
                        {option.is_selected && (
                            <View style={{ position: 'absolute', left: 10, top: 10, display: 'none' }}>
                                <Icon source={images.check} size={15} color={colors.white} />
                            </View>
                        )}
                        {/* display none for check as design uses color to indicate selection */}
                    </View>
                ))}
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
                <Row style={{ flex: 0.9 }} align="center" gap={12}>
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
                {!isOwnPost && (
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
                comment_count={comment_count}
                onCommentAdded={() => setLocalCommentCount(prev => prev + 1)}
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