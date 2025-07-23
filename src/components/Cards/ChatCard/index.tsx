import { FC, memo } from "react";
import { View } from "react-native";
import images from "../../../assets/images";
import { IChatCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import Badge from "../../Badge";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

const ChatCard: FC<IChatCard> = ({ user, message, created_at, system }) => {
    return (
        <CardWrapper border_radius={5} padding={8} height={110}>
            <Row gap={12} style={styles.container}>
                <View style={styles.icon_container}>
                    {
                        system ?
                            <Icon source={images.announcement} size={38} border={colors.white} rounded less_padding />
                            :
                            <Icon source={user?.image} size={38} />
                    }
                </View>
                <View style={styles.content_container}>
                    <View>
                        <Text weight="semibold">{system ? "System Notification " : `${user?.first_name} ${user?.last_name}`} </Text>
                        <Text lines={2} line_height={19}>{message}</Text>
                    </View>
                    <Row justify={user ? "space-between" : "flex-end"} align="center">
                        {
                            user &&
                            <Badge title={user?.role} color={colors.icon_gray} style={styles.badge} />
                        }
                        <Row align="center" gap={6}>
                            <Icon source={images.clock} size={11} />
                            <Text lines={2} size={10}>{created_at}</Text>
                        </Row>
                    </Row>
                </View>
            </Row>
        </CardWrapper>
    )
}

export default memo(ChatCard)