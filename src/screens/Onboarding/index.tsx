import { useEffect, useState } from "react"
import { Image, ImageBackground, StatusBar, View } from "react-native"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import images from "../../assets/images"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import { heightPixel } from "../../utils/helper"
import { navigateAndSimpleReset } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"

const initialHeight = heightPixel(173.85);
const midHeight = heightPixel(142.37);
const finalHeight = heightPixel(161);

const AnimatedImage = Animated.createAnimatedComponent(Image);

const Onboarding = () => {

    const [initialView, setInitialView] = useState(true);
    const [finished, setFinished] = useState(false);

    const height = useSharedValue(initialHeight);

    useEffect(() => {
        if (finished) {

            let timeout = setTimeout(() => {
                navigateAndSimpleReset(ROUTES.USER_ENTRY);
            }, 2000);

            return () => clearTimeout(timeout)

        }
    }, [finished])

    useEffect(() => {

        let timeout = setTimeout(() => {
            height.value = withTiming(midHeight, { duration: 600 }, (finished) => {
                if (finished) {
                    runOnJS(setInitialView)(false);
                    height.value = withTiming(finalHeight, { duration: 300 }, (secondFinished) => {
                        if (secondFinished) {
                            runOnJS(setFinished)(true);
                        }
                    });
                }
            });
        }, 1000)

        return () => clearTimeout(timeout)

    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
    }));

    let Component = initialView ? ImageBackground : Wrapper

    return (
        <View style={{ flex: 1 }}>
            <Component source={images.splash} style={{ flex: 1, paddingTop: StatusBar.currentHeight }} >
                <AnimatedImage source={images.logo} style={[animatedStyle, { width: "100%", resizeMode: "contain", position: "absolute", top: heightPixel(80) }]} />
                {
                    !initialView &&
                    <>
                        <View style={{ flex: 0.75, justifyContent: "flex-end" }}>
                            <Image source={images.onboarding} style={{ width: "100%", height: "50%", resizeMode: "contain" }} />
                        </View>
                        <View style={{ flex: 0.25 }}>
                            <Text weight="bold" size={34} line_height={45}>Your Fitness, Your Avatar, Your AI Coach!</Text>
                        </View>
                    </>
                }
            </Component>
        </View>
    )
}

export default Onboarding