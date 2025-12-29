import React from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import styles from "./styles";
import useEditPostController from "./useEditPostController";
import Text from "../../components/Text";
import Icon from "../../components/Icon";
import Badge from "../../components/Badge";
import images from "../../assets/images";
import colors from "../../utils/colors";
import Wrapper from "../../components/Wrapper";
import { RootStackParamList } from "../../interfaces";
import Image from "../../components/Image";
import { heightPixel, widthPixel } from "../../utils/helper";
import Video from "react-native-video";

type EditPostScreenRouteProp = RouteProp<RootStackParamList, 'EditPost'>;

const EditPost = () => {
    const route = useRoute<EditPostScreenRouteProp>();
    const navigation = useNavigation();
    const { postData } = route.params;

    const { values, functions } = useEditPostController(postData);
    const { content, media, existingMedia, pollOptions, activeTab, user_image, isLoading } = values;
    const { setContent, handlePickMedia, removeMedia, removeExistingMedia, addPollOption, removePollOption, updatePollOption, handleUpdate, goBack, setActiveTab } = functions;

    useFocusEffect(() => {
        const parent = navigation.getParent()
        if (parent) {
            parent.setOptions({
                tabBarStyle: { display: 'none' }
            })
        }
    })

    const isVideoFile = (url: string) => {
        if (!url) return false;
        const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
        const lowerUrl = url.toLowerCase();
        return videoExtensions.some(ext => lowerUrl.includes(ext));
    };

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
                            value={content}
                            onChangeText={setContent}
                            multiline
                        />
                    </View>

                    {/* Existing Media Display */}
                    {existingMedia.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: heightPixel(10) }}>
                            {existingMedia.map((item, index) => {
                                const isVideo = isVideoFile(item.path);
                                return (
                                    <View key={item.id || index} style={existingMedia.length === 1 ? styles.largeMediaItem : {
                                        width: existingMedia.length === 2 ? '48%' : '31%',
                                        height: heightPixel(150),
                                        borderRadius: heightPixel(8),
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <Image source={{ uri: item.path }} resize="cover" style={{ width: '100%', height: '100%' }} />
                                        {isVideo && (
                                            <View style={styles.videoPlayButton}>
                                                {/* <Icon source={images.play} size={30} color={colors.white} /> */}
                                                <Video source={{ uri: item.path }} controls style={{ width: '100%', height: '100%' }} />
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => removeExistingMedia(item.id)}
                                        >
                                            <Icon source={images.modal_cross} size={20} />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* New Media Display */}
                    {media.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: heightPixel(10) }}>
                            {media.map((item, index) => (
                                <View key={index} style={media.length === 1 ? styles.largeMediaItem : {
                                    width: media.length === 2 ? '48%' : '31%',
                                    height: heightPixel(150),
                                    borderRadius: heightPixel(8),
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <Image source={item.source} resize="cover" style={{ width: '100%', height: '100%' }} />
                                    {item.type === 'video' && (
                                        <View style={styles.videoPlayButton}>
                                            <Icon source={images.play} size={30} color={colors.white} />
                                        </View>
                                    )}
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removeMedia(index)}
                                    >
                                        <Icon source={images.modal_cross} size={20} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Poll Creator */}
                    {activeTab === 'poll' && (
                        <View style={styles.pollContainer}>
                            {pollOptions.map((option: any, index: number) => (
                                <View key={option.id} style={styles.optionRow}>
                                    <TextInput
                                        style={[styles.pollInput, { flex: 1, marginBottom: 0 }]}
                                        placeholder={`Option ${index + 1}`}
                                        placeholderTextColor={colors.placeholder}
                                        value={option.text || option.option_text || ''}
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

                {/* Update Button */}
                <TouchableOpacity
                    style={[styles.postButton, isLoading && { opacity: 0.6 }]}
                    onPress={handleUpdate}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.postButtonText}>Update</Text>
                    )}
                </TouchableOpacity>
            </View>
        </Wrapper>
    );
};

export default EditPost;

