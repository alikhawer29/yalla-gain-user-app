import { FC, memo } from "react";
import { TouchableOpacity, View } from "react-native";
import images from "../../../assets/images";
import { IChatListCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";
import { formatChatListTimeLabel } from "../../../utils/chatDateTime";

const ChatListCard: FC<IChatListCard> = ({ chat, onPress }) => {
    const { name, image, last_message, unread } = chat;

    const formatTime = () => {
        if (!last_message?.date) return '';
        return formatChatListTimeLabel({
            dateStr: last_message.date,
            timeStr: last_message.time,
        });
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <CardWrapper border_radius={5} padding={8} height={110} color={colors.blackish_gray}>
                <Row gap={12} align="flex-start" style={styles.container}>
                    <View style={styles.icon_container}>
                        <Icon source={{ uri: image }} size={38} rounded no_padding />
                    </View>
                    <View style={styles.content_container}>
                        <Row justify="space-between" align="flex-start" gap={8}>
                            <Text weight="semibold" style={styles.name}>
                                {name || 'Unknown'}
                            </Text>
                            {formatTime() ? (
                                <Row align="center" gap={6} style={styles.time_row}>
                                    <Icon source={images.clock} size={11} />
                                    <Text size={10}>{formatTime()}</Text>
                                </Row>
                            ) : null}
                        </Row>
                        <Text lines={2} line_height={19} color={colors.icon_gray}>
                            {last_message?.message || 'No messages yet'}
                        </Text>
                    </View>
                    {unread > 0 && (
                        <View style={styles.unread_badge}>
                            <Text size={10} weight="bold" color={colors.white}>
                                {unread}
                            </Text>
                        </View>
                    )}
                </Row>
            </CardWrapper>
        </TouchableOpacity>
    );
};

export default memo(ChatListCard);

