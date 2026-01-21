import { Keyboard, KeyboardEvent, LayoutAnimation } from "react-native";
import { useEffect, useState } from "react";

const useKeyboard = () => {
    
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", (e: KeyboardEvent) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    return keyboardHeight;
}

export default useKeyboard