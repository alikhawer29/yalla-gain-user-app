import { View } from "react-native"
import Button from "../../components/Button"
import SubscriptionCarousel from "../../components/SubscriptionCarousel"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import AlertModal from "../../components/AlertModal"
import { LOREM } from "../../utils/data"
import { heightPixel } from "../../utils/helper"
import useSubscriptionController from "./useSubscriptionController"
import Loader from "../../components/Loader"

const Subscription = () => {

    const {
        values: {
            data,
            isLoading,
            isSubscribeLoading,
            alertModal
        },
        functions: {
            onChoosePlan,
            onSubscriptionLogs,
            handleModalOk,
            setAlertModal
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

            <AlertModal
                visible={alertModal.visible}
                type={alertModal.type}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal({ ...alertModal, visible: false })}
                onOk={handleModalOk}
            />
        </Wrapper>
    )
}

export default Subscription