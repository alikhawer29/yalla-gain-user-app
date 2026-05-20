import { TMessage } from '../../interfaces';

export const CHATBOT_SESSION_TTL_MS = 10 * 60 * 1000;

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

let cachedSession: CachedChatbotSession | null = null;

let pendingEndSession:
  | ((args: { session_id: string; visitor_id: number | string }) => void)
  | null = null;

/** Register API callback so cache can end sessions on expiry/logout. */
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

const isExpired = (session: CachedChatbotSession): boolean =>
  Date.now() - session.lastActivityAt > CHATBOT_SESSION_TTL_MS;

export const getValidChatbotSession = (
  visitorId: number | string,
): CachedChatbotSession | null => {
  if (!cachedSession || cachedSession.visitorId !== visitorId) {
    return null;
  }
  if (isExpired(cachedSession)) {
    endSessionOnServer(cachedSession);
    cachedSession = null;
    return null;
  }
  return cachedSession;
};

export const saveChatbotSession = (session: CachedChatbotSession) => {
  cachedSession = session;
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
};

export const clearChatbotSession = (options?: { endOnServer?: boolean }) => {
  if (cachedSession && options?.endOnServer !== false) {
    endSessionOnServer(cachedSession);
  }
  cachedSession = null;
};
