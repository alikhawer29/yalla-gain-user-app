import { FC, memo, useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { IChatItemCard } from "../../../interfaces";
import { timeFormatter } from "../../../utils/helper";
import Icon from "../../Icon";
import Text from "../../Text";
import styles from "./styles";
import Row from "../../Row";
import images from "../../../assets/images";
import colors from "../../../utils/colors";

const ChatItemCard: FC<IChatItemCard> = ({ message, sender, image, created_at }) => {

    const slideAnim = useRef(new Animated.Value(50)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            })
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                sender ? styles.senderContainer : styles.receiverContainer,
                { transform: [{ translateY: slideAnim }], opacity: opacityAnim }
            ]}
        >
            {!sender && image && (
                <Icon source={images.chatbot} rounded no_padding size={39} />
            )}
            <View style={[styles.messageBubble, sender ? styles.senderBubble : styles.receiverBubble]}>
                <Text size={12} style={styles.messageText}>{message}</Text>
                <Row align="center" gap={5}>
                    <Icon source={images.clock} tint_color={colors.white} size={10} />
                    <Text size={10} style={styles.timeText}>{timeFormatter(new Date())}</Text>
                </Row>
            </View>
            {sender && image && (
                <Icon source={images.dummy} rounded no_padding size={39} />
            )}
        </Animated.View>
    )
}

export default memo(ChatItemCard)