import { RouteProp, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useCreateAdminChatMutation,
  useCreateChatMutation,
  useGetChatListQuery,
  useSearchPostUsersQuery,
} from '../../redux/Apis/User';
import { IChat, RootStackParamList } from '../../interfaces';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import socketService from '../../services/socketService';
import useDebounce from '../../hooks/useDebounce';
import { useRefreshOnScreenFocus } from '../../hooks/useRefreshOnScreenFocus';

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

export interface ChatSearchUser {
  id: number;
  first_name: string;
  last_name: string;
  type: string;
  photo?: string;
}

const isAdminChat = (chat: IChat) =>
  String(chat.user_role ?? '').toLowerCase() === 'admin';

const SEARCHABLE_TABS = new Set(['user', 'trainer', 'doctor']);

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
  const [isOpeningUserChat, setIsOpeningUserChat] = useState(false);

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetChatListQuery(undefined);

  useRefreshOnScreenFocus(refetch);

  const [createAdminChat] = useCreateAdminChatMutation();
  const [createChat] = useCreateChatMutation();

  const chatList: IChat[] = data?.data || [];

  const trimmedSearch = searchQuery.trim();
  const debouncedSearch = useDebounce(trimmedSearch, 400);
  const searchTab = String(selectedTab);
  const canSearchUsers = SEARCHABLE_TABS.has(searchTab);
  const showSearchResults = canSearchUsers && trimmedSearch.length > 0;
  const isSearchPending = trimmedSearch !== debouncedSearch;

  const { data: searchData, isFetching: isSearching } = useSearchPostUsersQuery(
    { q: debouncedSearch, type: searchTab },
    { skip: !canSearchUsers || debouncedSearch.length === 0 },
  );

  const searchResults: ChatSearchUser[] = searchData?.data ?? [];

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
      title: chat.name,
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

  const onSearchUserPress = useCallback(
    async (user: ChatSearchUser) => {
      if (isOpeningUserChat) return;
      setIsOpeningUserChat(true);
      try {
        const existing = chatList.find(
          chat =>
            String(chat.user_id) === String(user.id) ||
            (chat.name?.toLowerCase() ===
              `${user.first_name} ${user.last_name}`.toLowerCase() &&
              chat.user_role?.toLowerCase() ===
                String(user.type || searchTab).toLowerCase()),
        );
        if (existing) {
          setSearchQuery('');
          navigateToChatDetails(existing);
          return;
        }

        const response = await createChat(user.id).unwrap();
        const chat = (response?.data ?? response) as IChat | undefined;
        const chatId = chat?.id ?? response?.id;
        if (!chatId) return;

        setSearchQuery('');
        navigate(ROUTES.CHAT_DETAILS, {
          chatId,
          name: `${user.first_name} ${user.last_name}`.trim(),
          title: `${user.first_name} ${user.last_name}`.trim(),
          image: user.photo || '',
          userRole: user.type || searchTab,
          userId: user.id,
        });
      } finally {
        setIsOpeningUserChat(false);
      }
    },
    [
      isOpeningUserChat,
      chatList,
      createChat,
      navigateToChatDetails,
      searchTab,
    ],
  );

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

  const handleSetSelectedTab = useCallback((tab: string | number) => {
    setSelectedTab(tab);
    setSearchQuery('');
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
      isOpeningUserChat,
      searchResults,
      showSearchResults,
      isSearching: isSearching || isSearchPending,
      searchTab,
    },
    functions: {
      setSelectedTab: handleSetSelectedTab,
      onSearchChange,
      onChatPress,
      onFilterPress,
      onCloseFilterModal,
      onFilterChange,
      refetch,
      openOrCreateAdminChat,
      onSearchUserPress,
    },
  };
};

export default useChatController;
