import { useCallback } from "react";
import { useModal } from "../../contexts/ModalContext";
import { goBack } from "../../utils/navigation";
import {
    userApi,
    useGetWalletCoinsQuery,
    useTransferYallaCoinMutation,
} from "../../redux/Apis/User";
import { confirmTransactionWithFee } from "../../utils/transactionCommission";

const useTransferController = () => {
    const { data, isLoading } = useGetWalletCoinsQuery({})
    const [transfer, { isLoading: isTransferLoading }] = useTransferYallaCoinMutation()
    
    const { showOkModal, showYesNoModal } = useModal()
    const [fetchTransactionCommission] =
        userApi.useLazyGetTransactionCommissionQuery()

    const executeTransfer = useCallback((coins: string, unique_id: string) => {
        transfer({ coins, unique_id })
            .unwrap()
            .then(() => {
                showOkModal({
                    type: "success",
                    title: "Transfer Successful",
                    message: `Successfully transferred ${coins} coins to user ${unique_id}`
                })

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

    const handleTransfer = useCallback(async (coins: string, unique_id: string) => {
        await confirmTransactionWithFee(
            fetchTransactionCommission,
            showYesNoModal,
            showOkModal,
            "transfer",
            () => {
                executeTransfer(coins, unique_id)
            },
        )
    }, [fetchTransactionCommission, showYesNoModal, showOkModal, executeTransfer])

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
