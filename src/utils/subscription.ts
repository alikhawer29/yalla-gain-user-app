import dayjs from 'dayjs';

export const SUBSCRIPTION_UPGRADE_MESSAGE =
  'This feature is not available in your current plan.\nPlease upgrade your subscription to continue.';

export type SubscriptionFeature =
  | 'spotify'
  | 'messaging'
  | 'nutrition_chatbot'
  | 'doctor_appointments'
  | 'trainer_appointments'
  | 'any_appointments';

export interface UserSubscription {
  title?: string;
  plan_type?: string;
  is_trial?: boolean;
  trial_ends_at?: string | null;
  expired_on?: string | null;
  days_remaining?: number;
  status?: string;
  has_spotify?: boolean;
  has_messaging?: boolean;
  has_nutrition_chatbot?: boolean;
  trainer_sessions_monthly?: number;
  doctor_sessions_monthly?: number;
  yalla_points_monthly?: number;
  yalla_points_annual?: number;
}

export const getUserSubscription = (
  user: { subscription?: UserSubscription } | null | undefined,
): UserSubscription | null => user?.subscription ?? null;

export const formatPlanType = (planType?: string): string => {
  if (!planType) return 'N/A';
  return planType.charAt(0).toUpperCase() + planType.slice(1);
};

export const formatSubscriptionDate = (value?: string | null): string => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('MMM D, YYYY') : '—';
};

export const getTrialLabel = (
  subscription?: UserSubscription | null,
): string => {
  if (!subscription?.is_trial) return '';
  const days = subscription.days_remaining;
  if (typeof days === 'number' && days >= 0) {
    return '7-Day Trial';
  }
  return '7-Day Trial';
};

export const canAccessSubscriptionFeature = (
  user: { subscription?: UserSubscription } | null | undefined,
  feature: SubscriptionFeature,
): boolean => {
  const subscription = getUserSubscription(user);
  if (!subscription) return false;

  switch (feature) {
    case 'spotify':
      return subscription.has_spotify === true;
    case 'messaging':
      return subscription.has_messaging === true;
    case 'nutrition_chatbot':
      return subscription.has_nutrition_chatbot === true;
    case 'doctor_appointments':
      return Number(subscription.doctor_sessions_monthly) > 0;
    case 'trainer_appointments':
      return Number(subscription.trainer_sessions_monthly) > 0;
    case 'any_appointments':
      return (
        Number(subscription.doctor_sessions_monthly) > 0 ||
        Number(subscription.trainer_sessions_monthly) > 0
      );
    default:
      return false;
  }
};
