import { ChatbotApiSession } from '../../interfaces';

let pendingHistorySession: ChatbotApiSession | null = null;

export const setPendingHistorySession = (session: ChatbotApiSession) => {
  pendingHistorySession = session;
};

export const consumePendingHistorySession = (): ChatbotApiSession | null => {
  const session = pendingHistorySession;
  pendingHistorySession = null;
  return session;
};
