import { Platform } from 'react-native';

export type TextSelection = {
  start: number;
  end: number;
};

export type EmojiTextPart = {
  value: string;
  isEmoji: boolean;
};

export const COMMENT_EMOJIS = [
  '😀',
  '😂',
  '🥰',
  '😍',
  '🤩',
  '😊',
  '😉',
  '😎',
  '😭',
  '😤',
  '👍',
  '👎',
  '❤️',
  '🔥',
  '💪',
  '🎉',
  '🙏',
  '👏',
  '💯',
  '🤔',
  '😅',
  '🤗',
  '😴',
  '🥳',
  '😢',
  '👌',
  '✨',
  '⭐',
  '🙌',
  '👀',
  '🤝',
  '🫡',
] as const;

export const EMOJI_FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: undefined,
});

const EMOJI_SEQUENCE =
  /(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F)?(?:\p{Emoji_Modifier})?)*)/gu;

const clampSelection = (text: string, selection: TextSelection): TextSelection => {
  const start = Math.max(0, Math.min(selection.start, text.length));
  const end = Math.max(start, Math.min(selection.end, text.length));
  return { start, end };
};

export const insertEmojiAt = (
  text: string,
  emoji: string,
  selection: TextSelection,
): { text: string; selection: TextSelection } => {
  const { start, end } = clampSelection(text, selection);
  const next = `${text.slice(0, start)}${emoji}${text.slice(end)}`;
  const cursor = start + emoji.length;
  return {
    text: next,
    selection: { start: cursor, end: cursor },
  };
};

export const splitByEmoji = (text: string): EmojiTextPart[] => {
  if (!text) {
    return [{ value: text, isEmoji: false }];
  }

  const parts: EmojiTextPart[] = [];
  let lastIndex = 0;
  EMOJI_SEQUENCE.lastIndex = 0;

  for (const match of text.matchAll(EMOJI_SEQUENCE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ value: text.slice(lastIndex, index), isEmoji: false });
    }
    parts.push({ value: match[0], isEmoji: true });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ value: text.slice(lastIndex), isEmoji: false });
  }

  if (parts.length === 0) {
    return [{ value: text, isEmoji: false }];
  }

  return parts;
};
