import dayjs from 'dayjs';
import images from '../assets/images';
import colors from './colors';

export type ActivityLogType =
  | 'all'
  | 'transfer_coins'
  | 'purchase_coins'
  | 'subscriptions'
  | 'tips';

export type ActivityLogDirection =
  | 'sent'
  | 'received'
  | 'credit'
  | 'debit'
  | 'trial'
  | string;

export interface ActivityLogItem {
  id: number;
  type: Exclude<ActivityLogType, 'all'>;
  direction: ActivityLogDirection;
  coins: number | null;
  amount: number | null;
  commission_fee: number | null;
  commission_percentage?: number | null;
  total_deducted: number | null;
  title: string;
  description: string;
  created_at: string;
  meta?: Record<string, any>;
}

export const ACTIVITY_LOG_TABS: { label: string; value: ActivityLogType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Transfers', value: 'transfer_coins' },
  { label: 'Purchases', value: 'purchase_coins' },
  { label: 'Subscriptions', value: 'subscriptions' },
  { label: 'Tips', value: 'tips' },
];

export const ACTIVITY_LOG_TRIAL_COLOR = '#4A98F4';

export interface ActivityLogUI {
  icon: any;
  amountColor: string;
  amountLabel: string;
  subtitle: string;
  typeLabel: string;
  showTrialBadge?: boolean;
  expiresOnLabel?: string;
  purchaseDetails?: {
    commissionFeeAed: number;
    commissionPercentage: number;
    totalChargeAed: number;
  };
}

const formatCoins = (value: number, prefix = '') =>
  `${prefix}${value} coin${value === 1 ? '' : 's'}`;

const parseActivityLogDate = (value: string) => {
  const trimmed = value.trim();
  const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    return dayjs(
      `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
    );
  }
  return dayjs(trimmed);
};

export const isActivityLogTrial = (item: ActivityLogItem): boolean => {
  const flag = item.meta?.is_trial;
  return (
    flag === true ||
    flag === 1 ||
    flag === '1' ||
    flag === 'true' ||
    item.direction === 'trial'
  );
};

export const formatActivityLogExpiry = (value?: string | null): string => {
  if (!value) return '';
  const parsed = parseActivityLogDate(value);
  return parsed.isValid() ? parsed.format('D MMM YYYY') : '';
};

export const getDirectionAmountColor = (direction: ActivityLogDirection): string => {
  switch (direction) {
    case 'debit':
    case 'sent':
      return colors.danger;
    case 'credit':
    case 'received':
      return colors.success;
    case 'trial':
      return ACTIVITY_LOG_TRIAL_COLOR;
    default:
      return colors.white;
  }
};

const isOutgoingDirection = (direction: ActivityLogDirection) =>
  direction === 'debit' || direction === 'sent';

const isIncomingDirection = (direction: ActivityLogDirection) =>
  direction === 'credit' || direction === 'received';

const getDisplayCoins = (item: ActivityLogItem): number | null => {
  if (isActivityLogTrial(item)) return 0;
  return item.coins;
};

const buildCoinsAmountLabel = (item: ActivityLogItem): string => {
  if (item.direction === 'trial') return 'Free';

  const coins = getDisplayCoins(item);
  if (coins == null) return '';

  if (isOutgoingDirection(item.direction)) {
    return formatCoins(coins, coins > 0 ? '-' : '');
  }
  if (isIncomingDirection(item.direction)) {
    return formatCoins(coins, '+');
  }
  return formatCoins(coins);
};

export const formatAed = (value: number) =>
  `AED ${Number.isInteger(value) ? value : value.toFixed(2)}`;

const getPurchaseDetails = (
  item: ActivityLogItem,
): ActivityLogUI['purchaseDetails'] | undefined => {
  if (item.type !== 'purchase_coins') return undefined;

  const commissionFeeAed =
    item.commission_fee ?? item.meta?.commission_aed ?? null;
  const commissionPercentage =
    item.commission_percentage ?? item.meta?.commission_percentage ?? null;
  const totalChargeAed =
    item.total_deducted ?? item.meta?.total_charge_aed ?? null;

  if (
    commissionFeeAed == null &&
    commissionPercentage == null &&
    totalChargeAed == null
  ) {
    return undefined;
  }

  return {
    commissionFeeAed: commissionFeeAed ?? 0,
    commissionPercentage: commissionPercentage ?? 0,
    totalChargeAed: totalChargeAed ?? 0,
  };
};

const getSubscriptionUI = (item: ActivityLogItem): ActivityLogUI => {
  const isTrial = isActivityLogTrial(item);
  const amountColor = getDirectionAmountColor(item.direction);
  let amountLabel = buildCoinsAmountLabel(item);

  if (!amountLabel && item.amount != null && !isTrial) {
    amountLabel = `AED ${item.amount}`;
  }

  const formattedExpiry = formatActivityLogExpiry(item.meta?.expired_on);

  return {
    icon: images.helpdesk.subscription,
    amountColor,
    amountLabel,
    subtitle: item.meta?.plan?.title || item.description,
    typeLabel: 'Subscription',
    showTrialBadge: isTrial,
    expiresOnLabel: isTrial && formattedExpiry
      ? `Expires on: ${formattedExpiry}`
      : undefined,
  };
};

export const getActivityLogUI = (item: ActivityLogItem): ActivityLogUI => {
  const providerName = item.meta?.provider
    ? `${item.meta.provider.first_name ?? ''} ${item.meta.provider.last_name ?? ''}`.trim()
    : '';

  switch (item.type) {
    case 'tips':
      return {
        icon: images.coin,
        amountColor: getDirectionAmountColor(item.direction),
        amountLabel: buildCoinsAmountLabel(item),
        subtitle: providerName || item.description,
        typeLabel: 'Tip',
      };
    case 'transfer_coins':
      return {
        icon: images.helpdesk.wallet,
        amountColor: getDirectionAmountColor(item.direction),
        amountLabel: buildCoinsAmountLabel(item),
        subtitle: item.description,
        typeLabel: 'Transfer',
      };
    case 'purchase_coins':
      return {
        icon: images.coin,
        amountColor: getDirectionAmountColor(item.direction),
        amountLabel: buildCoinsAmountLabel(item),
        subtitle:
          item.amount != null ? `AED ${item.amount}` : item.description,
        typeLabel: 'Purchase',
        purchaseDetails: getPurchaseDetails(item),
      };
    case 'subscriptions':
      return getSubscriptionUI(item);
    default:
      return {
        icon: images.coin,
        amountColor: getDirectionAmountColor(item.direction),
        amountLabel: buildCoinsAmountLabel(item),
        subtitle: item.description,
        typeLabel: 'Activity',
      };
  }
};
