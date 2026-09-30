import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  chatbotApi,
  useCreateConversationMutation,
  useEndSessionMutation,
  useSendQuestionMutation,
} from '../../redux/Apis/Chatbot';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { ChatbotApiSession, TMessage } from '../../interfaces';
import {
  CHATBOT_INITIAL_MESSAGE,
  clearChatbotSession,
  getValidChatbotSession,
  loadChatbotSessionFromStorage,
  registerChatbotEndSession,
  saveChatbotSession,
  touchChatbotSession,
} from '../../services/chatbot/chatbotSessionCache';
import { sessionToMessages } from '../../services/chatbot/chatbotHistory';
import {
  consumePendingHistorySession,
  upsertOptimisticHistorySession,
} from '../../services/chatbot/chatbotHistoryStore';

const messagesToOptimisticSession = (
  sessionId: string,
  nextMessages: TMessage[],
): ChatbotApiSession => {
  const questions: NonNullable<ChatbotApiSession['questions']> = [];
  const answers: NonNullable<ChatbotApiSession['answers']> = [];

  for (const message of nextMessages) {
    if (message.typing || !message.text?.trim()) continue;
    const timestamp =
      message.timestamp instanceof Date
        ? message.timestamp.toISOString()
        : new Date().toISOString();

    if (message.sender === 'me') {
      questions.push({ text: message.text.trim(), timestamp });
    } else if (message.sender === 'bot' && message.id !== CHATBOT_INITIAL_MESSAGE.id) {
      answers.push({ text: message.text.trim(), timestamp });
    }
  }

  return {
    session_id: sessionId,
    questions,
    answers,
    started_at: questions[0]?.timestamp ?? new Date().toISOString(),
  };
};

