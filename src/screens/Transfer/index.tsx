import { View, Text, Image, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"
import Wrapper from "../../components/Wrapper"
import Button from "../../components/Button"
import Input from "../../components/Input"
import useTransferController from "./useTransferController"
import styles from "./styles"

const Transfer = () => {
    const [coinAmount, setCoinAmount] = useState("")
    const [uniqueId, setUniqueId] = useState("")
    const [coinAmountError, setCoinAmountError] = useState("")
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

    const handleCoinAmountChange = (value: string) => {
        setCoinAmount(value)
        if (coinAmountError) {
            setCoinAmountError("")
        }
    }

    const handleUniqueIdChange = (value: string) => {
        setUniqueId(value)
        if (uniqueIdError) {
            setUniqueIdError("")
        }
    }

    const onTransfer = () => {
        const trimmedAmount = coinAmount.trim()
        const trimmedUniqueId = uniqueId.trim()

        let hasError = false
        let nextAmountError = ""
        let nextUniqueIdError = ""

        if (!trimmedAmount) {
            nextAmountError = "Coin Transfer is required"
            hasError = true
        } else if (isNaN(Number(trimmedAmount)) || Number(trimmedAmount) <= 0) {
            nextAmountError = "Please enter valid coins"
            hasError = true
        }

        if (!trimmedUniqueId) {
            nextUniqueIdError = "Unique Id is required"
            hasError = true
        }

        setCoinAmountError(nextAmountError)
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
                                    label="Coin Transfer"
                                    required
                                    placeholder="Enter coins"
                                    value={coinAmount}
                                    onChangeText={handleCoinAmountChange}
                                    type="number"
                                    error={coinAmountError}
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
