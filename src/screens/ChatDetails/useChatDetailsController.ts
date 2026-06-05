import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BackHandler, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { useGetChatQuery, useSendMessageMutation } from '../../redux/Apis/User';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { IChatMessage } from '../../interfaces';
import socketService from '../../services/socketService';
import { navigateToBookingDetails } from '../../utils/navigation';
import { ChatSelectedAttachment } from './types';
import { isAllowedChatOutgoingAttachment } from '../../utils/chatMedia';

interface RouteParams {
  chatId: number;
  name: string;
  image: string;
  userRole: string;
  userId: number;
  returnToBookingId?: number;
  title?: string;
}

const useChatDetailsController = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as RouteParams;
  const flatlistRef = useRef<FlatList>(null);
  const user = useSelector(selectUser);

  const consultantDisplayName = params.name?.trim() || 'Chat';

  useLayoutEffect(() => {
    navigation.setParams({
      title: consultantDisplayName,
    } as { title: string });
  }, [navigation, consultantDisplayName]);

  useEffect(() => {
    if (!params.returnToBookingId) return;

    const onHardwareBack = () => {
      navigateToBookingDetails(params.returnToBookingId!);
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [params.returnToBookingId]);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<ChatSelectedAttachment[]>(
    [],
  );

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

  useEffect(() => {
    if (data?.data) {
      setMessages(data.data.map(normalizeMessage));
    }
  }, [data, normalizeMessage]);

  useEffect(() => {
    socketService.connect();
    socketService.joinChat(params.chatId);

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

  const appendAttachments = useCallback(
    (items: ChatSelectedAttachment[]) => {
      if (!items.length) return;
      setSelectedFiles(prev => {
        const merged = [...prev];
        items.forEach(item => {
          if (!merged.some(f => f.uri === item.uri)) {
            merged.push(item);
          }
        });
        return merged.slice(0, 5);
      });
    },
    [],
  );

  const onPickFiles = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 5,
      });

      if (result.assets?.length) {
        const imageAssets = result.assets.filter(
          asset =>
            asset.uri && isAllowedChatOutgoingAttachment(asset.type, asset.fileName),
        );

        if (imageAssets.length < result.assets.length) {
          Toast.show({
            type: 'error',
            text1: 'Images only',
            text2: 'You can only send photos in chat. Documents are not allowed.',
          });
        }

        if (imageAssets.length > 0) {
          appendAttachments(
            imageAssets.map(asset => ({
              uri: asset.uri!,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || `image_${Date.now()}.jpg`,
              kind: 'image' as const,
            })),
          );
        }
      }
    } catch (error) {
      console.error('Error picking files:', error);
    }
  }, [appendAttachments]);

  const onRemoveFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const onSendMessage = useCallback(async () => {
    if (!message.trim() && selectedFiles.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('chat_id', String(params.chatId));

      if (message.trim()) {
        formData.append('message', message.trim());
      }

      selectedFiles
        .filter(file => file.kind === 'image')
        .forEach((file, index) => {
          formData.append(`files[${index}]`, {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.name,
          } as unknown as Blob);
        });

      const response = await sendMessage(formData).unwrap();

      if (response?.data) {
        const sent = normalizeMessage(response.data);
        socketService.sendMessage(
          sent as Parameters<typeof socketService.sendMessage>[0],
        );
        setMessages(prev => [...prev, sent]);
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
      chatName: consultantDisplayName,
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
