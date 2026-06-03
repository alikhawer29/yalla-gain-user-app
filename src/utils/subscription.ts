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
  is_cancelled?: boolean;
  auto_renew?: boolean;
  can_cancel?: boolean;
  can_purchase_plan?: boolean;
  has_spotify?: boolean;
  has_messaging?: boolean;
  has_nutrition_chatbot?: boolean;
  trainer_sessions_monthly?: number;
  doctor_sessions_monthly?: number;
  yalla_points_monthly?: number;
  yalla_points_annual?: number;
}

export type SubscribePaymentResponse = {
  status?: boolean;
  message?: string;
  error?: string;
  log_id?: number;
  bonus_coins_awarded?: number;
  coins?: number;
  subscription?: UserSubscription;
};

export const getSubscribePaymentMessage = (
  response: SubscribePaymentResponse | undefined,
  fallback: string,
): string => {
  if (!response) return fallback;
  if (response.status === false) {
    return response.error || response.message || fallback;
  }
  return response.message || fallback;
};

export const getUserSubscription = (
  user: { subscription?: UserSubscription } | null | undefined,
): UserSubscription | null => user?.subscription ?? null;

/** True for trial, explicit free plan, missing subscription, or expired access. */
export const isFreeSubscriptionPlan = (
  user: { subscription?: UserSubscription } | null | undefined,
): boolean => {
  const subscription = getUserSubscription(user);
  if (!subscription) return true;
  if (subscription.is_trial === true) return true;
  if (subscription.plan_type?.toLowerCase() === 'free') return true;
  if (subscription.status === 'expired') return true;
  return false;
};

export const hasPaidSubscriptionPlan = (
  user: { subscription?: UserSubscription } | null | undefined,
): boolean => !isFreeSubscriptionPlan(user);

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
  return '7-Day Free Trial';
};

export const isActiveTrialSubscription = (
  user: { subscription?: UserSubscription } | null | undefined,
): boolean => {
  const subscription = getUserSubscription(user);
  return subscription?.is_trial === true && subscription.status !== 'expired';
};

/** Short label for trial banner, e.g. "5 days remaining". */
export const getTrialDaysRemainingLabel = (
  subscription?: UserSubscription | null,
): string => {
  if (!subscription?.is_trial) return '';
  const days = subscription.days_remaining;
  if (typeof days === 'number' && days >= 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} remaining`;
  }
  if (subscription.trial_ends_at) {
    return `Ends ${formatSubscriptionDate(subscription.trial_ends_at)}`;
  }
  if (subscription.expired_on) {
    return `Ends ${formatSubscriptionDate(subscription.expired_on)}`;
  }
  return '';
};

/** @deprecated Use getTrialDaysRemainingLabel for banner */
export const getTrialHomeSubtitle = getTrialDaysRemainingLabel;

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
