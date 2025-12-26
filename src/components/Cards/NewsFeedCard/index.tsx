import { FC, memo, useState, useRef } from "react";
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

const NewsFeedCard: FC<INewsFeedCard> = ({ id, content, media, poll, measurements, reaction_count = 0, comment_count = 0, user, created_at, is_liked }) => {
    const [showReactionsModal, setShowReactionsModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [userReaction, setUserReaction] = useState<'like' | 'heart' | null>(is_liked ? 'like' : null);
    const [likeButtonPosition, setLikeButtonPosition] = useState({ x: 0, y: 0 });
    const likeButtonRef = useRef<View>(null);

    // Report modals state
    const [showReportConfirm, setShowReportConfirm] = useState(false);
    const [showReportReason, setShowReportReason] = useState(false);
    const [showReportSuccess, setShowReportSuccess] = useState(false);

    const handleReportClick = () => {
        setShowReportConfirm(true);
    };

    const handleReportConfirm = () => {
        setShowReportConfirm(false);
        setShowReportReason(true);
    };

    const handleReportSubmit = (reason: string) => {
        console.log("Report reason:", reason);
        setShowReportReason(false);
        setShowReportSuccess(true);
    };

    const handleReportSuccessClose = () => {
        setShowReportSuccess(false);
    };

    const renderMedia = () => {
        if (!media || media.length === 0) return null;

        if (media.length === 1) {
            const item = media[0];
            return (
                <View style={{ height: heightPixel(250), borderRadius: heightPixel(10), overflow: "hidden", marginTop: heightPixel(10) }}>
                    <Image source={item.source} resize="cover" style={{ width: '100%', height: '100%' }} />
                    {item.type === 'video' && (
                        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                            <Icon source={images.play} size={40} color={colors.white} />
                        </View>
                    )}
                </View>
            );
        }

        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: heightPixel(10) }}>
                {media.map((item, index) => (
                    <View key={index} style={{
                        width: media.length === 2 ? '48%' : '31%',
                        height: heightPixel(150),
                        borderRadius: heightPixel(8),
                        overflow: 'hidden'
                    }}>
                        <Image source={item.source} resize="cover" style={{ width: '100%', height: '100%' }} />
                        {item.type === 'video' && (
                            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                <Icon source={images.play} size={30} color={colors.white} />
                            </View>
                        )}
                    </View>
                ))}
            </View>
        );
    };

    const renderPoll = () => {
        if (!poll) return null;
        return (
            <View style={{ marginTop: heightPixel(10), gap: heightPixel(10) }}>
                <Text weight="semibold">{poll.question}</Text>
                {poll.options.map((option: any) => (
                    <View key={option.id} style={{ marginBottom: heightPixel(5) }}>
                        <View style={{
                            backgroundColor: colors.gray,
                            borderRadius: heightPixel(5),
                            overflow: 'hidden',
                            height: heightPixel(35),
                            justifyContent: 'center'
                        }}>
                            <View style={{
                                width: `${option.percentage}%`,
                                backgroundColor: option.is_selected ? colors.primary : colors.dark_gray,
                                height: '100%',
                                position: 'absolute'
                            }} />
                            <Row justify="space-between" style={{ paddingHorizontal: widthPixel(10) }}>
                                <Text size={12} weight="regular">{option.label}</Text>
                                <Text size={12} weight="regular">{option.percentage}%</Text>
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
                        source={user?.image || images.dummy}
                        size={45}
                        rounded
                        no_padding
                        border={colors.white}
                        resize="cover"
                    />
                    <View>
                        <Text weight="semibold">{user?.first_name} {user?.last_name}</Text>
                        <Text size={12} color={colors.icon_gray}>{created_at || "2 days ago"}</Text>
                    </View>
                </Row>
                <Menu dropdown_items={[{ label: "Report", onPress: handleReportClick }]} style={{ flex: 0.1, alignItems: "flex-end" }} />
            </Row>
            <View style={{ marginVertical: heightPixel(15) }}>
                {content && <Text style={{ marginBottom: heightPixel(10) }}>{content}</Text>}
                {renderMedia()}
                {renderPoll()}
                {renderMeasurements()}
            </View>
            <Row justify="space-between">
                <TouchableOpacity onPress={() => setShowReactionsModal(true)}>
                    <Row align="center" gap={4}>
                        <Icon source={images.heart} size={15} />
                        <Text size={12}>{reaction_count}</Text>
                    </Row>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowCommentsModal(true)}>
                    <Row align="center" gap={4}>
                        <Icon source={images.comment} size={15} />
                        <Text size={12}>{comment_count}</Text>
                    </Row>
                </TouchableOpacity>
            </Row>
            <Row justify="space-between" style={{ borderTopWidth: 1, borderColor: colors.dark_gray, paddingTop: heightPixel(10), marginTop: heightPixel(10) }}>
                <View ref={likeButtonRef}>
                    <TouchableOpacity
                        onPress={() => {
                            if (userReaction) {
                                // Remove reaction if already reacted
                                setUserReaction(null);
                            } else {
                                // Quick like
                                setUserReaction('like');
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
            />
            <ReactionPicker
                visible={showReactionPicker}
                onClose={() => setShowReactionPicker(false)}
                onSelectReaction={(reaction) => setUserReaction(reaction)}
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
        </CardWrapper>
    )
}

export default memo(NewsFeedCard)