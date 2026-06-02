import { FlatList } from "react-native"
import SubscriptionLogCard from "../../components/Cards/SubscriptionLogCard"
import Empty from "../../components/Empty"
import Loader from "../../components/Loader"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import styles from "./styles"
import useSubscriptionLogsController from "./useSubscriptionLogsController"
import { getTrialLabel } from "../../utils/subscription"

const SubscriptionLogs = () => {

    const {
        values: {
            data,
            isLoading,
            isCancelSubscriptionLoading
        },
        functions: {
            hasCurrentSubscription,
            isSubscriptionCancelled,
            getCurrentSubscriptionLabel,
            getCancelledAccessNote,
        }
    } = useSubscriptionLogsController()

    const current = data?.current
    const cancelledNote = current ? getCancelledAccessNote(current) : null
    const isTrial = current?.is_trial
    const title = isTrial ? getTrialLabel(current) : current?.subscription_plan?.title

    return (
        <Wrapper>
            <Text weight="semibold" size={20} style={styles.heading}>Current Subscription</Text>
            {
                isLoading ? <Loader /> :
                    current && hasCurrentSubscription(current) ?
                        <>
                            {cancelledNote ? (
                                <Text
                                    size={12}
                                    color={colors.icon_gray}
                                    style={styles.cancelled_note}
                                >
                                    {cancelledNote}
                                </Text>
                            ) : null}
                            <SubscriptionLogCard
                                duration={current?.subscription_plan?.duration}
                                subscription_type={title}
                                subscribed_on={current?.subscribed_on}
                                expired_on={current?.expired_on}
                                amount={current?.price_paid}
                                label={getCurrentSubscriptionLabel(current)}
                                is_trial={isTrial}
                            />
                        </>
                        : <Empty message={current ? "Subscription has expired" : "No Current Subscription Found"} />
            }
            <Text weight="semibold" size={20} style={styles.heading}>Past Subscription</Text>
            {
                isLoading ? <Loader /> :
                    <FlatList
                        data={data?.logs}
                        renderItem={({ item }) => (
                            <SubscriptionLogCard
                                // duration={item.subscription_plan?.duration}
                                subscription_type={item.subscription_plan?.title}
                                subscribed_on={item.subscribed_on}
                                expired_on={item.expired_on}
                                amount={item.price_paid}
                                label={{
                                    text: "Expired",
                                    color: colors.gray,
                                }}
                                is_trial={item.is_trial}
                            />
                        )}
                        ListEmptyComponent={<Empty message="No Past Subscription Logs Found" />}
                    />
            }
        </Wrapper>
    )
}

export default SubscriptionLogs