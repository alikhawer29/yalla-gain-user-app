import { CommonActions } from '@react-navigation/native';
import { store } from '../redux/Store';
import { NAVIGATORS, ROUTES } from './routes';
import { navigationRef } from './navigation';

/** Normalized FCM / Notifee / in-app notification payload. */
export type NotificationDeepLinkData = Record<string, unknown>;

let pendingDeepLink: NotificationDeepLinkData | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function asString(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

function asPositiveId(value: unknown): number | null {
  const raw = asString(value);
  if (!raw || raw === '0') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function resolveEventType(data: NotificationDeepLinkData): string {
  return (
    asString(data.type) ||
    asString(data.notification_type) ||
    asString(data.event_type) ||
    'general'
  ).toLowerCase();
}

function resolveTargetType(data: NotificationDeepLinkData): string | null {
  const explicit = asString(data.target_type)?.toLowerCase();
  if (explicit) return explicit;

  const eventType = resolveEventType(data);
  if (eventType.startsWith('subscription')) return 'subscription_log';
  if (eventType.startsWith('feed_')) return 'post';
  if (eventType.includes('appointment') || eventType.includes('booking') || eventType.includes('session') || eventType.includes('escrow')) {
    return 'appointment';
  }
  if (eventType.includes('chat') || eventType === 'message') return 'chat';
  if (eventType.includes('challenge')) return 'challenge';
  if (eventType.includes('workout')) return 'workout';
  if (eventType.includes('coin') || eventType.includes('wallet') || eventType.includes('transfer')) {
    return 'wallet';
  }
  if (eventType.includes('feedback')) return 'feedback';
  if (eventType.includes('account')) return 'user';
  return null;
}

function resolveTargetId(data: NotificationDeepLinkData): number | null {
  return (
    asPositiveId(data.target_id) ||
    asPositiveId(data.content_id) ||
    asPositiveId(data.appointment_id) ||
    asPositiveId(data.chat_id) ||
    asPositiveId(data.post_id) ||
    asPositiveId(data.challenge_id) ||
    asPositiveId(data.workout_content_id) ||
    asPositiveId(data.subscription_log_id) ||
    asPositiveId(data.id)
  );
}

function drawerNavigate(screen: string, params?: object): void {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.navigate({
      name: NAVIGATORS.DRAWER as never,
      params: {
        screen,
        params,
      },
    } as never),
  );
}

function bottomTabNavigate(
  tab: string,
  stackScreen: string,
  screenParams?: object,
): void {
  drawerNavigate(NAVIGATORS.BOTTOM, {
    screen: tab,
    params: {
      screen: stackScreen,
      params: screenParams,
    },
  });
}

/**
 * Navigate to the screen that matches the push / in-app notification payload.
 * Never throws — bad payloads fall back to the Notifications list.
 */
export function navigateFromNotificationData(
  data?: NotificationDeepLinkData | null,
): void {
  try {
    if (!data || typeof data !== 'object') {
      openNotificationsList();
      return;
    }

    const eventType = resolveEventType(data);
    if (eventType === 'force_logout') {
      return;
    }

    const targetType = resolveTargetType(data);
    const targetId = resolveTargetId(data);

    switch (targetType) {
      case 'appointment':
        if (targetId) {
          drawerNavigate(NAVIGATORS.CONSULTATION_STACK, {
            screen: ROUTES.BOOKING_DETAILS,
            params: { id: targetId },
          });
          return;
        }
        drawerNavigate(NAVIGATORS.CONSULTATION_STACK, {
          screen: ROUTES.MY_BOOKINGS,
        });
        return;

      case 'chat':
        if (targetId) {
          bottomTabNavigate(NAVIGATORS.CHAT_STACK, ROUTES.CHAT_DETAILS, {
            chatId: targetId,
            name: asString(data.sender_name) || asString(data.title) || 'Chat',
            image: asString(data.image) || asString(data.sender_image) || '',
            userRole: asString(data.user_role) || asString(data.sender_role) || 'user',
            userId: asPositiveId(data.sender_id) || 0,
          });
          return;
        }
        bottomTabNavigate(NAVIGATORS.CHAT_STACK, ROUTES.CHAT);
        return;

      case 'post':
        bottomTabNavigate(NAVIGATORS.NEWSFEED_STACK, ROUTES.NEWSFEED);
        return;

      case 'challenge':
        if (targetId) {
          drawerNavigate(NAVIGATORS.CHALLENGES_STACK, {
            screen: ROUTES.CHALLENGE_DETAIL,
            params: { id: targetId },
          });
          return;
        }
        drawerNavigate(NAVIGATORS.CHALLENGES_STACK, {
          screen: ROUTES.CHALLENGES,
        });
        return;

      case 'workout':
        if (targetId) {
          drawerNavigate(NAVIGATORS.WORKOUT_STACK, {
            screen: ROUTES.WORKOUT_DETAILS,
            params: { id: targetId },
          });
          return;
        }
        drawerNavigate(NAVIGATORS.WORKOUT_STACK, {
          screen: ROUTES.WORKOUT,
        });
        return;

      case 'subscription_log':
      case 'subscription':
        drawerNavigate(NAVIGATORS.SUBSCRIPTION_STACK, {
          screen: ROUTES.SUBSCRIPTION_LOGS,
        });
        return;

      case 'wallet':
      case 'coin_transfer_log':
        if (
          eventType.includes('purchase') ||
          eventType.includes('transfer') ||
          eventType.includes('coin')
        ) {
          drawerNavigate(NAVIGATORS.WALLET_STACK, {
            screen: ROUTES.TRANSACTION_HISTORY,
          });
          return;
        }
        drawerNavigate(NAVIGATORS.WALLET_STACK, {
          screen: ROUTES.WALLET,
        });
        return;

      case 'feedback':
        drawerNavigate(NAVIGATORS.HELP_DESK_STACK, {
          screen: ROUTES.CONTACT_US,
        });
        return;

      case 'user':
      case 'account_status':
        bottomTabNavigate(NAVIGATORS.MY_PROFILE_STACK, ROUTES.MY_PROFILE);
        return;

      default:
        openNotificationsList();
    }
  } catch {
    try {
      openNotificationsList();
    } catch {
      // Swallow — notification taps must never crash the app.
    }
  }
}

function openNotificationsList(): void {
  bottomTabNavigate(NAVIGATORS.HOME_STACK, ROUTES.NOTIFICATIONS);
}

function canNavigateNow(): boolean {
  try {
    return (
      navigationRef.isReady() &&
      Boolean(store.getState().auth?.isLoggedIn)
    );
  } catch {
    return false;
  }
}

/**
 * Open a deep link from a push tap. Queues until nav + auth are ready (cold start).
 */
export function handleNotificationOpen(
  data?: NotificationDeepLinkData | null,
): void {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return;
  }

  const eventType = resolveEventType(data);
  if (eventType === 'force_logout') {
    return;
  }

  if (canNavigateNow()) {
    pendingDeepLink = null;
    navigateFromNotificationData(data);
    return;
  }

  pendingDeepLink = data;
  scheduleFlushPendingDeepLink();
}

/** Retry queued deep link after NavigationContainer / login become ready. */
export function flushPendingNotificationDeepLink(): void {
  if (!pendingDeepLink) return;
  if (!canNavigateNow()) {
    scheduleFlushPendingDeepLink();
    return;
  }
  const payload = pendingDeepLink;
  pendingDeepLink = null;
  navigateFromNotificationData(payload);
}

function scheduleFlushPendingDeepLink(): void {
  if (flushTimer) return;
  let attempts = 0;
  const tick = () => {
    flushTimer = null;
    attempts += 1;
    if (pendingDeepLink && canNavigateNow()) {
      flushPendingNotificationDeepLink();
      return;
    }
    if (pendingDeepLink && attempts < 40) {
      flushTimer = setTimeout(tick, 250);
    }
  };
  flushTimer = setTimeout(tick, 250);
}

/** Normalize Notifee / FCM data bags (values may already be strings). */
export function normalizeNotificationData(
  data?: Record<string, unknown> | object | null,
): NotificationDeepLinkData {
  if (!data || typeof data !== 'object') return {};
  const out: NotificationDeepLinkData = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value === undefined || value === null) continue;
    out[key] = value;
  }
  return out;
}
