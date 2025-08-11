import { View } from "react-native"
import Button from "../../components/Button"
import SubscriptionCarousel from "../../components/SubscriptionCarousel"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import { LOREM } from "../../utils/data"
import { heightPixel } from "../../utils/helper"
import useSubscriptionController from "./useSubscriptionController"
import Loader from "../../components/Loader"

const Subscription = () => {

    const {
        values: {
            data,
            isLoading,
            isSubscribeLoading
        },
        functions: {
            onChoosePlan,
            onSubscriptionLogs
        }
    } = useSubscriptionController()

    return (
        <Wrapper>
            <Button text="Subscription Logs" type="outlined" onPress={onSubscriptionLogs} />
            <View style={{ marginVertical: heightPixel(25) }}>
                <Text>{LOREM}</Text>
            </View>
            {
                isLoading ? <Loader /> :
                    <SubscriptionCarousel data={data} onChoosePlan={onChoosePlan} isLoading={isSubscribeLoading} />
            }
        </Wrapper>
    )
}

export default Subscription