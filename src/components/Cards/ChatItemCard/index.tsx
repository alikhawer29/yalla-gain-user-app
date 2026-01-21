import { FC, memo, useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import images from "../../../assets/images";
import { IChatItemCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import { timeFormatter } from "../../../utils/helper";
import Icon from "../../Icon";
import Loader from "../../Loader";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

const ChatItemCard: FC<IChatItemCard> = ({ message, sender, image, created_at, typing = false }) => {

    const slide_anim = useRef(new Animated.Value(50)).current;
    const opacity_anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slide_anim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(opacity_anim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            })
        ]).start();
    }, [slide_anim, opacity_anim]);

    const is_sender = Boolean(sender)

    const Tail = ({ right = true, fill = colors.blackish_gray }) => {

        const dLeft = `M0 0 L0 18 L18 18 Z`
        const dRight = `M14 0 L18 18 L0 18 Z`

        return (
            <Svg
                width={18}
                height={18}
                viewBox="0 0 18 18"
                style={right ? styles.tailRight : styles.tailLeft}
            >
                <Path d={right ? dRight : dLeft} fill={fill} />
            </Svg>
        );
    };

    return (
        <Animated.View
            style={[
                styles.container,
                is_sender ? styles.sender_container : styles.receiver_container,
                { transform: [{ translateY: slide_anim }], opacity: opacity_anim }
            ]}
        >
            {image && (
                <View style={{ width: "20%", alignItems: is_sender ? "flex-end" : "flex-start" }}>
                    <Icon source={image} rounded no_padding size={39} />
                </View>
            )}
            {
                typing ?
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <Loader type="BallPulseSync" />
                    </View> :
                    <>
                        <View style={[styles.message_bubble, is_sender ? styles.sender_bubble : styles.receiver_bubble]}>
                            <Tail right={is_sender} />
                            <Text size={12}>{message}</Text>
                            {
                                created_at &&
                                <Row align="center" justify={is_sender ? "flex-start" : "flex-end"} gap={5}>
                                    <Icon source={images.clock} tint_color={colors.white} size={10} />
                                    <Text size={10}>{timeFormatter(created_at)}</Text>
                                </Row>
                            }
                        </View>
                    </>
            }
        </Animated.View >
    );
};

export default memo(ChatItemCard);