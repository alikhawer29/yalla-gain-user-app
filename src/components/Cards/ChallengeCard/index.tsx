import { FC, memo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import images from '../../../assets/images';
import CardWrapper from '../../CardWrapper';
import Image from '../../Image';
import Text from '../../Text';
import colors from '../../../utils/colors';
import styles from './styles';
import { capitalizeFirst, capitalizeWords } from '../../../utils/data';

const CARD_BG = '#131313';

// Arrow from arrow_right.svg (16x17) – circle bg + chevron
const ArrowRightIcon = ({ size = 16, color = colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 16 17" fill="none">
    <Rect width="15.043" height="16.2342" x="0" y="0" rx="7.52152" fill="#2F2F2F" />
    <Path
      d="M4.30103 8.11675H10.748"
      stroke={color}
      strokeWidth="0.606778"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.52454 4.63817L10.748 8.11694L7.52454 11.5957"
      stroke={color}
      strokeWidth="0.606778"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export interface IChallengeCard {
  id: number;
  image?: string;
  title: string;
  type?: string;
  status?: 'ongoing' | 'new' | string;
  onPress?: () => void;
}

const ChallengeCard: FC<IChallengeCard> = ({
  image,
  title,
  type = 'Activity',
  status,
  onPress,
}) => {
  const isOngoing = status === 'ongoing' || status === 'Ongoing';

  return (
    <CardWrapper
      width="48%"
      color={CARD_BG}
      border_radius={5}
      padding={6}
      onPress={onPress}
    >
      <View style={styles.container}>
        <View style={styles.image_container}>
          <Image
            source={image ? { uri: image } : images.dummy}
            style={styles.image}
            resize="cover"
          />
          {status ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isOngoing
                    ? colors.transparent_primary
                    : colors.new_badge,
                },
              ]}
            >
              <Text size={10} weight="semibold" color={colors.white}>
                {isOngoing ? 'Ongoing' : 'New'}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.title_block}>
          <View style={styles.title_row}>
            <Text
              weight="semibold"
              size={14}
              lines={2}
              style={[styles.title, styles.title_flex]}
            >
              {capitalizeFirst(title)}
            </Text>
            <View style={styles.icon_wrap} pointerEvents="none">
              <ArrowRightIcon size={20} />
            </View>
          </View>
          <Text size={10} weight="bold" style={styles.type_label}>
            Challenge Type:{' '}
            <Text weight="regular" size={10} color={colors.icon_gray}>
              {capitalizeWords(type)}
            </Text>
          </Text>
        </View>
      </View>
    </CardWrapper >
  );
};

export default memo(ChallengeCard);
