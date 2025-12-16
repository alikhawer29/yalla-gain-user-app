import { useCallback } from "react";
import { useModal } from "../../contexts/ModalContext";
import { goBack } from "../../utils/navigation";
import { useGetWalletCoinsQuery, useTransferYallaCoinMutation } from "../../redux/Apis/User";

const useTransferController = () => {
    const { data, isLoading } = useGetWalletCoinsQuery({})
    const [transfer, { isLoading: isTransferLoading }] = useTransferYallaCoinMutation()
    
    const { showOkModal } = useModal()

    const handleTransfer = useCallback((coins: string, unique_id: string) => {
        if (!coins || !unique_id) {
            showOkModal({
                type: "error",
                title: "Validation Error",
                message: "Please fill in all fields"
            })
            return
        }

        if (isNaN(Number(coins)) || Number(coins) <= 0) {
            showOkModal({
                type: "error", 
                title: "Invalid Amount",
                message: "Please enter a valid amount"
            })
            return
        }

        // Make the actual API call to transfer coins
        transfer({ coins, unique_id })
            .unwrap()
            .then((response) => {
                showOkModal({
                    type: "success",
                    title: "Transfer Successful",
                    message: `Successfully transferred ${coins} coins to user ${unique_id}`
                })
                
                // Reset form and go back
                setTimeout(() => {
                    goBack()
                }, 2000)
            })
            .catch((error) => {
                showOkModal({
                    type: "error",
                    title: "Transfer Failed",
                    message: error?.data?.message || "Failed to transfer coins. Please try again."
                })
            })
    }, [transfer, showOkModal])

    return {
        values: {
            data: data || [],
            isLoading,
            isTransferLoading,
        },
        functions: {
            handleTransfer
        }
    }
}

export default useTransferController 
