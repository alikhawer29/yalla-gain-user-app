export type TransactionCommissionAction = 'buy' | 'transfer';

type ShowYesNoModal = (
  data: Record<string, unknown>,
  onConfirm: () => void,
) => void;

type ShowOkModal = (data: Record<string, unknown>) => void;

export const getTransactionFeeConfirmMessage = (
  commissionPercentage: string | number | null | undefined,
  action: TransactionCommissionAction,
): string => {
  const actionLabel =
    action === 'buy' ? 'Buy Yalla Coin' : 'Transfer Yalla Coin';

  const pct =
    commissionPercentage != null && String(commissionPercentage).trim() !== ''
      ? String(commissionPercentage).trim()
      : null;

  if (pct) {
    return `A transaction fee of ${pct}% applies to this ${actionLabel} transaction. \n\nDo you want to continue?`;
  }

  return `Do you want to continue with this ${actionLabel} transaction?`;
};

export const confirmTransactionWithFee = async (
  fetchCommission: () => {
    unwrap: () => Promise<{ data?: { commission_percentage?: string } }>;
  },
  showYesNoModal: ShowYesNoModal,
  showOkModal: ShowOkModal,
  action: TransactionCommissionAction,
  onConfirm: () => void,
): Promise<void> => {
  try {
    const result = await fetchCommission().unwrap();
    const percentage = result?.data?.commission_percentage;

    showYesNoModal(
      {
        type: 'warning',
        title: 'Transaction Fee',
        message: getTransactionFeeConfirmMessage(percentage, action),
        yesText: 'Continue',
        noText: 'Cancel',
      },
      onConfirm,
    );
  } catch {
    showOkModal({
      type: 'error',
      title: 'Error',
      message: 'Unable to load transaction fee. Please try again.',
    });
  }
};
