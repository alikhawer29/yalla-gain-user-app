import { ChatbotApiSession } from '../../interfaces';

let pendingHistorySession: ChatbotApiSession | null = null;

/** Local sessions so history shows a chat as soon as the user sends (before bot reply). */
const optimisticSessions = new Map<string, ChatbotApiSession>();
let optimisticVersion = 0;
const optimisticListeners = new Set<() => void>();

const notifyOptimisticListeners = () => {
  optimisticVersion += 1;
  optimisticListeners.forEach(listener => listener());
};

export const subscribeOptimisticHistory = (listener: () => void) => {
  optimisticListeners.add(listener);
  return () => {
    optimisticListeners.delete(listener);
  };
};

export const getOptimisticHistoryVersion = () => optimisticVersion;

export const setPendingHistorySession = (session: ChatbotApiSession) => {
  pendingHistorySession = session;
};

export const consumePendingHistorySession = (): ChatbotApiSession | null => {
  const session = pendingHistorySession;
  pendingHistorySession = null;
  return session;
};

export const upsertOptimisticHistorySession = (session: ChatbotApiSession) => {
  if (!session?.session_id) return;
  optimisticSessions.set(session.session_id, session);
  notifyOptimisticListeners();
};

export const clearOptimisticHistorySession = (sessionId: string) => {
  if (!optimisticSessions.delete(sessionId)) return;
  notifyOptimisticListeners();
};

export const clearAllOptimisticHistorySessions = () => {
  if (optimisticSessions.size === 0) return;
  optimisticSessions.clear();
  notifyOptimisticListeners();
};

export const getOptimisticHistorySessions = (): ChatbotApiSession[] =>
  Array.from(optimisticSessions.values());

/**
 * Merge API sessions with optimistic ones. Prefer the richer server copy when it
 * already includes the user's question (or more messages).
 */
export const mergeHistorySessions = (
  apiSessions: ChatbotApiSession[],
): ChatbotApiSession[] => {
  const byId = new Map<string, ChatbotApiSession>();
  const staleOptimisticIds: string[] = [];

  for (const session of apiSessions) {
    if (session?.session_id) {
      byId.set(session.session_id, session);
    }
  }

  for (const optimistic of optimisticSessions.values()) {
    const existing = byId.get(optimistic.session_id);
    if (!existing) {
      byId.set(optimistic.session_id, optimistic);
      continue;
    }

    const existingCount =
      (existing.questions?.length ?? 0) + (existing.answers?.length ?? 0);
    const optimisticCount =
      (optimistic.questions?.length ?? 0) + (optimistic.answers?.length ?? 0);

    if (existingCount >= optimisticCount) {
      staleOptimisticIds.push(optimistic.session_id);
    } else {
      byId.set(optimistic.session_id, optimistic);
    }
  }

  if (staleOptimisticIds.length > 0) {
    queueMicrotask(() => {
      let changed = false;
      for (const id of staleOptimisticIds) {
        if (optimisticSessions.delete(id)) changed = true;
      }
      if (changed) notifyOptimisticListeners();
    });
  }

  return Array.from(byId.values());
};
