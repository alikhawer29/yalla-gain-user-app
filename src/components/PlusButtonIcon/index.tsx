import { FC, memo } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import Touchable from '../Touchable';
import colors from '../../utils/colors';
import { heightPixel } from '../../utils/helper';

type PlusButtonIconProps = {
  size?: number;
  onPress?: () => void;
  disabled?: boolean;
};

const PlusButtonIcon: FC<PlusButtonIconProps> = ({
  size = 60,
  onPress,
  disabled = false,
}) => {
  const dimension = heightPixel(size);

  return (
    <Touchable onPress={onPress} disabled={disabled} effect={Boolean(onPress)}>
      <Svg width={dimension} height={dimension} viewBox="0 0 200 200">
        <Circle cx="100" cy="100" r="100" fill={colors.primary} />
        <Path
          d="M100 62 L100 138 M62 100 L138 100"
          stroke={colors.white}
          strokeWidth="12"
          strokeLinecap="round"
        />
      </Svg>
    </Touchable>
  );
};

export default memo(PlusButtonIcon);
