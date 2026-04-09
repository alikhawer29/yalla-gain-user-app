import { isRejectedWithValue } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";

const errorLogger = () => (next) => (action) => {

    if (isRejectedWithValue(action)) {
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

        console.log("Error Message :: ", message)

        Toast.show({ text1: "Error!", text2: message, type: "error" });
    }

    return next(action);

};

export default errorLogger