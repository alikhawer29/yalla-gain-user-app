import InAppBrowser from "react-native-inappbrowser-reborn";
import colors from "./colors";
import Toast from "react-native-toast-message";

const openInAppBrowser = async (link: string) => {
    // Validate the link before attempting to open
    if (!link || typeof link !== 'string') {
        console.error('Error opening In-App Browser: Invalid URL provided', link);
        Toast.show({
            type: "error",
            text1: "Error!",
            text2: 'Invalid payment URL received.'
        });
        return;
    }

    // Ensure the link is a valid URL format
    try {
        new URL(link);
    } catch (urlError) {
        console.error('Error opening In-App Browser: Invalid URL format', link);
        Toast.show({
            type: "error",
            text1: "Error!",
            text2: 'Invalid payment URL format.'
        });
        return;
    }

    if (await InAppBrowser.isAvailable()) {
        try {
            await InAppBrowser.open(link, {
                dismissButtonStyle: 'cancel',
                preferredControlTintColor: 'white',
                preferredBarTintColor: colors.primary,
                readerMode: false,
                animated: true,
                modalPresentationStyle: 'automatic',
                modalEnabled: true,
                enableBarCollapsing: false,
                showTitle: true,
                toolbarColor: colors.primary,
                enableUrlBarHiding: true,
                enableDefaultShare: false,
            }).then(() => {
            })
        } catch (err) {
            console.error('Error opening In-App Browser:', err);
            Toast.show({
                type: "error",
                text1: "Error!",
                text2: 'Failed to open payment page.'
            });
        }
    } else {
        Toast.show({
            type: "error",
            text1: "Error!",
            text2: 'In-App Browser is not available on this device.'
        })
    }
}

export {
    openInAppBrowser
}