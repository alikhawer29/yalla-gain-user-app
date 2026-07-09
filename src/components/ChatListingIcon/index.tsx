import { FC, memo } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import colors from '../../utils/colors';
import { heightPixel } from '../../utils/helper';

type ChatListingIconProps = {
  size?: number;
};

const ChatListingIcon: FC<ChatListingIconProps> = ({ size = 36 }) => {
  const dimension = heightPixel(size);

  return (
    <Svg width={dimension} height={dimension} viewBox="0 0 200 200">
      <Circle cx="100" cy="100" r="100" fill={colors.primary} />
      <Path
        d="M60 70 C60 62 67 55 75 55 L125 55 C133 55 140 62 140 70 L140 108 C140 116 133 123 125 123 L90 123 L70 143 L70 123 L75 123 C67 123 60 116 60 108 Z"
        fill="none"
        stroke={colors.white}
        strokeWidth="8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Circle cx="82" cy="89" r="5" fill={colors.white} />
      <Circle cx="100" cy="89" r="5" fill={colors.white} />
      <Circle cx="118" cy="89" r="5" fill={colors.white} />
    </Svg>
  );
};

export default memo(ChatListingIcon);
