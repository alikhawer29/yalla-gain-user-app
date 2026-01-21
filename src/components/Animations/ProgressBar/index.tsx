import { FC, memo, useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { IProgressBar } from "../../../interfaces";
import styles from "./styles";

const ProgressBar: FC<IProgressBar> = ({ progress = 0 }) => {

    const progressValue = useSharedValue(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            progressValue.value = withTiming(progress, { duration: 500 });
        }, 500);

        return () => clearTimeout(timeout);
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${progressValue.value}%`
    }));

    return (
        <View style={styles.container}>
            <Animated.View
                style={[styles.bar, animatedStyle]}
            />
        </View>
    )
}

export default memo(ProgressBar)