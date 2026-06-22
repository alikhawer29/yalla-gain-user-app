import { FC, memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ActivityLogItem, formatAed, getActivityLogUI } from '../../../utils/activityLog';
import colors from '../../../utils/colors';
import CardWrapper from '../../CardWrapper';
import Icon from '../../Icon';
import Row from '../../Row';
import Text from '../../Text';
import styles from './styles';

interface ActivityLogCardProps {
  item: ActivityLogItem;
  onPress?: (item: ActivityLogItem) => void;
}

const ActivityLogCard: FC<ActivityLogCardProps> = ({ item, onPress }) => {
  const ui = getActivityLogUI(item);
  const isPressable = item.type === 'tips' && !!item.meta?.appointment_id;

  const content = (
    <CardWrapper
      color={colors.blackish_gray}
      padding={16}
      border_radius={15}
      height="auto"
      style={styles.card}
    >
      <Row justify="space-between" align="flex-start" style={styles.headerRow}>
        <Row align="center" gap={10} style={{ flex: 1 }}>
          <Icon source={ui.icon} size={22} tint_color={ui.amountColor} />
          <View style={{ flex: 1 }}>
            <Text weight="bold" size={16} color={colors.white}>
              {item.title}
            </Text>
            <Row align="center" gap={6} style={styles.badgeRow}>
              <View style={styles.typeBadge}>
                <Text size={11} weight="semibold" color={colors.white}>
                  {ui.typeLabel}
                </Text>
              </View>
              {ui.showTrialBadge ? (
                <View style={styles.trialBadge}>
                  <Text size={11} weight="semibold" color={colors.white}>
                    Free Trial
                  </Text>
                </View>
              ) : null}
            </Row>
          </View>
        </Row>
        {ui.amountLabel ? (
          <Text weight="bold" size={14} color={ui.amountColor}>
            {ui.amountLabel}
          </Text>
        ) : null}
      </Row>

      {ui.subtitle ? (
        <Text size={13} color={colors.icon_gray} style={styles.description}>
          {ui.subtitle}
        </Text>
      ) : null}

      {ui.expiresOnLabel ? (
        <Text size={12} weight="semibold" color={colors.white} style={styles.expiresOn}>
          {ui.expiresOnLabel}
        </Text>
      ) : null}

      {ui.purchaseDetails ? (
        <View style={styles.purchaseDetails}>
          {ui.purchaseDetails.commissionFeeAed > 0 ? (
            <Text size={12} color={colors.icon_gray}>
              Commission fee: {formatAed(ui.purchaseDetails.commissionFeeAed)}
            </Text>
          ) : null}
          {ui.purchaseDetails.commissionPercentage > 0 ? (
            <Text size={12} color={colors.icon_gray}>
              Commission: {ui.purchaseDetails.commissionPercentage}%
            </Text>
          ) : null}
          {ui.purchaseDetails.totalChargeAed > 0 ? (
            <Text size={12} color={colors.icon_gray}>
              Total deducted: {formatAed(ui.purchaseDetails.totalChargeAed)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {item.type === 'transfer_coins' &&
      item.commission_fee != null &&
      item.commission_fee > 0 ? (
        <Text size={12} color={colors.icon_gray} style={styles.detailLine}>
          Fee: {item.commission_fee} coins
        </Text>
      ) : null}

      <Row justify="space-between" align="center" style={styles.footerRow}>
        <Text size={12} color={colors.icon_gray}>
          {item.created_at}
        </Text>
        {isPressable ? (
          <Text size={12} color={colors.primary} weight="semibold">
            View booking
          </Text>
        ) : null}
      </Row>
    </CardWrapper>
  );

  if (!isPressable) {
    return content;
  }

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onPress?.(item)}>
      {content}
    </TouchableOpacity>
  );
};

export default memo(ActivityLogCard);
