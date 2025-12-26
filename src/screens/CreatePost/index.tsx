import React, { FC } from "react";
import { View, TextInput, ScrollView, TouchableOpacity } from "react-native";
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

// We need to access route params
type CreatePostScreenRouteProp = RouteProp<RootStackParamList, 'CreatePost'>;

const CreatePost = () => {
    const route = useRoute<CreatePostScreenRouteProp>();
    const navigation = useNavigation();
    const { initialTab } = route.params || {};

    const { values, functions } = useCreatePostController(initialTab);
    const { content, media, pollQuestion, pollOptions, activeTab, user_image } = values;
    const { setContent, setPollQuestion, handlePickMedia, removeMedia, addPollOption, removePollOption, updatePollOption, handlePost, goBack, setActiveTab } = functions;

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
                            placeholder="What's on your mind?"
                            placeholderTextColor={colors.placeholder}
                            multiline
                            value={content}
                            onChangeText={setContent}
                        />
                    </View>

                    {/* Media Display - Large single or Grid for multiple */}
                    {media.length === 1 ? (
                        // Single Large Media
                        <View style={styles.largeMediaItem}>
                            <View style={{ width: '100%', height: '100%' }}>
                                <Icon source={media[0].source} size="100%" resize="cover" />
                            </View>

                            {/* Remove Button with Cross Icon */}
                            <TouchableOpacity style={styles.removeButton} onPress={() => removeMedia(0)}>
                                <Icon source={images.modal_cross} size={14} />
                            </TouchableOpacity>

                            {/* Video Play Icon */}
                            {media[0].type === 'video' && (
                                <View style={styles.videoPlayButton}>
                                    <View style={styles.videoPlayIcon}>
                                        <Icon source={images.video_play} size={24} />
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : media.length > 1 ? (
                        // Media Grid for multiple items
                        <View style={styles.mediaGrid}>
                            {media.map((item, index) => (
                                <View key={index} style={styles.mediaItem}>
                                    <View style={{ width: '100%', height: '100%' }}>
                                        <Icon source={item.source} size="100%" resize="cover" />
                                    </View>

                                    {/* Remove Button with Cross Icon */}
                                    <TouchableOpacity style={styles.removeButton} onPress={() => removeMedia(index)}>
                                        <Icon source={images.modal_cross} size={14} />
                                    </TouchableOpacity>

                                    {/* Video Play Icon */}
                                    {item.type === 'video' && (
                                        <View style={styles.videoPlayButton}>
                                            <View style={styles.videoPlayIcon}>
                                                <Icon source={images.video_play} size={24} />
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : null}

                    {/* Poll Creator */}
                    {activeTab === 'poll' && (
                        <View style={styles.pollContainer}>
                            <TextInput
                                style={styles.pollInput}
                                placeholder="Ask a question..."
                                placeholderTextColor={colors.placeholder}
                                value={pollQuestion}
                                onChangeText={setPollQuestion}
                            />
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
                                            <Icon source={images.cross} size={20} color={colors.danger} />
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

                {/* Post Button */}
                <TouchableOpacity style={styles.postButton} onPress={handlePost}>
                    <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>

            </View>
        </Wrapper>
    );
}

export default CreatePost;
