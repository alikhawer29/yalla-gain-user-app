import { FC, memo, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import images from '../../../assets/images';
import colors from '../../../utils/colors';
import {
  getTrialDaysRemainingLabel,
  UserSubscription,
} from '../../../utils/subscription';
import { NAVIGATORS, ROUTES } from '../../../utils/routes';
import Icon from '../../Icon';
import Text from '../../Text';
import styles from './styles';

type TrialBannerProps = {
  subscription: UserSubscription;
};

const TrialBanner: FC<TrialBannerProps> = ({ subscription }) => {
  const navigation = useNavigation<any>();
  const daysRemainingLabel = useMemo(
    () => getTrialDaysRemainingLabel(subscription),
    [subscription],
  );

  const handleClaim = () => {
    navigation.navigate(NAVIGATORS.SUBSCRIPTION_STACK, {
      screen: ROUTES.SUBSCRIPTION,
    });
  };

  return (
    <View style={styles.banner}>
      <View style={styles.decor_arc} />
      <View style={styles.content_row}>
        <View style={styles.text_block}>
          <Text size={11} weight="semibold" style={styles.tagline}>
            Unlock the full experience with our
          </Text>
          <Text size={18} weight="bold" style={styles.headline}>
            7-DAY FREE TRIAL
          </Text>
          {daysRemainingLabel ? (
            <Text size={11} weight="semibold" style={styles.days_remaining}>
              {daysRemainingLabel}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleClaim}
          style={styles.claim_btn_wrap}
        >
          <View style={styles.claim_btn_glow} />
          <View style={styles.claim_btn}>
            <Text size={12} weight="bold" color={colors.white}>
              Upgrade Now
            </Text>
            <Icon
              source={images.right_arrow}
              size={14}
              tint_color={colors.white}
              no_padding
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(TrialBanner);
