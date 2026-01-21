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
import useChatDetailsController from './useChatDetailsController';
import styles from './styles';

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
  const keyboardHeight = useKeyboard();
  const isNewAndroid = Platform.OS === 'android' && Platform.Version >= 35;

  const formatRole = (role: string) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

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
      {userRole && (
        <View style={styles.role_badge}>
          <Text size={10} color={colors.white}>
            {formatRole(userRole)}
          </Text>
        </View>
      )}
    </View>
  );

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const showDate = index === 0 || messages[index - 1]?.date !== item.date;

    return (
      <>
        {showDate && (
          <View style={styles.date_separator}>
            <Text size={12} color={colors.icon_gray}>
              {formatDate(item.date)}
            </Text>
          </View>
        )}
        <ChatMessageCard
          message={item}
          isMine={item.is_mine}
          currentUserId={currentUserId}
        />
      </>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderSelectedFiles = () => {
    if (selectedFiles.length === 0) return null;

    return (
      <View style={styles.selected_files_container}>
        {selectedFiles.map((file, index) => (
          <View key={index} style={styles.selected_file}>
            <Image
              source={{ uri: file.uri }}
              style={styles.selected_file_image}
            />
            <TouchableOpacity
              style={styles.remove_file_btn}
              onPress={() => onRemoveFile(index)}
            >
              <Text size={10} color={colors.white}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <Wrapper hide_bottom_bar>
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
          />
        )}

        {renderSelectedFiles()}

        <View
          style={[
            styles.input_container,
            {
              paddingVertical: heightPixel(10),
              paddingBottom:
                Platform.OS === 'ios'
                  ? heightPixel(30) + insets.bottom
                  : heightPixel(30) + insets.bottom,
            },
          ]}
        >


          <View style={styles.input_wrapper}>
            <TextInput
              style={styles.input}
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
      </Wrapper>
    </KeyboardAvoidingView>
  );
};

export default ChatDetails;
