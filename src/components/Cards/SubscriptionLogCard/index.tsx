import { FC, memo } from "react";
import { View } from "react-native";
import images from "../../../assets/images";
import { ISubscriptionLogCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

const SubscriptionLogCard: FC<ISubscriptionLogCard> = ({ subscription_type, subscribed_on, expired_on, amount, label }) => {
    return (
        <CardWrapper height={130} padding={16} color={colors.blackish_gray}>
            <View style={styles.container}>
                <View style={styles.row}>
                    <View style={styles.first}>
                        <Text weight="semibold">Subscription Type</Text>
                        <Text size={12} weight="semibold">{subscription_type}</Text>
                    </View>
                    <View style={styles.second}>
                        <Text weight="semibold">Subscribed On</Text>
                        <Text size={12} weight="semibold">{subscribed_on}</Text>
                    </View>
                    <View style={styles.third}>
                        <Text size={12} weight="semibold" position="right" color={label?.color} underline={label?.underline} onPress={label?.onPress}>{label?.text}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.first}>
                        <Text weight="semibold">Expired On</Text>
                        <Text size={12} weight="semibold">{expired_on}</Text>
                    </View>
                    <View style={styles.second}>
                        <Text weight="semibold">Amount</Text>
                        <Row gap={4} align="center">
                            <Text size={12} weight="semibold">${amount}</Text>
                            <Icon size={12} source={images.coin} />
                            <Text size={12} weight="semibold">Yalla Coins</Text>
                        </Row>
                    </View>
                    <View style={styles.third} />
                </View>
            </View>
        </CardWrapper>
    )
}

export default memo(SubscriptionLogCard)