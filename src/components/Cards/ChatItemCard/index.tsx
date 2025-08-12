import { FC, memo, useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import images from "../../../assets/images";
import { IChatItemCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import { timeFormatter } from "../../../utils/helper";
import Icon from "../../Icon";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

const ChatItemCard: FC<IChatItemCard> = ({ message, sender, image, created_at }) => {

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

    const is_sender = Boolean(sender);

    return (
        <Animated.View
            style={[
                styles.container,
                is_sender ? styles.sender_container : styles.receiver_container,
                { transform: [{ translateY: slide_anim }], opacity: opacity_anim }
            ]}
        >
            {!is_sender && image && (
                <View style={{ width: "20%" }}>
                    <Icon source={images.chatbot} rounded no_padding size={39} />
                </View>
            )}
            <View style={[styles.message_bubble, is_sender ? styles.sender_bubble : styles.receiver_bubble]}>
                <Text size={12}>{message}</Text>
                <Row align="center" gap={5}>
                    <Icon source={images.clock} tint_color={colors.white} size={10} />
                    {created_at && <Text size={10}>{timeFormatter(created_at)}</Text>}
                </Row>
            </View>

            {is_sender && image && (
                <Icon source={images.dummy} rounded no_padding size={39} />
            )}
        </Animated.View>
    );
};

export default memo(ChatItemCard);