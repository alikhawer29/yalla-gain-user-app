import { FC, memo } from "react";
import { View } from "react-native";
import images from "../../../assets/images";
import { IChatCard } from "../../../interfaces";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

const ChatCard: FC<IChatCard> = ({ user, message, role, created_at }) => {
    return (
        <CardWrapper border_radius={5} padding={12} height={110}>
            <Row gap={12}>
                <View style={styles.icon_container}>
                    <Icon source={user?.image} size={50} />
                </View>
                <View style={styles.content_container}>
                    <Text weight="semibold">{user?.first_name} {user?.last_name}</Text>
                    <Text lines={2} line_height={19}>{message}</Text>
                    <Row justify="space-between" align="center">
                        <Text weight="semibold">{role}</Text>
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