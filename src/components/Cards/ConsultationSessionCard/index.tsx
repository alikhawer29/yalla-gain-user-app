import { FC, memo } from 'react';
import { View } from 'react-native';
import { IConsultationSessionCard } from '../../../interfaces';
import colors from '../../../utils/colors';
import { heightPixel } from '../../../utils/helper';
import CardWrapper from '../../CardWrapper';
import Text from '../../Text';
import styles from './styles';

const ConsultationSessionCard: FC<IConsultationSessionCard> = ({
  title,
  remaining,
  limit,
}) => (
  <CardWrapper padding={16} height={145} border_radius={15}>
    <View style={styles.container}>
      <Text weight="semibold">{title}</Text>
      <View style={styles.remaining_block}>
        <Text size={12} weight="semibold" color={colors.icon_gray}>
          Remaining:
        </Text>
        <Text weight="bold" size={19} style={styles.remaining_value}>
          {remaining}/{limit}
        </Text>
      </View>
    </View>
  </CardWrapper>
);

export default memo(ConsultationSessionCard);
