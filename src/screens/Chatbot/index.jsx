import React from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import fonts from '../../assets/fonts';
import images from '../../assets/images';
import ChatItemCard from '../../components/Cards/ChatItemCard';
import PlusButtonIcon from '../../components/PlusButtonIcon';
import Icon from '../../components/Icon';
import Seperator from '../../components/Seperator';
import Wrapper from '../../components/Wrapper';
import useKeyboard from '../../hooks/useKeyboard';
import { useSubscriptionScreenGuard } from '../../hooks/useSubscriptionScreenGuard';
import colors from '../../utils/colors';
import { heightPixel } from '../../utils/helper';
import useChatbotController from './useChatbotController';

const Chatbot = () => {
  useSubscriptionScreenGuard('nutrition_chatbot');

  const {
    refs: { flatlist_ref },
    values: { data, input, isStartingNewChat, userPhoto },
    functions: { onChangeInput, onSendMessage, onStartNewChat },
  } = useChatbotController();

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const keyboardHeight = useKeyboard();
  const isNewAndroid = Platform.OS === 'android' && Platform.Version >= 35;
  const myAvatar = userPhoto ? { uri: userPhoto } : images.dummy;

  const renderItem = ({ item }) => (
    <ChatItemCard
      message={item?.text}
      sender={item.sender === 'me'}
      created_at={item?.timestamp}
      typing={item?.typing}
      image={item.sender === 'me' ? myAvatar : images.chatbot}
    />
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
            isNewAndroid ? { marginBottom: keyboardHeight } : null,
          ]}
        >
          <FlatList
            ref={flatlist_ref}
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={<Seperator />}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === 'ios' ? 'interactive' : 'on-drag'
            }
          />
          <View
            style={[
              styles.input_container,
              {
                paddingBottom:
                  Platform.OS === 'ios'
                    ? insets.bottom
                    : heightPixel(30) + insets.bottom,
              },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={input}
              onChangeText={onChangeInput}
              placeholderTextColor={colors.icon_gray}
              editable={!isStartingNewChat}
            />
            <View style={styles.send_column}>
              <PlusButtonIcon
                size={60}
                onPress={onStartNewChat}
                disabled={isStartingNewChat}
              />
              <Icon
                rounded
                color={colors.primary}
                onPress={onSendMessage}
                source={images.send}
                size={50}
              />
            </View>
          </View>
        </View>
      </Wrapper>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input_container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.transparent,
    gap: 10,
    paddingTop: heightPixel(30),
  },
  send_column: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: heightPixel(10),
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: heightPixel(10),
    paddingHorizontal: 15,
    backgroundColor: colors.blackish_gray,
    color: colors.white,
    height: heightPixel(50),
    fontFamily: fonts.sfpro.regular,
  },
});

export default Chatbot;
