import AsyncStorage from '@react-native-async-storage/async-storage';
import { TMessage } from '../../interfaces';

export const CHATBOT_STORAGE_KEY = '@chatbot_session';
export const CHATBOT_MAX_MESSAGES = 100;
const PERSIST_DEBOUNCE_MS = 300;

export const CHATBOT_INITIAL_MESSAGE: TMessage = {
  id: '1',
  text: 'Hi there! 👋 Yalla AI is here. How can I help you today?',
  sender: 'bot',
  timestamp: null,
};

export type CachedChatbotSession = {
  visitorId: number | string;
  sessionId: string;
  messages: TMessage[];
  lastActivityAt: number;
};

type StoredMessage = Omit<TMessage, 'timestamp'> & {
  timestamp: string | null;
};

type StoredChatbotSession = {
  visitorId: number | string;
  sessionId: string;
  messages: StoredMessage[];
  lastActivityAt: number;
};

let cachedSession: CachedChatbotSession | null = null;
let persistTimeout: ReturnType<typeof setTimeout> | null = null;

let pendingEndSession:
  | ((args: { session_id: string; visitor_id: number | string }) => void)
  | null = null;

/** Register API callback so cache can end sessions on logout. */
export const registerChatbotEndSession = (
  fn: (args: { session_id: string; visitor_id: number | string }) => void,
) => {
  pendingEndSession = fn;
};

const endSessionOnServer = (session: CachedChatbotSession) => {
  if (!pendingEndSession) return;
  try {
    pendingEndSession({
      session_id: session.sessionId,
      visitor_id: session.visitorId,
    });
  } catch {
    // Best-effort; session will expire server-side.
  }
};

const serializeMessages = (messages: TMessage[]): StoredMessage[] =>
  messages
    .filter(message => !message.typing)
    .slice(-CHATBOT_MAX_MESSAGES)
    .map(message => ({
      ...message,
      timestamp:
        message.timestamp instanceof Date
          ? message.timestamp.toISOString()
          : message.timestamp,
    }));

const deserializeMessages = (messages: StoredMessage[]): TMessage[] =>
  messages.map(message => ({
    ...message,
    timestamp: message.timestamp ? new Date(message.timestamp) : null,
  }));

const persistChatbotSessionToStorage = (session: CachedChatbotSession) => {
  if (persistTimeout) {
    clearTimeout(persistTimeout);
  }

  persistTimeout = setTimeout(async () => {
    persistTimeout = null;
    try {
      const payload: StoredChatbotSession = {
        visitorId: session.visitorId,
        sessionId: session.sessionId,
        messages: serializeMessages(session.messages),
        lastActivityAt: session.lastActivityAt,
      };
      await AsyncStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Silent: persistence failures must not break the app.
    }
  }, PERSIST_DEBOUNCE_MS);
};

export const loadChatbotSessionFromStorage = async (
  visitorId: number | string,
): Promise<CachedChatbotSession | null> => {
  try {
    const raw = await AsyncStorage.getItem(CHATBOT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredChatbotSession>;
    if (
      parsed.visitorId !== visitorId ||
      typeof parsed.sessionId !== 'string' ||
      !Array.isArray(parsed.messages)
    ) {
      return null;
    }

    const session: CachedChatbotSession = {
      visitorId: parsed.visitorId,
      sessionId: parsed.sessionId,
      messages: deserializeMessages(parsed.messages as StoredMessage[]),
      lastActivityAt: parsed.lastActivityAt ?? Date.now(),
    };

    cachedSession = session;
    return session;
  } catch {
    return null;
  }
};

export const clearChatbotSessionStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CHATBOT_STORAGE_KEY);
  } catch {
    // Silent: persistence failures must not break the app.
  }
};

export const getValidChatbotSession = (
  visitorId: number | string,
): CachedChatbotSession | null => {
  if (!cachedSession || cachedSession.visitorId !== visitorId) {
    return null;
  }
  return cachedSession;
};

export const saveChatbotSession = (session: CachedChatbotSession) => {
  cachedSession = session;
  persistChatbotSessionToStorage(session);
};

export const touchChatbotSession = (
  updates?: Partial<Pick<CachedChatbotSession, 'messages' | 'sessionId'>>,
) => {
  if (!cachedSession) return;
  cachedSession = {
    ...cachedSession,
    ...updates,
    lastActivityAt: Date.now(),
  };
  persistChatbotSessionToStorage(cachedSession);
};

export const clearChatbotSession = (options?: { endOnServer?: boolean }) => {
  if (persistTimeout) {
    clearTimeout(persistTimeout);
    persistTimeout = null;
  }

  if (cachedSession && options?.endOnServer !== false) {
    endSessionOnServer(cachedSession);
  }

  cachedSession = null;
  void clearChatbotSessionStorage();
};
