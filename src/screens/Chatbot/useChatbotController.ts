import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import {
  useCreateConversationMutation,
  useEndSessionMutation,
  useSendQuestionMutation,
} from '../../redux/Apis/Chatbot';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { TMessage } from '../../interfaces';
import {
  CHATBOT_INITIAL_MESSAGE,
  getValidChatbotSession,
  loadChatbotSessionFromStorage,
  registerChatbotEndSession,
  saveChatbotSession,
  touchChatbotSession,
} from '../../services/chatbot/chatbotSessionCache';

const useChatbotController = () => {
  const flatlist_ref = useRef<FlatList>(null);
  const user = useSelector(selectUser);
  const sessionIdRef = useRef<string | null>(null);
  const isCreatingSessionRef = useRef(false);
  const messagesRef = useRef<TMessage[]>([CHATBOT_INITIAL_MESSAGE]);

  const [createConversation] = useCreateConversationMutation();
  const [send, { data: sendData, isLoading: isSendLoading, isSuccess: isSendSuccess }] =
    useSendQuestionMutation();
  const [endSession] = useEndSessionMutation();

  const [messages, setMessages] = useState<TMessage[]>([CHATBOT_INITIAL_MESSAGE]);
  const [input, setInput] = useState('');

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

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    const hydrateSession = async () => {
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

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [user?.id, startNewConversation]);

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
      return next;
    });
  }, [isSendSuccess, sendData]);

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
      return nextMessages;
    });

    try {
      await sendQuestion(question, sessionIdRef.current);
    } catch {
      const newSessionId = await createSessionOnly();
      if (!newSessionId) return;

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
    },
    functions: {
      onSendMessage,
      onChangeInput: setInput,
    },
  };
};

export default useChatbotController;