const useChatbotController = () => {
  const flatlist_ref = useRef<FlatList>(null);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const sessionIdRef = useRef<string | null>(null);
  const isCreatingSessionRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const messagesRef = useRef<TMessage[]>([CHATBOT_INITIAL_MESSAGE]);

  const [createConversation] = useCreateConversationMutation();
  const [send, { data: sendData, isLoading: isSendLoading, isSuccess: isSendSuccess }] =
    useSendQuestionMutation();
  const [endSession] = useEndSessionMutation();

  const [messages, setMessages] = useState<TMessage[]>([CHATBOT_INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isStartingNewChat, setIsStartingNewChat] = useState(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    registerChatbotEndSession(args => {
      endSession(args);
    });
  }, [endSession]);

  const persistSession = useCallback(
    (nextMessages: TMessage[], sessionId?: string | null) => {
      const id = sessionId ?? sessionIdRef.current;
      if (!user?.id || !id) return;
      saveChatbotSession({
        visitorId: user.id,
        sessionId: id,
        messages: nextMessages,
        lastActivityAt: Date.now(),
      });
    },
    [user?.id],
  );

  const createSessionOnly = useCallback(async (): Promise<string | null> => {
    if (!user?.id || isCreatingSessionRef.current) return null;

    isCreatingSessionRef.current = true;
    try {
      const result = await createConversation({ visitor_id: user.id }).unwrap();
      const sessionId = result?.session_id;
      if (!sessionId) return null;

      sessionIdRef.current = sessionId;
      persistSession(messagesRef.current, sessionId);
      return sessionId;
    } catch (error) {
      console.error('Chatbot createConversation error:', error);
      return null;
    } finally {
      isCreatingSessionRef.current = false;
    }
  }, [createConversation, persistSession, user?.id]);

  const startNewConversation = useCallback(async () => {
    const sessionId = await createSessionOnly();
    if (!sessionId) return;

    const initialMessages = [CHATBOT_INITIAL_MESSAGE];
    setMessages(initialMessages);
    persistSession(initialMessages, sessionId);
  }, [createSessionOnly, persistSession]);

  const onStartNewChat = useCallback(async () => {
    if (isCreatingSessionRef.current || isStartingNewChat) return;

    setIsStartingNewChat(true);
    setInput('');
    clearChatbotSession();
    sessionIdRef.current = null;
    hasInitializedRef.current = true;

    const initialMessages = [CHATBOT_INITIAL_MESSAGE];
    setMessages(initialMessages);

    try {
      await startNewConversation();
    } finally {
      setIsStartingNewChat(false);
    }
  }, [isStartingNewChat, startNewConversation]);

  const loadHistoricalSession = useCallback(
    (session: ChatbotApiSession) => {
      const nextMessages = sessionToMessages(session);
      sessionIdRef.current = session.session_id;
      hasInitializedRef.current = true;
      setInput('');
      setMessages(nextMessages);

      if (user?.id) {
        saveChatbotSession({
          visitorId: user.id,
          sessionId: session.session_id,
          messages: nextMessages,
          lastActivityAt: Date.now(),
        });
      }
    },
    [user?.id],
  );

  useEffect(() => {
    hasInitializedRef.current = false;
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const initSession = async () => {
        const pendingSession = consumePendingHistorySession();
        if (pendingSession?.session_id) {
          loadHistoricalSession(pendingSession);
          return;
        }

        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        if (!user?.id) return;

        const inMemory = getValidChatbotSession(user.id);
        if (inMemory) {
          sessionIdRef.current = inMemory.sessionId;
          setMessages(inMemory.messages);
          return;
        }

        const stored = await loadChatbotSessionFromStorage(user.id);
        if (cancelled) return;

        if (stored) {
          sessionIdRef.current = stored.sessionId;
          setMessages(stored.messages);
          return;
        }

        sessionIdRef.current = null;
        setMessages([CHATBOT_INITIAL_MESSAGE]);
        startNewConversation();
      };

      void initSession();

      return () => {
        cancelled = true;
      };
    }, [user?.id, loadHistoricalSession, startNewConversation]),
  );

  useEffect(() => {
    if (flatlist_ref.current) {
      flatlist_ref.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (!isSendSuccess || !sendData) return;

    const new_message: TMessage = {
      id: Date.now().toString(),
      text: typeof sendData === 'string' ? sendData : sendData?.text ?? String(sendData),
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages(prev => {
      const withoutTyping = prev.filter(m => !m.typing);
      const next = [...withoutTyping, new_message];
      touchChatbotSession({ messages: next });
      if (sessionIdRef.current) {
        upsertOptimisticHistorySession(
          messagesToOptimisticSession(sessionIdRef.current, next),
        );
        dispatch(chatbotApi.util.invalidateTags(['ChatbotHistory']));
      }
      return next;
    });
  }, [dispatch, isSendSuccess, sendData]);

  useEffect(() => {
    if (!isSendLoading) return;

    const typingMessage: TMessage = {
      id: `typing-${Date.now()}`,
      sender: 'bot',
      timestamp: null,
      typing: true,
      text: '',
    };

    const timeout = setTimeout(() => {
      setMessages(prev => {
        if (prev.some(m => m.typing)) return prev;
        const next = [...prev, typingMessage];
        touchChatbotSession({ messages: next });
        return next;
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [isSendLoading]);

  const sendQuestion = useCallback(
    async (question: string, sessionId: string) => {
      await send({
        session_id: sessionId,
        question,
      }).unwrap();
    },
    [send],
  );

  const onSendMessage = async () => {
    const question = input.trim();
    if (question === '') return;

    if (!sessionIdRef.current && user?.id) {
      const cached = getValidChatbotSession(user.id);
      if (cached) {
        sessionIdRef.current = cached.sessionId;
        setMessages(cached.messages);
      } else {
        const stored = await loadChatbotSessionFromStorage(user.id);
        if (stored) {
          sessionIdRef.current = stored.sessionId;
          setMessages(stored.messages);
        } else {
          await startNewConversation();
        }
      }
    }

    if (!sessionIdRef.current) return;

    const new_message: TMessage = {
      id: Date.now().toString(),
      text: question,
      sender: 'me',
      timestamp: new Date(),
    };

    setInput('');
    setMessages(prev => {
      const nextMessages = [...prev.filter(m => !m.typing), new_message];
      touchChatbotSession({ messages: nextMessages });
      if (sessionIdRef.current) {
        upsertOptimisticHistorySession(
          messagesToOptimisticSession(sessionIdRef.current, nextMessages),
        );
        dispatch(chatbotApi.util.invalidateTags(['ChatbotHistory']));
      }
      return nextMessages;
    });

    try {
      await sendQuestion(question, sessionIdRef.current);
    } catch {
      const newSessionId = await createSessionOnly();
      if (!newSessionId) return;

      upsertOptimisticHistorySession(
        messagesToOptimisticSession(newSessionId, messagesRef.current),
      );
      dispatch(chatbotApi.util.invalidateTags(['ChatbotHistory']));

      try {
        await sendQuestion(question, newSessionId);
      } catch (retryError) {
        console.error('Chatbot sendQuestion retry error:', retryError);
      }
    }
  };

  return {
    refs: {
      flatlist_ref,
    },
    values: {
      data: messages,
      input,
      isStartingNewChat,
      userPhoto: user?.photo || user?.image || null,
    },
    functions: {
      onSendMessage,
      onChangeInput: setInput,
      onStartNewChat,
    },
  };
};

export default useChatbotController;
