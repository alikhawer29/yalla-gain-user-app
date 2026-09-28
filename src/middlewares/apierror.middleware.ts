import { isRejectedWithValue } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";

const NO_INTERNET_MESSAGE =
  "No internet connection. Please check your network and try again.";

const GENERIC_ERROR_MESSAGE = "Something went wrong";

const isAbortError = action => {
  if (action?.payload?.status === "TIMEOUT_ERROR") {
    return false;
  }

  if (action?.meta?.aborted || action?.meta?.condition) {
    return true;
  }

  const payloadError = action?.payload?.error;
  const errorName = action?.error?.name;
  const errorMessage = action?.error?.message;
  const text = [payloadError, errorName, errorMessage]
    .filter(value => typeof value === "string")
    .join(" ");

  return /abort|canceled|cancelled/i.test(text) && !/timeout/i.test(text);
};

const isNetworkError = action => {
  const status = action?.payload?.status;
  if (status === "FETCH_ERROR" || status === "TIMEOUT_ERROR") {
    return true;
  }

  const payloadError = action?.payload?.error;
  const errorMessage = action?.error?.message;
  const text = [payloadError, errorMessage]
    .filter(value => typeof value === "string")
    .join(" ");

  return /network request failed|failed to fetch|internet connection|network error|offline|typeerror|econnrefused|enotfound|networkerror/i.test(
    text,
  );
};

/** RTK's default rejection text — not useful to show as a toast. */
const isGenericRejectedMessage = message =>
  typeof message === "string" && /^rejected$/i.test(message.trim());

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
    status === "FETCH_ERROR" ||
    status === "TIMEOUT_ERROR" ||
    status === "PARSING_ERROR" ||
    status === "CUSTOM_ERROR" ||
    typeof status === "number";

  if (hasHttpOrFetchStatus) {
    return false;
  }

  const dataMessage =
    typeof action?.payload?.data?.message === "string"
      ? action.payload.data.message
      : typeof action?.payload?.message === "string"
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
    errList && typeof errList === "object"
      ? Object.values(errList).flat?.()?.[0]
      : undefined;
  const apiMessage = typeof data?.message === "string" ? data.message : null;
  const isGenericValidation =
    apiMessage === "The given data was invalid." ||
    apiMessage === "The given data was invalid";

  const message =
    (apiMessage && !isGenericValidation ? apiMessage : null) ||
    (typeof firstFieldError === "string" ? firstFieldError : null) ||
    apiMessage ||
    action?.error?.message ||
    GENERIC_ERROR_MESSAGE;

  if (isGenericRejectedMessage(message)) {
    return GENERIC_ERROR_MESSAGE;
  }

  return message;
};

const errorLogger = () => next => action => {
  if (isRejectedWithValue(action)) {
    if (isSilentRejection(action)) {
      return next(action);
    }

    const message = getApiErrorMessage(action);

    Toast.show({ text1: "Error!", text2: message, type: "error" });
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
