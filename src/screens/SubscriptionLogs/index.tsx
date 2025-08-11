import { FlatList } from "react-native"
import SubscriptionLogCard from "../../components/Cards/SubscriptionLogCard"
import Empty from "../../components/Empty"
import Loader from "../../components/Loader"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import styles from "./styles"
import useSubscriptionLogsController from "./useSubscriptionLogsController"

const SubscriptionLogs = () => {

    const {
        values: {
            data,
            isLoading,
            isCancelSubscriptionLoading
        },
        functions: {
            onCancel
        }
    } = useSubscriptionLogsController()

    return (
        <Wrapper>
            <Text weight="semibold" size={20} style={styles.heading}>Current Subscription</Text>
            {
                isLoading ? <Loader /> :
                    data?.current ?
                        <SubscriptionLogCard
                            subscription_type={data?.current?.subscription_plan?.title}
                            subscribed_on={data?.current?.subscribed_on}
                            expired_on={data?.current?.expired_on}
                            amount={data?.current?.price_paid}
                            label={{
                                text: isCancelSubscriptionLoading ? "Hold On" : "Cancel",
                                color: isCancelSubscriptionLoading ? colors.gray : colors.primary,
                                onPress: isCancelSubscriptionLoading ? undefined : () => onCancel(data?.current?.id),
                                underline: true
                            }}
                        /> : <Empty message="No Current Subscription Found" />
            }
            <Text weight="semibold" size={20} style={styles.heading}>Past Subscription</Text>
            {
                isLoading ? <Loader /> :
                    <FlatList
                        data={data?.logs}
                        renderItem={({ item }) => (
                            <SubscriptionLogCard
                                subscription_type={item.subscription_plan?.title}
                                subscribed_on={item.subscribed_on}
                                expired_on={item.expired_on}
                                amount={item.price_paid}
                                label={{
                                    text: "Expired",
                                    color: colors.gray,
                                }}
                            />
                        )}
                        ListEmptyComponent={<Empty message="No Past Subscription Logs Found" />}
                    />
            }
        </Wrapper>
    )
}

export default SubscriptionLogs