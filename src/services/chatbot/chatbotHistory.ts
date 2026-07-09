import { TMessage, ChatbotApiSession } from '../../interfaces';
import { CHATBOT_INITIAL_MESSAGE } from './chatbotSessionCache';

export type { ChatbotApiSession };

export type ChatbotHistoryListItem = {
  sessionId: string;
  title: string;
  preview: string;
  startedAt: string;
  messageCount: number;
  session: ChatbotApiSession;
};

export const parseListConversationsResponse = (
  data: unknown,
): ChatbotApiSession[] => {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.flatMap(item =>
      Array.isArray((item as { sessions?: ChatbotApiSession[] })?.sessions)
        ? (item as { sessions: ChatbotApiSession[] }).sessions
        : [],
    );
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as { sessions?: ChatbotApiSession[] }).sessions)
  ) {
    return (data as { sessions: ChatbotApiSession[] }).sessions;
  }

  return [];
};

export const sessionToMessages = (session: ChatbotApiSession): TMessage[] => {
  const questions = session.questions ?? [];
  const answers = session.answers ?? [];

  if (questions.length === 0 && answers.length === 0) {
    return [{ ...CHATBOT_INITIAL_MESSAGE, id: `${session.session_id}-welcome` }];
  }

  const messages: TMessage[] = [];
  const pairCount = Math.max(questions.length, answers.length);

  for (let i = 0; i < pairCount; i += 1) {
    const question = questions[i];
    const answer = answers[i];

    if (question?.text?.trim()) {
      messages.push({
        id: `${session.session_id}-q-${i}`,
        text: question.text.trim(),
        sender: 'me',
        timestamp: question.timestamp ? new Date(question.timestamp) : null,
      });
    }

    if (answer?.text?.trim()) {
      messages.push({
        id: `${session.session_id}-a-${i}`,
        text: answer.text.trim(),
        sender: 'bot',
        timestamp: answer.timestamp ? new Date(answer.timestamp) : null,
      });
    }
  }

  return messages;
};

export const toHistoryListItems = (
  sessions: ChatbotApiSession[],
): ChatbotHistoryListItem[] =>
  sessions
    .filter(session => Boolean(session?.session_id))
    .map(session => {
      const questions = session.questions ?? [];
      const answers = session.answers ?? [];
      const firstQuestion = questions.find(q => q.text?.trim())?.text?.trim();
      const lastAnswer = [...answers].reverse().find(a => a.text?.trim())?.text?.trim();
      const messageCount = questions.length + answers.length;
      const previewSource = lastAnswer || firstQuestion || 'No messages yet';
      const preview =
        previewSource.length > 90
          ? `${previewSource.slice(0, 90).trim()}...`
          : previewSource;

      return {
        sessionId: session.session_id,
        title: firstQuestion || 'New conversation',
        preview,
        startedAt: session.started_at || questions[0]?.timestamp || '',
        messageCount,
        session,
      };
    })
    .filter(item => item.messageCount > 0)
    .sort(
      (a, b) =>
        new Date(b.startedAt || 0).getTime() -
        new Date(a.startedAt || 0).getTime(),
    );
