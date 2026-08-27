import { isRejectedWithValue } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";

const NO_INTERNET_MESSAGE =
    "No internet connection. Please check your network and try again.";

const isAbortError = (action) => {
    if (action?.payload?.status === "TIMEOUT_ERROR") {
        return false;
    }

    if (action?.meta?.aborted) {
        return true;
    }

    const payloadError = action?.payload?.error;
    return typeof payloadError === "string" && /abort/i.test(payloadError) && !/timeout/i.test(payloadError);
};

const isNetworkError = (action) => {
    const status = action?.payload?.status;
    if (status === "FETCH_ERROR" || status === "TIMEOUT_ERROR") {
        return true;
    }

    const payloadError = action?.payload?.error;
    const errorMessage = action?.error?.message;
    const text = [payloadError, errorMessage].filter((value) => typeof value === "string").join(" ");

    return /network request failed|failed to fetch|internet connection|network error|offline/i.test(text);
};

const getApiErrorMessage = (action) => {
    if (isNetworkError(action)) {
        return NO_INTERNET_MESSAGE;
    }

    const data = action?.payload?.data as Record<string, unknown> | undefined;
    const errList = data?.errors as Record<string, string[]> | undefined;
    const firstFieldError =
        errList && typeof errList === "object"
            ? Object.values(errList).flat?.()?.[0]
            : undefined;
    const message =
        (typeof data?.message === "string" ? data.message : null) ||
        firstFieldError ||
        action?.error?.message ||
        "Something went wrong";

    return message === "Rejected" ? "Something went wrong" : message;
};

const errorLogger = () => (next) => (action) => {

    if (isRejectedWithValue(action)) {
        if (isAbortError(action)) {
            return next(action);
        }

        const message = getApiErrorMessage(action);

        console.log("Error Message :: ", message)

        Toast.show({ text1: "Error!", text2: message, type: "error" });
    }

    return next(action);

};

export default errorLogger
