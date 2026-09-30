import { isRejectedWithValue } from '@reduxjs/toolkit';
import Toast from 'react-native-toast-message';
import { performForceLogout } from '../utils/forceLogout';

const NO_INTERNET_MESSAGE =
  'No internet connection. Please check your network and try again.';

const GENERIC_ERROR_MESSAGE = 'Something went wrong';
const RATE_LIMIT_MESSAGE =
  'Too many requests. Please wait a moment and try again.';

/** Avoid spamming the same rate-limit toast when many calls fail at once. */
let lastRateLimitToastAt = 0;
const RATE_LIMIT_TOAST_COOLDOWN_MS = 15000;

const isAbortError = action => {
  if (action?.payload?.status === 'TIMEOUT_ERROR') {
    return false;
  }

  if (action?.meta?.aborted || action?.meta?.condition) {
    return true;
  }

  const payloadError = action?.payload?.error;
  const errorName = action?.error?.name;
  const errorMessage = action?.error?.message;
  const text = [payloadError, errorName, errorMessage]
    .filter(value => typeof value === 'string')
    .join(' ');

  return /abort|canceled|cancelled/i.test(text) && !/timeout/i.test(text);
};

const isNetworkError = action => {
  const status = action?.payload?.status;
  if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') {
    return true;
  }

  const payloadError = action?.payload?.error;
  const errorMessage = action?.error?.message;
  const text = [payloadError, errorMessage]
    .filter(value => typeof value === 'string')
    .join(' ');

  return /network request failed|failed to fetch|internet connection|network error|offline|typeerror|econnrefused|enotfound|networkerror/i.test(
    text,
  );
};

/** RTK's default rejection text — not useful to show as a toast. */
const isGenericRejectedMessage = message =>
  typeof message === 'string' && /^rejected$/i.test(message.trim());

/**
 * Navigating between tabs/drawer often cancels in-flight queries. Those land as
 * "Rejected" with no HTTP payload — toasting them looks like a random app error.
 */
const isSilentRejection = action => {
  if (isAbortError(action)) {
    return true;
  }

  const status = action?.payload?.status;
  const hasHttpOrFetchStatus =
    status === 'FETCH_ERROR' ||
    status === 'TIMEOUT_ERROR' ||
    status === 'PARSING_ERROR' ||
    status === 'CUSTOM_ERROR' ||
    typeof status === 'number';

  if (hasHttpOrFetchStatus) {
    return false;
  }

  const dataMessage =
    typeof action?.payload?.data?.message === 'string'
      ? action.payload.data.message
      : typeof action?.payload?.message === 'string'
        ? action.payload.message
        : null;

  if (dataMessage && !isGenericRejectedMessage(dataMessage)) {
    return false;
  }

  const errorMessage = action?.error?.message;
  return !errorMessage || isGenericRejectedMessage(errorMessage);
};

const getApiErrorMessage = action => {
  if (isNetworkError(action)) {
    return NO_INTERNET_MESSAGE;
  }

  const data = action?.payload?.data;
  const errList = data?.errors;
  const firstFieldError =
    errList && typeof errList === 'object'
      ? Object.values(errList).flat?.()?.[0]
      : undefined;
  const apiMessage = typeof data?.message === 'string' ? data.message : null;
  const isGenericValidation =
    apiMessage === 'The given data was invalid.' ||
    apiMessage === 'The given data was invalid';

  const message =
    (apiMessage && !isGenericValidation ? apiMessage : null) ||
    (typeof firstFieldError === 'string' ? firstFieldError : null) ||
    apiMessage ||
    action?.error?.message ||
    GENERIC_ERROR_MESSAGE;

  if (isGenericRejectedMessage(message)) {
    return GENERIC_ERROR_MESSAGE;
  }

  return message;
};

const isUnauthenticatedRejection = action => {
  if (action?.payload?.status !== 401) {
    return false;
  }
  const message = String(
    action?.payload?.data?.message || action?.payload?.message || '',
  ).toLowerCase();
  return message.includes('unauthenticated') || message === '';
};

const isRateLimitRejection = (action, message) => {
  if (action?.payload?.status === 429) {
    return true;
  }
  const lower = String(message || '').toLowerCase();
  return (
    lower.includes('too many attempts') ||
    lower.includes('too many requests') ||
    lower.includes('too many request')
  );
};

const errorLogger = () => next => action => {
  if (isRejectedWithValue(action)) {
    if (isSilentRejection(action)) {
      return next(action);
    }

    // Dead/revoked Sanctum token after admin deactivate (or purge miss).
    // Clear local session instead of leaving a logged-in shell + Unauthenticated toast.
    if (isUnauthenticatedRejection(action)) {
      void performForceLogout(
        {
          title: 'Session Ended',
          message: 'Please log in again to continue.',
        },
        { showModal: true },
      );
      return next(action);
    }

    const message = getApiErrorMessage(action);

    if (isRateLimitRejection(action, message)) {
      const now = Date.now();
      if (now - lastRateLimitToastAt >= RATE_LIMIT_TOAST_COOLDOWN_MS) {
        lastRateLimitToastAt = now;
        Toast.show({
          text1: 'Please wait',
          text2: RATE_LIMIT_MESSAGE,
          type: 'info',
        });
      }
      return next(action);
    }

    Toast.show({ text1: 'Error!', text2: message, type: 'error' });
  }

  return next(action);
};

export default errorLogger;

export {
  GENERIC_ERROR_MESSAGE,
  NO_INTERNET_MESSAGE,
  getApiErrorMessage,
  isAbortError,
  isNetworkError,
  isSilentRejection,
};
