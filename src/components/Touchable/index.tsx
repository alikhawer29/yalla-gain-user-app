import { FC, memo } from "react";
import { TouchableWithoutFeedback } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { ITouchable } from "../../interfaces";

const Touchable: FC<ITouchable> = ({ children, style, disabled, slop, onPress, onLongPress, onPressOut, effect = true }) => {

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.9, { stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { stiffness: 300 });
        if (onPressOut) {
            onPressOut()
        }
    };

    return (
        <TouchableWithoutFeedback disabled={disabled} onPressIn={handlePressIn}
            onPressOut={handlePressOut} onPress={onPress} hitSlop={slop} onLongPress={onLongPress} style={{ zIndex: 99 }}>
            <Animated.View style={[effect ? animatedStyle : {}, style]}>
                {children}
            </Animated.View>
        </TouchableWithoutFeedback>
    )
}

export default memo(Touchable)