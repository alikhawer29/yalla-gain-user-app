import { useCallback, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "../../interfaces"
import { ROUTES } from "../../utils/routes"
import { useModal } from "../../contexts/ModalContext"
import { useUpdateAvatarMutation } from "../../redux/Apis/User"

type LoadingButton = 'initial-view' | 'initial-edit' | 'future-view' | 'future-edit' | null

const useProgressTrackingController = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { showOkModal } = useModal()
  const [updateAvatar] = useUpdateAvatarMutation()
  const [loadingButton, setLoadingButton] = useState<LoadingButton>(null)

  // Navigate to Avatar Visualization
  const navigateToVisualization = useCallback((type: 'initial' | 'future') => {
      navigation.navigate(ROUTES.AVATAR_VISUALIZATION, { type })
  }, [navigation])

  /**
   * Handles avatar update API call
   * @param avatar - "initial" (first CardWrapper) or "future" (second CardWrapper)
   * @param type - "view" or "edit"
   */
  const handleAvatarAction = useCallback(
    async (avatar: 'initial' | 'future', type: 'view' | 'edit') => {
      const buttonKey: LoadingButton = `${avatar}-${type}` as LoadingButton
      
      try {
        setLoadingButton(buttonKey)
        
        const payload = {
          avatar,
          type,
        }

        // Call API
        const response = await updateAvatar(payload).unwrap()

        // Show success message
        // showOkModal({
        //   type: 'success',
        //   title: 'Success',
        //   message: `Avatar ${type === 'view' ? 'viewed' : 'updated'} successfully.`,
        // })

        // Navigate to visualization screen
        navigateToVisualization(avatar)

        return response
      } catch (error: any) {
        // Show error message
        showOkModal({
          type: 'error',
          title: 'Error',
          message: error?.data?.message || `Failed to ${type} avatar. Please try again.`,
        })
        throw error
      } finally {
        setLoadingButton(null)
      }
    },
    [updateAvatar, showOkModal, navigateToVisualization],
  )

  /**
   * Handles button clicks for first CardWrapper (initial avatar)
   */
  const handleInitialAvatarView = useCallback(() => {
    handleAvatarAction('initial', 'view')
  }, [handleAvatarAction])

  const handleInitialAvatarEdit = useCallback(() => {
    handleAvatarAction('initial', 'edit')
  }, [handleAvatarAction])

  /**
   * Handles button clicks for second CardWrapper (future avatar)
   */
  const handleFutureAvatarView = useCallback(() => {
    handleAvatarAction('future', 'view')
  }, [handleAvatarAction])

  const handleFutureAvatarEdit = useCallback(() => {
    handleAvatarAction('future', 'edit')
  }, [handleAvatarAction])

  return {
    values: {
      isLoadingInitialView: loadingButton === 'initial-view',
      isLoadingInitialEdit: loadingButton === 'initial-edit',
      isLoadingFutureView: loadingButton === 'future-view',
      isLoadingFutureEdit: loadingButton === 'future-edit',
    },
    functions: {
      handleInitialAvatarView,
      handleInitialAvatarEdit,
      handleFutureAvatarView,
      handleFutureAvatarEdit,
    },
  }
}

export default useProgressTrackingController
