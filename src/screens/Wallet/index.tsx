import { View, Text, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Wrapper from "../../components/Wrapper"
import Button from "../../components/Button"
import PaymentModal from "../../components/PaymentModal"
import { heightPixel, widthPixel } from "../../utils/helper"
import useWalletController from "./useWalletController"
import styles from "./styles"
import images from "../../assets/images"

const Wallet = () => {
    const {
        values: {
            data,
            isLoading,
            showPaymentModal,
            isBuyCoinsLoading,
            commissionPercentage,
            isCommissionLoading,
            paymentFormResetToken,
        },
        functions: {
            handleAddCoins,
            handleSendCoins,
            handlePayment,
            closePaymentModal,
        }
    } = useWalletController()

    return (
        <Wrapper>
            <SafeAreaView style={styles.container}>
                {/* Coin Illustration */}
                <View style={styles.content}>
                    <View style={styles.coinContainer}>
                        <Image
                            source={require("../../assets/images/coins.png")}
                            style={styles.coinImage}
                        />

                        <Text style={styles.coinText}>
                            My Coins : {data?.my_coins} <Text style={styles.coinTextSmall}> (Yalla Coins) </Text>
                        </Text>

                        <Text style={styles.coinValue}>
                            1 Yalla Coin Is Equal To {data?.coin_amount} AED
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonsContainer}>
                        <Button
                            text='Add More Coins'
                            type="primary"
                            onPress={handleAddCoins}
                        />
                        <Button
                            text='Send Coins To Other Users'
                            type="outlined"
                            onPress={handleSendCoins}
                        />
                    </View>
                </View>

                {/* Payment Modal */}
                <PaymentModal
                    visible={showPaymentModal}
                    onClose={closePaymentModal}
                    onPayment={handlePayment}
                    coinValue={data?.coin_amount || '1$'}
                    commissionPercentage={commissionPercentage}
                    isCommissionLoading={isCommissionLoading}
                    isLoading={isBuyCoinsLoading}
                    formResetToken={paymentFormResetToken}
                />
            </SafeAreaView>
        </Wrapper>
    )
}

export default Wallet
