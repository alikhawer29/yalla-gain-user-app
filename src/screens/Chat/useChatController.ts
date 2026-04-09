import { RouteProp, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useCreateAdminChatMutation,
  useGetChatListQuery,
} from '../../redux/Apis/User';
import { IChat, RootStackParamList } from '../../interfaces';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import socketService from '../../services/socketService';

const CHAT_TYPES = [
  { label: 'User', value: 'user' },
  { label: 'Trainer', value: 'trainer' },
  { label: 'Doctor', value: 'doctor' },
  { label: 'Admin', value: 'admin' },
];

const CHAT_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Read', value: 'read' },
  { label: 'Unread', value: 'unread' },
];

const isAdminChat = (chat: IChat) =>
  String(chat.user_role ?? '').toLowerCase() === 'admin';

const useChatController = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const initialTabParam = route.params?.initialTab;
  const matchedInitial = CHAT_TYPES.find(t => t.value === initialTabParam);

  const [selectedTab, setSelectedTab] = useState<string | number>(
    matchedInitial ? matchedInitial.value : CHAT_TYPES[0].value,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isOpeningAdminChat, setIsOpeningAdminChat] = useState(false);

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetChatListQuery(undefined);

  const [createAdminChat] = useCreateAdminChatMutation();

  const chatList: IChat[] = data?.data || [];

  // Connect socket on mount
  useEffect(() => {
    socketService.connect();

    const handleChatListUpdate = () => {
      refetch();
    };

    socketService.subscribe('updateChatList', handleChatListUpdate);

    return () => {
      socketService.unsubscribe('updateChatList', handleChatListUpdate);
    };
  }, [refetch]);

  // Filter chats based on selected tab and search query
  const filteredChats = useMemo(() => {
    let filtered = chatList;

    if (selectedTab) {
      filtered = filtered.filter(
        chat => chat.user_role?.toLowerCase() === selectedTab,
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(chat => {
        const unreadCount = chat.unread ?? 0;
        if (selectedFilter === 'read') {
          return unreadCount === 0;
        }
        if (selectedFilter === 'unread') {
          return unreadCount > 0;
        }
        return true;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(chat =>
        chat.name?.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [chatList, selectedTab, selectedFilter, searchQuery]);

  const navigateToChatDetails = useCallback((chat: IChat) => {
    navigate(ROUTES.CHAT_DETAILS, {
      chatId: chat.id,
      name: chat.name,
      image: chat.image,
      userRole: chat.user_role,
      userId: chat.user_id,
    });
  }, []);

  const onChatPress = useCallback(
    (chat: IChat) => {
      navigateToChatDetails(chat);
    },
    [navigateToChatDetails],
  );

  /**
   * Reuses existing admin chat from getChatList if present; otherwise POST createAdmin.
   */
  const openOrCreateAdminChat = useCallback(async () => {
    setIsOpeningAdminChat(true);
    try {
      const refetchResult = await refetch();
      const responsePayload = refetchResult.data as
        | { data?: IChat[] }
        | undefined;
      const list = responsePayload?.data ?? chatList;
      const existingAdmin = list.find(isAdminChat);
      if (existingAdmin) {
        navigateToChatDetails(existingAdmin);
        return;
      }
      const created = await createAdminChat().unwrap();
      const chat = created?.data as IChat | undefined;
      if (chat?.id) {
        navigateToChatDetails(chat);
      }
    } finally {
      setIsOpeningAdminChat(false);
    }
  }, [refetch, chatList, createAdminChat, navigateToChatDetails]);

  const onSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const onFilterPress = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const onCloseFilterModal = useCallback(() => {
    setShowFilterModal(false);
  }, []);

  const onFilterChange = useCallback((filter: string) => {
    setSelectedFilter(filter);
  }, []);

  return {
    values: {
      chatTypes: CHAT_TYPES,
      selectedTab,
      searchQuery,
      filteredChats,
      isLoading,
      selectedFilter,
      showFilterModal,
      isOpeningAdminChat,
    },
    functions: {
      setSelectedTab,
      onSearchChange,
      onChatPress,
      onFilterPress,
      onCloseFilterModal,
      onFilterChange,
      refetch,
      openOrCreateAdminChat,
    },
  };
};

export default useChatController;
