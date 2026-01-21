import { isFulfilled } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";

const successLogger = () => (next) => (action) => {

    if (isFulfilled(action)) {

        const show_success = action?.meta?.baseQueryMeta?.show_success
        const message = action?.meta?.baseQueryMeta?.message || action.payload?.message;

        if (show_success && message) {
            Toast.show({ text1: "Success!", text2: message, type: "success" });
        }
    }

    return next(action);

};

export default successLogger