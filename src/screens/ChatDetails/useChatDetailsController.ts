import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { useGetChatQuery, useSendMessageMutation } from '../../redux/Apis/User';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { IChatMessage } from '../../interfaces';
import socketService from '../../services/socketService';

interface RouteParams {
  chatId: number;
  name: string;
  image: string;
  userRole: string;
  userId: number;
}

const useChatDetailsController = () => {
  const route = useRoute();
  const params = route.params as RouteParams;
  const flatlistRef = useRef<FlatList>(null);
  const user = useSelector(selectUser);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetChatQuery(params.chatId);
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const normalizeMessage = useCallback(
    (msg: IChatMessage): IChatMessage => {
      const myId = user?.id;
      const isMine =
        myId != null &&
        msg.user_id != null &&
        String(msg.user_id) === String(myId);
      return { ...msg, is_mine: isMine };
    },
    [user?.id],
  );

  // Initialize messages from API
  useEffect(() => {
    if (data?.data) {
      setMessages(data.data.map(normalizeMessage));
    }
  }, [data, normalizeMessage]);

  // Connect to socket and join chat room
  useEffect(() => {
    socketService.connect();
    socketService.joinChat(params.chatId);

    // Listen for new messages in this chat
    const handleNewMessage = (newMessage: IChatMessage) => {
      const normalized = normalizeMessage(newMessage);
      setMessages(prev => {
        const exists = prev.some(m => m.id === normalized.id);
        if (exists) return prev;
        return [...prev, normalized];
      });
      scrollToEnd();
    };

    socketService.subscribe(`chat_${params.chatId}`, handleNewMessage);

    return () => {
      socketService.unsubscribe(`chat_${params.chatId}`, handleNewMessage);
      socketService.leaveChat(params.chatId);
    };
  }, [params.chatId, normalizeMessage]);

  // Scroll to end when messages change
  useEffect(() => {
    scrollToEnd();
  }, [messages]);

  const scrollToEnd = () => {
    setTimeout(() => {
      flatlistRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const onChangeMessage = useCallback((text: string) => {
    setMessage(text);
  }, []);

  const onPickFiles = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 5,
      });

      if (result.assets && result.assets.length > 0) {
        setSelectedFiles(result.assets);
      }
    } catch (error) {
      console.error('Error picking files:', error);
    }
  }, []);

  const onRemoveFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const onSendMessage = useCallback(async () => {
    if (!message.trim() && selectedFiles.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('chat_id', String(params.chatId));
      formData.append('message', message.trim());

      // Add files if any
      selectedFiles.forEach((file, index) => {
        formData.append(`files[${index}]`, {
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: file.fileName || `file_${index}.jpg`,
        });
      });

      const response = await sendMessage(formData).unwrap();

      if (response?.data) {
        const sent = normalizeMessage(response.data);
        // Emit through socket
        socketService.sendMessage(
          sent as Parameters<typeof socketService.sendMessage>[0],
        );

        // Add to local messages
        setMessages(prev => [...prev, sent]);

        // Clear input
        setMessage('');
        setSelectedFiles([]);
        scrollToEnd();
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.message || 'Failed to send message',
      });
    }
  }, [message, selectedFiles, params.chatId, sendMessage, normalizeMessage]);

  return {
    refs: {
      flatlistRef,
    },
    values: {
      chatId: params.chatId,
      chatName: params.name,
      chatImage: params.image,
      userRole: params.userRole,
      userId: params.userId,
      currentUserId: user?.id,
      messages,
      message,
      isLoading,
      isSending,
      selectedFiles,
    },
    functions: {
      onChangeMessage,
      onSendMessage,
      onPickFiles,
      onRemoveFile,
      refetch,
    },
  };
};

export default useChatDetailsController;
