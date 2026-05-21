import { FC, memo, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import images from '../../../assets/images';
import { IChatMessage } from '../../../interfaces';
import colors from '../../../utils/colors';
import {
  downloadChatFile,
  getChatFileKind,
  getChatFileUri,
  getDocumentExtension,
  getDocumentIcon,
  getFileNameFromUri,
  isChatImageUri,
} from '../../../utils/chatMedia';
import MediaViewerModal from '../../MediaViewerModal';
import Icon from '../../Icon';
import Row from '../../Row';
import Text from '../../Text';
import styles from './styles';
import { formatChatTime12h } from '../../../utils/chatDateTime';

interface IChatMessageCardProps {
  message: IChatMessage;
  isMine: boolean;
  currentUserId?: number;
}

const ChatMessageCard: FC<IChatMessageCardProps> = ({ message, isMine }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [downloadingUri, setDownloadingUri] = useState<string | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const Tail = ({ right = true, fill = colors.blackish_gray }) => {
    const dLeft = 'M0 0 L0 18 L18 18 Z';
    const dRight = 'M14 0 L18 18 L0 18 Z';

    return (
      <Svg
        width={18}
        height={18}
        viewBox="0 0 18 18"
        style={right ? styles.tailRight : styles.tailLeft}
      >
        <Path d={right ? dRight : dLeft} fill={fill} />
      </Svg>
    );
  };

  const handleDocumentPress = async (uri: string) => {
    if (downloadingUri) return;
    setDownloadingUri(uri);
    try {
      await downloadChatFile(uri, getFileNameFromUri(uri));
    } finally {
      setDownloadingUri(null);
    }
  };

  const renderFiles = () => {
    if (!message.file || message.file.length === 0) return null;

    return (
      <View style={styles.files_container}>
        {message.file.map((file: unknown, index: number) => {
          const uri = getChatFileUri(file as string | { path?: string });
          if (!uri) return null;

          const kind = getChatFileKind(uri);
          const fileName = getFileNameFromUri(uri);

          if (kind === 'image' || isChatImageUri(uri)) {
            return (
              <TouchableOpacity
                key={`${uri}-${index}`}
                onPress={() => setPreviewImage(uri)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri }}
                  style={styles.file_image}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          }

          if (kind === 'video') {
            return (
              <TouchableOpacity
                key={`${uri}-${index}`}
                onPress={() => setPreviewImage(uri)}
                activeOpacity={0.85}
                style={styles.file_video_wrap}
              >
                <Image
                  source={{ uri }}
                  style={styles.file_image}
                  resizeMode="cover"
                />
                <View style={styles.file_video_overlay} pointerEvents="none">
                  <Icon source={images.video_play} size={28} />
                </View>
              </TouchableOpacity>
            );
          }

          // Documents from admin (pdf, doc, etc.) and other non-image attachments
          const isDownloading = downloadingUri === uri;

          return (
            <TouchableOpacity
              key={`${uri}-${index}`}
              style={styles.file_document}
              onPress={() => handleDocumentPress(uri)}
              activeOpacity={0.8}
              disabled={isDownloading}
            >
              <View style={styles.file_document_icon_wrap}>
                {isDownloading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Icon source={getDocumentIcon(uri)} size={26} />
                )}
              </View>
              <View style={styles.file_document_text}>
                <Text size={13} weight="semibold" lines={1}>
                  {fileName}
                </Text>
                <Text size={11} color={colors.icon_gray}>
                  {getDocumentExtension(uri)}
                  {isDownloading ? ' · Downloading…' : ' · Tap to download'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          isMine ? styles.sender_container : styles.receiver_container,
          { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
        ]}
      >
        {!isMine && (
          <View style={styles.avatar_container}>
            <Icon
              source={
                message.image && message.image.trim() !== ''
                  ? { uri: message.image }
                  : images.dummy
              }
              rounded
              no_padding
              size={39}
            />
          </View>
        )}
        <View
          style={[
            styles.message_bubble,
            isMine ? styles.sender_bubble : styles.receiver_bubble,
          ]}
        >
          <Tail right={isMine} />
          {renderFiles()}
          {message.message ? <Text size={12}>{message.message}</Text> : null}
          <Row align="center" justify="flex-end" gap={5}>
            <Icon source={images.clock} tint_color={colors.icon_gray} size={10} />
            <Text size={10} color={colors.icon_gray}>
              {formatChatTime12h(message.date, message.time)}
            </Text>
          </Row>
        </View>
        {isMine && (
          <View style={styles.avatar_container}>
            <Icon
              source={
                message.image && message.image.trim() !== ''
                  ? { uri: message.image }
                  : images.dummy
              }
              rounded
              no_padding
              size={39}
            />
          </View>
        )}
      </Animated.View>

      <MediaViewerModal
        visible={!!previewImage}
        mediaUrl={previewImage ?? ''}
        isVideo={previewImage ? getChatFileKind(previewImage) === 'video' : false}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
};

export default memo(ChatMessageCard);
