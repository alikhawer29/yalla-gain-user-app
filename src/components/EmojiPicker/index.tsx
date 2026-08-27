import { FC } from 'react';
import { Text as RNText, TouchableOpacity, View } from 'react-native';
import colors from '../../utils/colors';
import { COMMENT_EMOJIS, EMOJI_FONT_FAMILY } from '../../utils/emoji';
import { font, heightPixel, widthPixel } from '../../utils/helper';

interface IEmojiPicker {
  visible: boolean;
  onSelect: (emoji: string) => void;
}

const EmojiPicker: FC<IEmojiPicker> = ({ visible, onSelect }) => {
  if (!visible) {
    return null;
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: widthPixel(8),
        paddingVertical: heightPixel(8),
        borderTopWidth: 1,
        borderTopColor: colors.dark_gray,
        backgroundColor: colors.blackish_gray,
      }}
    >
      {COMMENT_EMOJIS.map(emoji => (
        <TouchableOpacity
          key={emoji}
          onPress={() => onSelect(emoji)}
          style={{
            width: '12.5%',
            alignItems: 'center',
            paddingVertical: heightPixel(6),
          }}
        >
          <RNText
            allowFontScaling={false}
            style={{
              fontSize: font(22),
              lineHeight: font(28),
              fontFamily: EMOJI_FONT_FAMILY,
            }}
          >
            {emoji}
          </RNText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default EmojiPicker;
