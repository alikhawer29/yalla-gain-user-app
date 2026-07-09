import dayjs from 'dayjs';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CardWrapper from '../../components/CardWrapper';
import ChatListingIcon from '../../components/ChatListingIcon';
import Empty from '../../components/Empty';
import Icon from '../../components/Icon';
import Row from '../../components/Row';
import Seperator from '../../components/Seperator';
import Text from '../../components/Text';
import Touchable from '../../components/Touchable';
import Wrapper from '../../components/Wrapper';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { ROUTES } from '../../utils/routes';
import { setPendingHistorySession } from '../../services/chatbot/chatbotHistoryStore';
import useChatbotHistoryController from './useChatbotHistoryController';
import styles from './styles';

const formatHistoryDate = (value: string) => {
  if (!value) return '';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('MMM D, YYYY · h:mm A') : '';
};

const ChatbotHistory = () => {
  const navigation = useNavigation<any>();
  const {
    values: { historyItems, isLoading, isFetching, hasError },
    functions: { refetch },
  } = useChatbotHistoryController();

  const onSelectSession = (session: (typeof historyItems)[number]['session']) => {
    setPendingHistorySession(session);
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate(ROUTES.CHATBOT);
  };

  return (
    <Wrapper scrollable={false}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={historyItems}
            keyExtractor={item => item.sessionId}
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Touchable onPress={() => onSelectSession(item.session)}>
                <CardWrapper
                  border_radius={8}
                  padding={12}
                  height={110}
                  color={colors.gray}
                >
                  <Row align="center" gap={12}>
                    <ChatListingIcon size={36} />
                    <View style={styles.content}>
                      <Text weight="semibold" lines={1}>
                        {item.title}
                      </Text>
                      <Text size={12} color={colors.icon_gray} lines={2}>
                        {item.preview}
                      </Text>
                      <Row align="center" gap={6} style={styles.metaRow}>
                        <Icon source={images.clock} size={11} />
                        <Text size={11} color={colors.icon_gray}>
                          {formatHistoryDate(item.startedAt)}
                        </Text>
                        <Text size={11} color={colors.icon_gray}>
                          · {item.messageCount} messages
                        </Text>
                      </Row>
                    </View>
                  </Row>
                </CardWrapper>
              </Touchable>
            )}
            ItemSeparatorComponent={() => <Seperator size={8} />}
            contentContainerStyle={
              historyItems.length === 0 ? styles.emptyList : styles.list
            }
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={refetch}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <Empty
                message={
                  hasError
                    ? 'Could not load chat history. Pull to refresh.'
                    : 'No chat history yet.'
                }
                image={images.empty}
              />
            }
          />
        )}
      </View>
    </Wrapper>
  );
};

export default ChatbotHistory;
