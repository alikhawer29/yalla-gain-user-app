import InAppBrowser from "react-native-inappbrowser-reborn";
import colors from "./colors";
import Toast from "react-native-toast-message";

const openInAppBrowser = async (link: string) => {
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