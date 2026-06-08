import { View, Text, Image, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"
import Wrapper from "../../components/Wrapper"
import Button from "../../components/Button"
import Input from "../../components/Input"
import useTransferController from "./useTransferController"
import styles from "./styles"

const Transfer = () => {
    const [fundAmount, setFundAmount] = useState("")
    const [uniqueId, setUniqueId] = useState("")
    const [fundAmountError, setFundAmountError] = useState("")
    const [uniqueIdError, setUniqueIdError] = useState("")

    const {
        values: {
            data,
            isLoading,
            isTransferLoading,
        },
        functions: {
            handleTransfer,
        }
    } = useTransferController()

    const handleFundAmountChange = (value: string) => {
        setFundAmount(value)
        if (fundAmountError) {
            setFundAmountError("")
        }
    }

    const handleUniqueIdChange = (value: string) => {
        setUniqueId(value)
        if (uniqueIdError) {
            setUniqueIdError("")
        }
    }

    const onTransfer = () => {
        const trimmedAmount = fundAmount.trim()
        const trimmedUniqueId = uniqueId.trim()

        let hasError = false
        let nextAmountError = ""
        let nextUniqueIdError = ""

        if (!trimmedAmount) {
            nextAmountError = "Fund Amount is required"
            hasError = true
        } else if (isNaN(Number(trimmedAmount)) || Number(trimmedAmount) <= 0) {
            nextAmountError = "Please enter a valid amount"
            hasError = true
        }

        if (!trimmedUniqueId) {
            nextUniqueIdError = "Unique Id is required"
            hasError = true
        }

        setFundAmountError(nextAmountError)
        setUniqueIdError(nextUniqueIdError)

        if (hasError) {
            return
        }

        handleTransfer(trimmedAmount, trimmedUniqueId)
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Wrapper scrollable>
                <SafeAreaView style={styles.container}>
                    <View style={styles.content}>
                        {/* Coin Illustration */}
                        <View style={styles.coinContainer}>
                            <Image
                                source={require("../../assets/images/coins.png")}
                                style={styles.coinImage}
                            />
                            <Text style={styles.coinTitle}>
                                My Coins : {data?.my_coins} <Text style={styles.coinTextSmall}> (Yalla Coins) </Text>
                            </Text>
                        </View>

                        {/* Transfer Form */}
                        <View style={styles.formContainer}>
                            <View>
                                <Input
                                    label="Fund Amount"
                                    required
                                    placeholder="Enter amount"
                                    value={fundAmount}
                                    onChangeText={handleFundAmountChange}
                                    type="number"
                                    error={fundAmountError}
                                />
                            </View>

                            <View>
                                <Input
                                    label="Unique Id Of User"
                                    required
                                    placeholder="Enter Unique Id"
                                    value={uniqueId}
                                    onChangeText={handleUniqueIdChange}
                                    type="number"
                                    error={uniqueIdError}
                                />
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.buttonsContainer}>
                            <Button
                                text="Transfer Coins"
                                type="primary"
                                onPress={onTransfer}
                                loading={isTransferLoading}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </Wrapper>
        </KeyboardAvoidingView>
    )
}

export default Transfer
