import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { authApi } from '../redux/Apis/Auth';
import { chatbotApi } from '../redux/Apis/Chatbot';
import { movementCorrectionApi } from '../redux/Apis/MovementCorrection';
import { userApi } from '../redux/Apis/User';
import { logout } from '../redux/Slices/AuthSlice';
import { logoutSpotify } from '../redux/Slices/SpotifySlice';
import { persistor, store } from '../redux/Store';
import { setWatchHealthLinked } from '../services/health/healthProvider';
import socketService from '../services/socketService';
import { deleteUnityGameUserData } from './unityGameData';
import {
  flushPendingForceLogoutModal,
  queueForceLogoutModal,
  showForceLogoutModal,
  type ForceLogoutModalPayload,
} from './forceLogoutModalBridge';

export const FORCE_LOGOUT_TYPE = 'FORCE_LOGOUT';

const DEFAULT_FORCE_LOGOUT: ForceLogoutModalPayload = {
  title: 'Account Deactivated',
  message: 'Your account has been deactivated. Please contact support.',
};

let forceLogoutInProgress = false;

export const parseForceLogoutPayload = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null | undefined,
): ForceLogoutModalPayload | null => {
  if (!remoteMessage) return null;

  const data = remoteMessage.data ?? {};
  const type = data.type ?? data.notification_type;

  if (type !== FORCE_LOGOUT_TYPE) {
    return null;
  }

  const title =
    (typeof data.title === 'string' && data.title.trim()) ||
    remoteMessage.notification?.title?.trim() ||
    DEFAULT_FORCE_LOGOUT.title;

  const message =
    (typeof data.body === 'string' && data.body.trim()) ||
    remoteMessage.notification?.body?.trim() ||
    DEFAULT_FORCE_LOGOUT.message;

  return { title, message };
};

const clearAppState = async (): Promise<void> => {
  socketService.disconnect();

  try {
    await deleteUnityGameUserData();
  } catch {
    // Non-fatal during forced logout.
  }

  try {
    await setWatchHealthLinked(false);
  } catch {
    // Non-fatal during forced logout.
  }

  store.dispatch(logout());
  store.dispatch(logoutSpotify());
  store.dispatch(authApi.util.resetApiState());
  store.dispatch(userApi.util.resetApiState());
  store.dispatch(chatbotApi.util.resetApiState());
  store.dispatch(movementCorrectionApi.util.resetApiState());

  try {
    await persistor.purge();
  } catch {
    // Continue with full storage clear.
  }

  try {
    await AsyncStorage.clear();
  } catch {
    // Redux logout already applied in memory.
  }
};

export const performForceLogout = async (
  payload: ForceLogoutModalPayload = DEFAULT_FORCE_LOGOUT,
  options?: { showModal?: boolean },
): Promise<void> => {
  if (forceLogoutInProgress) return;

  forceLogoutInProgress = true;
  try {
    await clearAppState();

    if (options?.showModal === false) {
      queueForceLogoutModal(payload);
    } else {
      showForceLogoutModal(payload);
    }
  } finally {
    forceLogoutInProgress = false;
  }
};

export const handleForegroundFcmMessage = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<boolean> => {
  const payload = parseForceLogoutPayload(remoteMessage);
  if (!payload) return false;

  await performForceLogout(payload, { showModal: true });
  return true;
};

export const handleBackgroundFcmMessage = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<boolean> => {
  const payload = parseForceLogoutPayload(remoteMessage);
  if (!payload) return false;

  await performForceLogout(payload, { showModal: false });
  return true;
};

export const handleNotificationOpenForceLogout = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<boolean> => {
  const payload = parseForceLogoutPayload(remoteMessage);
  if (!payload) return false;

  const isLoggedIn = store.getState().auth.isLoggedIn;
  if (isLoggedIn) {
    await performForceLogout(payload, { showModal: true });
  } else {
    showForceLogoutModal(payload);
  }

  return true;
};

export { flushPendingForceLogoutModal };
