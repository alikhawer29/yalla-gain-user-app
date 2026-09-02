import { insertEmojiAt, splitByEmoji } from './emoji';

describe('insertEmojiAt', () => {
  it('inserts an emoji at the cursor without dropping surrounding text', () => {
    const result = insertEmojiAt('Nice work', '🔥', { start: 9, end: 9 });

    expect(result.text).toBe('Nice work🔥');
    expect(result.selection).toEqual({ start: 11, end: 11 });
  });

  it('replaces the selected range with the emoji', () => {
    const result = insertEmojiAt('Hello world', '👍', { start: 6, end: 11 });

    expect(result.text).toBe('Hello 👍');
    expect(result.selection).toEqual({ start: 8, end: 8 });
  });
});

describe('splitByEmoji', () => {
  it('keeps emoji as separate parts so they can render with a system font', () => {
    expect(splitByEmoji('Great job 💪')).toEqual([
      { value: 'Great job ', isEmoji: false },
      { value: '💪', isEmoji: true },
    ]);
  });

  it('keeps ZWJ emoji sequences together', () => {
    expect(splitByEmoji('Hi 👨‍💻')).toEqual([
      { value: 'Hi ', isEmoji: false },
      { value: '👨‍💻', isEmoji: true },
    ]);
  });

  it('treats country flag regional-indicator pairs as emoji', () => {
    expect(splitByEmoji('🇦🇪 (+971) 501234567')).toEqual([
      { value: '🇦🇪', isEmoji: true },
      { value: ' (+971) 501234567', isEmoji: false },
    ]);
  });
});
