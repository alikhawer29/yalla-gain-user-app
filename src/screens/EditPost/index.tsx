import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import styles from './styles';
import useEditPostController from './useEditPostController';
import Text from '../../components/Text';
import Icon from '../../components/Icon';
import Badge from '../../components/Badge';
import images from '../../assets/images';
import colors from '../../utils/colors';
import Wrapper from '../../components/Wrapper';
import { RootStackParamList } from '../../interfaces';
import PostMediaImage from '../../components/PostMediaImage';
import MediaViewerModal from '../../components/MediaViewerModal';
import { heightPixel } from '../../utils/helper';

type EditPostScreenRouteProp = RouteProp<RootStackParamList, 'EditPost'>;

const isVideoFile = (url: string) => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

const EditPost = () => {
  const route = useRoute<EditPostScreenRouteProp>();
  const navigation = useNavigation();
  const { postData } = route.params;

  const { values, functions } = useEditPostController(postData);
  const {
    content,
    media,
    existingMedia,
    pollOptions,
    activeTab,
    user_image,
    isLoading,
  } = values;
  const {
    setContent,
    handlePickMedia,
    removeMedia,
    removeExistingMedia,
    addPollOption,
    removePollOption,
    updatePollOption,
    handleUpdate,
    setActiveTab,
  } = functions;

  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    isVideo: boolean;
  } | null>(null);

  const openMediaPreview = (url: string, isVideo: boolean) => {
    if (!url) return;
    setPreviewMedia({ url, isVideo });
  };

  const getTileStyle = (count: number, index: number) => {
    if (count === 1) return styles.largeMediaItem;
    return [
      styles.mediaTileSmall,
      {
        width: count === 2 ? '48%' : '31%',
        height: heightPixel(150),
      },
    ];
  };

  const renderExistingMediaTile = (item: any, index: number) => {
    const isVideo = isVideoFile(item.path);
    return (
      <View
        key={item.id ?? `existing-${index}`}
        style={getTileStyle(existingMedia.length, index)}
      >
        <TouchableOpacity
          style={styles.mediaPreviewTouchable}
          onPress={() => openMediaPreview(item.path, isVideo)}
          activeOpacity={0.9}
        >
          <PostMediaImage uri={item.path} />
          {isVideo && (
            <View style={styles.videoPlayButton} pointerEvents="none">
              <View style={styles.videoPlayIcon}>
                <Icon source={images.video_play} size={24} />
              </View>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeExistingMedia(item.id)}
        >
          <Icon source={images.modal_cross} size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderNewMediaTile = (item: any, index: number) => {
    const uri = item.original?.uri ?? item.source?.uri;
    const isVideo = item.type === 'video';
    return (
      <View key={`new-${uri ?? index}`} style={getTileStyle(media.length, index)}>
        <TouchableOpacity
          style={styles.mediaPreviewTouchable}
          onPress={() => openMediaPreview(uri, isVideo)}
          activeOpacity={0.9}
        >
          <PostMediaImage uri={uri} />
          {isVideo && (
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
          <Icon source={images.modal_cross} size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  useFocusEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: 'none' },
      });
    }
  });

  return (
    <Wrapper scrollable>
      <View style={styles.contentContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.userInputRow}>
            <Icon
              source={user_image ? { uri: user_image } : images.dummy}
              size={50}
              rounded
              no_padding
              border={colors.white}
              resize="cover"
            />
            <TextInput
              style={styles.input}
              placeholder={
                activeTab === 'poll' ? 'Ask a question...' : "What's on your mind?"
              }
              placeholderTextColor={colors.placeholder}
              value={content}
              onChangeText={setContent}
              multiline
            />
          </View>

          {existingMedia.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: heightPixel(10),
              }}
            >
              {existingMedia.map(renderExistingMediaTile)}
            </View>
          )}

          {media.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: heightPixel(10),
              }}
            >
              {media.map(renderNewMediaTile)}
            </View>
          )}

          {activeTab === 'poll' && (
            <View style={styles.pollContainer}>
              {pollOptions.map((option: any, index: number) => (
                <View key={option.id} style={styles.optionRow}>
                  <TextInput
                    style={[styles.pollInput, { flex: 1, marginBottom: 0 }]}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor={colors.placeholder}
                    value={option.text || option.option_text || ''}
                    onChangeText={text => updatePollOption(option.id, text)}
                  />
                  {pollOptions.length > 2 && (
                    <TouchableOpacity
                      onPress={() => removePollOption(option.id)}
                    >
                      <Icon source={images.modal_cross} size={20} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity onPress={addPollOption} style={{ marginTop: 10 }}>
                <Text color={colors.primary} weight="semibold">
                  + Add Option
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

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

      <MediaViewerModal
        visible={!!previewMedia}
        mediaUrl={previewMedia?.url ?? ''}
        isVideo={previewMedia?.isVideo ?? false}
        onClose={() => setPreviewMedia(null)}
      />
    </Wrapper>
  );
};

export default EditPost;
