import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import images from '../../assets/images';
import Icon from '../../components/Icon';
import Row from '../../components/Row';
import Seperator from '../../components/Seperator';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import useKeyboard from '../../hooks/useKeyboard';
import colors from '../../utils/colors';
import { heightPixel } from '../../utils/helper';
import ChatMessageCard from '../../components/Cards/ChatMessageCard';
import { IChatMessage } from '../../interfaces';
import useChatDetailsController from './useChatDetailsController';
import styles from './styles';
import {
  formatChatDetailSeparatorLabel,
  localCalendarKey,
} from '../../utils/chatDateTime';

const formatRole = (role: string) => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const isMessageFromCurrentUser = (
  msg: IChatMessage,
  currentUserId?: number | null,
) => {
  if (currentUserId == null || msg.user_id == null) {
    return false;
  }
  return String(msg.user_id) === String(currentUserId);
};

const ChatDetails = () => {
  const {
    refs: { flatlistRef },
    values: {
      chatName,
      chatImage,
      userRole,
      currentUserId,
      messages,
      message,
      isLoading,
      isSending,
      selectedFiles,
    },
    functions: { onChangeMessage, onSendMessage, onPickFiles, onRemoveFile },
  } = useChatDetailsController();

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const keyboardHeight = useKeyboard();

  const renderHeader = () => (
    <View style={styles.header}>
      <Icon
        source={chatImage ? { uri: chatImage } : images.dummy}
        size={40}
        rounded
        no_padding
      />
      <Text size={16} weight="semibold" style={styles.header_name}>
        {chatName}
      </Text>
      {userRole ? (
        <View style={styles.role_badge}>
          <Text size={10} color={colors.white}>
            {formatRole(userRole)}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const renderMessage = ({ item, index }: { item: IChatMessage; index: number }) => {
    const prevMsg = index > 0 ? messages[index - 1] : undefined;
    const showDate =
      index === 0 ||
      (prevMsg &&
        localCalendarKey(prevMsg.date, prevMsg.time) !==
          localCalendarKey(item.date, item.time));

    return (
      <>
        {showDate ? (
          <View style={styles.date_separator}>
            <Text size={12} color={colors.icon_gray}>
              {formatChatDetailSeparatorLabel(item.date, item.time)}
            </Text>
          </View>
        ) : null}
        <ChatMessageCard
          message={item}
          isMine={isMessageFromCurrentUser(item, currentUserId)}
          currentUserId={currentUserId}
        />
      </>
    );
  };

  const renderAttachmentPreview = (file: (typeof selectedFiles)[number], index: number) => (
    <View key={`${file.uri}-${index}`} style={styles.input_attachment_chip}>
      <Image source={{ uri: file.uri }} style={styles.input_attachment_image} />
      <TouchableOpacity
        style={styles.input_attachment_remove}
        onPress={() => onRemoveFile(index)}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Icon source={images.cross} size={10} tint_color={colors.white} no_padding />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      <Wrapper hide_bottom_bar>
        <View
          style={[
            styles.container,
            Platform.OS === 'android' && keyboardHeight > 0
              ? { marginBottom: keyboardHeight }
              : null,
          ]}
        >
          {renderHeader()}
          {isLoading ? (
            <View style={styles.loading_container}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatlistRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => String(item.id)}
              ItemSeparatorComponent={() => <Seperator size={10} />}
              showsVerticalScrollIndicator={false}
              style={styles.messages_container}
              contentContainerStyle={styles.messages_content}
              onContentSizeChange={() => flatlistRef.current?.scrollToEnd()}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS === 'ios' ? 'interactive' : 'on-drag'
              }
            />
          )}

          <View
            style={[
              styles.input_container,
              {
                paddingTop: heightPixel(12),
                paddingBottom:
                  Platform.OS === 'ios'
                    ? insets.bottom
                    : heightPixel(30) + insets.bottom,
              },
            ]}
          >
          <View style={styles.input_wrapper}>
            {selectedFiles.length > 0 ? (
              <View style={styles.input_attachments_row}>
                {selectedFiles.map(renderAttachmentPreview)}
              </View>
            ) : null}
            <View style={styles.input_row}>
              <TextInput
                style={[
                  styles.input,
                  selectedFiles.length > 0 && styles.input_with_attachments,
                ]}
                placeholder="Type a message..."
                value={message}
                onChangeText={onChangeMessage}
                placeholderTextColor={colors.icon_gray}
                multiline
              />
              <Row gap={10}>
                <Icon
                  source={images.gallery}
                  size={20}
                  tint_color={colors.icon_gray}
                  onPress={onPickFiles}
                />
              </Row>
            </View>
          </View>
          <TouchableOpacity
            style={styles.send_button}
            onPress={onSendMessage}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Icon source={images.send} size={20} tint_color={colors.white} />
            )}
          </TouchableOpacity>
          </View>
        </View>
      </Wrapper>
    </KeyboardAvoidingView>
  );
};

export default ChatDetails;
