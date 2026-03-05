import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetChatListQuery } from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import { IChat } from '../../interfaces';
import socketService from '../../services/socketService';

const CHAT_TYPES = [
  { label: 'User', value: 'user' },
  { label: 'Trainer', value: 'trainer' },
  { label: 'Doctor', value: 'doctor' },
];

const useChatController = () => {
  const [selectedTab, setSelectedTab] = useState<string | number>(
    CHAT_TYPES[0].value,
  );
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetChatListQuery(undefined);

  const chatList: IChat[] = data?.data || [];

  // Connect socket on mount
  useEffect(() => {
    socketService.connect();

    // Listen for chat list updates
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

    // Filter by user role (tab)
    if (selectedTab) {
      filtered = filtered.filter(
        chat => chat.user_role?.toLowerCase() === selectedTab,
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(chat =>
        chat.name?.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [chatList, selectedTab, searchQuery]);

  const onChatPress = useCallback((chat: IChat) => {
    navigate(ROUTES.CHAT_DETAILS, {
      chatId: chat.id,
      name: chat.name,
      image: chat.image,
      userRole: chat.user_role,
      userId: chat.user_id,
    });
  }, []);

  const onSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  return {
    values: {
      chatTypes: CHAT_TYPES,
      selectedTab,
      searchQuery,
      filteredChats,
      isLoading,
    },
    functions: {
      setSelectedTab,
      onSearchChange,
      onChatPress,
      refetch,
    },
  };
};

export default useChatController;
