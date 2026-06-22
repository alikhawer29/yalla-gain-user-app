import images from '../assets/images';
import colors from './colors';

export type ActivityLogType =
  | 'all'
  | 'transfer_coins'
  | 'purchase_coins'
  | 'subscriptions'
  | 'tips';

export interface ActivityLogItem {
  id: number;
  type: Exclude<ActivityLogType, 'all'>;
  direction: 'sent' | 'received' | 'credit' | 'debit' | string;
  coins: number | null;
  amount: number | null;
  commission_fee: number | null;
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

export interface ActivityLogUI {
  icon: any;
  amountColor: string;
  amountLabel: string;
  subtitle: string;
  typeLabel: string;
}

const formatCoins = (value: number, prefix = '') =>
  `${prefix}${value} coin${value === 1 ? '' : 's'}`;

export const getActivityLogUI = (item: ActivityLogItem): ActivityLogUI => {
  const providerName = item.meta?.provider
    ? `${item.meta.provider.first_name ?? ''} ${item.meta.provider.last_name ?? ''}`.trim()
    : '';

  switch (item.type) {
    case 'tips':
      return {
        icon: images.coin,
        amountColor: colors.new_badge,
        amountLabel:
          item.coins != null ? formatCoins(item.coins, '-') : '',
        subtitle: providerName || item.description,
        typeLabel: 'Tip',
      };
    case 'transfer_coins':
      return {
        icon: images.helpdesk.wallet,
        amountColor:
          item.direction === 'received' ? colors.success : colors.danger,
        amountLabel:
          item.coins != null
            ? formatCoins(
                item.coins,
                item.direction === 'received' ? '+' : '-',
              )
            : '',
        subtitle: item.description,
        typeLabel: 'Transfer',
      };
    case 'purchase_coins':
      return {
        icon: images.coin,
        amountColor: colors.success,
        amountLabel:
          item.coins != null ? formatCoins(item.coins, '+') : '',
        subtitle:
          item.amount != null ? `AED ${item.amount}` : item.description,
        typeLabel: 'Purchase',
      };
    case 'subscriptions':
      return {
        icon: images.helpdesk.subscription,
        amountColor: colors.primary,
        amountLabel:
          item.coins != null
            ? formatCoins(item.coins, '-')
            : item.amount != null
              ? `AED ${item.amount}`
              : '',
        subtitle: item.meta?.plan?.title || item.description,
        typeLabel: 'Subscription',
      };
    default:
      return {
        icon: images.coin,
        amountColor: colors.white,
        amountLabel: item.coins != null ? formatCoins(item.coins) : '',
        subtitle: item.description,
        typeLabel: 'Activity',
      };
  }
};
