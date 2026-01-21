import { FC, memo } from "react";
import { TouchableOpacity, View } from "react-native";
import images from "../../../assets/images";
import { IChatListCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import Badge from "../../Badge";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

const ChatListCard: FC<IChatListCard> = ({ chat, onPress }) => {
    const { name, image, user_role, last_message, unread } = chat;

    // Format the time for display
    const formatTime = () => {
        if (!last_message?.date) return '';
        const date = new Date(last_message.date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return last_message.time || 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return `${Math.floor(diffDays / 7)} weeks ago`;
    };

    const formatRole = (role: string) => {
        if (!role) return '';
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <CardWrapper border_radius={5} padding={8} height={110} color={colors.blackish_gray}>
                <Row gap={12} style={styles.container}>
                    <View style={styles.icon_container}>
                        <Icon source={{ uri: image }} size={38} rounded no_padding />
                    </View>
                    <View style={styles.content_container}>
                        <View>
                            <Text weight="semibold">{name || 'Unknown'}</Text>
                            <Text lines={2} line_height={19} color={colors.icon_gray}>
                                {last_message?.message || 'No messages yet'}
                            </Text>
                        </View>
                        <Row justify="space-between" align="center">
                            {user_role && (
                                <Badge
                                    title={formatRole(user_role)}
                                    color={colors.icon_gray}
                                    style={styles.badge}
                                />
                            )}
                            <Row align="center" gap={6}>
                                <Icon source={images.clock} size={11} />
                                <Text lines={2} size={10}>{formatTime()}</Text>
                            </Row>
                        </Row>
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

