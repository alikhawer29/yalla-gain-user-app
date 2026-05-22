import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import PostMediaImage from "../../components/PostMediaImage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import styles from "./styles";
import useCreatePostController from "./useCreatePostController";
import Text from "../../components/Text";
import Icon from "../../components/Icon";
import images from "../../assets/images";
import colors from "../../utils/colors";
import Badge from "../../components/Badge";
import Wrapper from "../../components/Wrapper";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../interfaces";
import Image from "../../components/Image";
import MediaViewerModal from "../../components/MediaViewerModal";
import { useSubscriptionScreenGuard } from "../../hooks/useSubscriptionScreenGuard";

// We need to access route params
type CreatePostScreenRouteProp = RouteProp<RootStackParamList, 'CreatePost'>;

const CreatePost = () => {
    useSubscriptionScreenGuard('messaging');
    const route = useRoute<CreatePostScreenRouteProp>();
    const navigation = useNavigation();
    const { initialTab } = route.params || {};

    const { values, functions } = useCreatePostController(initialTab);
    const { content, media, pollOptions, activeTab, user_image, isLoading, canPost, postingPhase, postProgress } = values;
    const { setContent, handlePickMedia, removeMedia, addPollOption, removePollOption, updatePollOption, handlePost, goBack, setActiveTab } = functions;

    const isPosting = !!postingPhase;
    const postProgressLabel =
        postingPhase === 'finishing' ? 'Finishing up…' : 'Uploading post…';

    const [previewMedia, setPreviewMedia] = useState<{
        url: string;
        isVideo: boolean;
    } | null>(null);

    const openMediaPreview = (item: (typeof media)[number]) => {
        const uri = item.original?.uri ?? item.source?.uri;
        if (!uri) return;
        setPreviewMedia({ url: uri, isVideo: item.type === 'video' });
    };

    const renderMediaTile = (
        item: (typeof media)[number],
        index: number,
        variant: 'large' | 'grid',
    ) => (
        <View
            key={`${item.original?.uri ?? index}-${index}`}
            style={variant === 'large' ? styles.largeMediaItem : styles.mediaItem}
        >
            <TouchableOpacity
                style={styles.mediaPreviewTouchable}
                onPress={() => openMediaPreview(item)}
                activeOpacity={0.9}
            >
                <PostMediaImage
                    uri={item.original?.uri ?? item.source?.uri}
                />
                {item.type === 'video' && (
                    <View style={styles.videoPlayButton} pointerEvents="none">
                        <View style={styles.videoPlayIcon}>
                            <Icon source={images.video_play} size={24} />
                        </View>
                    </View>
                )}
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeMedia(index)}
            >
                <Icon source={images.modal_cross} size={14} />
            </TouchableOpacity>
        </View>
    );

    useFocusEffect(() => {
        // Hide bottom tab bar when screen is focused
        const parent = navigation.getParent()
        if (parent) {
            parent.setOptions({
                tabBarStyle: { display: 'none' }
            })
        }
    })

    return (
        <Wrapper scrollable>
            <View style={styles.contentContainer}>


                {/* Main Content Area */}
                <View style={styles.inputContainer}>
                    {/* User Info and Input Field - Side by Side */}
                    <View style={styles.userInputRow}>
                        <Icon source={user_image ? { uri: user_image } : images.dummy} size={50} rounded no_padding border={colors.white} resize="cover" />
                        <TextInput
                            style={styles.input}
                            placeholder={activeTab === 'poll' ? "Ask a question..." : "What's on your mind?"}
                            placeholderTextColor={colors.placeholder}
                            multiline
                            value={content}
                            onChangeText={setContent}
                        />
                    </View>

                    {/* Media Display - Large single or Grid for multiple */}
                    {media.length === 1
                        ? renderMediaTile(media[0], 0, 'large')
                        : media.length > 1 ? (
                            <View style={styles.mediaGrid}>
                                {media.map((item, index) =>
                                    renderMediaTile(item, index, 'grid'),
                                )}
                            </View>
                        ) : null}

                    {/* Poll Creator */}
                    {activeTab === 'poll' && (
                        <View style={styles.pollContainer}>
                            {pollOptions.map((option, index) => (
                                <View key={option.id} style={styles.optionRow}>
                                    <TextInput
                                        style={[styles.pollInput, { flex: 1, marginBottom: 0 }]}
                                        placeholder={`Option ${index + 1}`}
                                        placeholderTextColor={colors.placeholder}
                                        value={option.text}
                                        onChangeText={(text) => updatePollOption(option.id, text)}
                                    />
                                    {pollOptions.length > 2 && (
                                        <TouchableOpacity onPress={() => removePollOption(option.id)}>
                                            <Icon source={images.modal_cross} size={20} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                            <TouchableOpacity onPress={addPollOption} style={{ marginTop: 10 }}>
                                <Text color={colors.primary} weight="semibold">+ Add Option</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </View>

                {/* Actions Row */}
                <View style={styles.actionsContainer}>
                    <Badge
                        title="Video"
                        icon={images.video}
                        style={{ opacity: activeTab === 'video' ? 1 : 0.7 }}
                        onPress={() => {
                            setActiveTab('video');
                            handlePickMedia('video');
                        }}
                    />
                    <Badge
                        title="Photo"
                        icon={images.gallery}
                        style={{ opacity: activeTab === 'photo' ? 1 : 0.7 }}
                        onPress={() => {
                            setActiveTab('photo');
                            handlePickMedia('photo');
                        }}
                    />
                    <Badge
                        title="Polling"
                        icon={images.polling}
                        style={{ opacity: activeTab === 'poll' ? 1 : 0.7 }}
                        onPress={() => setActiveTab('poll')}
                    />
                </View>

                {isPosting ? (
                    <View style={styles.postProgressContainer}>
                        <Text style={styles.postProgressLabel}>{postProgressLabel}</Text>
                        <View style={styles.postProgressTrack}>
                            <View
                                style={[
                                    styles.postProgressFill,
                                    { width: `${postProgress}%` },
                                ]}
                            />
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.postButton,
                            !canPost && styles.postButtonDisabled,
                        ]}
                        onPress={handlePost}
                        disabled={!canPost || isLoading}
                    >
                        <Text style={styles.postButtonText}>Post</Text>
                    </TouchableOpacity>
                )}

            </View>

            <MediaViewerModal
                visible={!!previewMedia}
                mediaUrl={previewMedia?.url ?? ''}
                isVideo={previewMedia?.isVideo ?? false}
                onClose={() => setPreviewMedia(null)}
            />
        </Wrapper>
    );
}

export default CreatePost;
