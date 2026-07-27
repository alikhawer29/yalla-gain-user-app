import { FlatList } from "react-native"
import { useState } from "react"
import { useDispatch } from "react-redux"
import images from "../../assets/images"
import HelpDeskCard from "../../components/Cards/HelpDeskCard"
import Seperator from "../../components/Seperator"
import Wrapper from "../../components/Wrapper"
import AlertModal from "../../components/AlertModal"
import colors from "../../utils/colors"
import { useSubscriptionAccess } from "../../hooks/useSubscriptionAccess"
import { navigate } from "../../utils/navigation"
import { ROUTES, NAVIGATORS } from "../../utils/routes"
import { SUBSCRIPTIONS_PURCHASE_ENABLED } from "../../utils/subscription"
import { useDeleteAccountMutation } from "../../redux/Apis/User"
import { logout } from "../../redux/Slices/AuthSlice"
import { setWatchHealthLinked } from "../../services/health/healthProvider"

const HelpDesk = () => {
    const { guardAccess } = useSubscriptionAccess()
    const dispatch = useDispatch()
    const [deleteAccount, { isLoading }] = useDeleteAccountMutation()
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showRateModal, setShowRateModal] = useState(false)

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount({}).unwrap()
            setShowConfirmModal(false)
            setShowSuccessModal(true)
        } catch (error) {
            console.error('Delete account failed:', error)
            setShowConfirmModal(false)
        }
    }

    const handleSuccessOk = async () => {
        setShowSuccessModal(false)
        await setWatchHealthLinked(false)
        dispatch(logout())
    }

    const HELPDESK = [
        { icon: images.helpdesk.faq, title: "FAQ's", onPress: () => navigate(ROUTES.FAQS) },
        { icon: images.helpdesk.complaint, title: "Yalla Chatbot", onPress: () => guardAccess('nutrition_chatbot', () => navigate(ROUTES.CHATBOT)) },
        { icon: images.helpdesk.wallet, title: "Wallet", onPress: () => navigate(NAVIGATORS.WALLET_STACK) },
        { icon: images.helpdesk.basic_details, title: "Basic Details", onPress: () => navigate(ROUTES.BASIC_DETAILS) },
        { icon: images.helpdesk.languages, title: "Choose Language", onPress: () => navigate(ROUTES.CHOOSE_LANGUAGE) },
        { icon: images.helpdesk.rate, title: "Rate App", onPress: () => setShowRateModal(true) },
        { icon: images.helpdesk.myposts, title: "My Posts", onPress: () => guardAccess('messaging', () => navigate(ROUTES.MY_POSTS)) },
        { icon: images.helpdesk.blocked_user, title: "Blocked User", onPress: () => navigate(ROUTES.BLOCKED_USERS) },
        ...(SUBSCRIPTIONS_PURCHASE_ENABLED
            ? [{ icon: images.helpdesk.subscription, title: "Subscription", onPress: () => navigate(ROUTES.SUBSCRIPTION) }]
            : []),
        { icon: images.helpdesk.aboutus, title: "About Us", onPress: () => navigate(ROUTES.ABOUT_US) },
        { icon: images.helpdesk.contact, title: "Contact Us", onPress: () => navigate(ROUTES.CONTACT_US) },
        { icon: images.helpdesk.trash, title: "Delete Account", color: colors.danger, onPress: () => setShowConfirmModal(true) }
    ]

    return (
        <Wrapper>
            <FlatList
                data={HELPDESK}
                renderItem={({ item }) => <HelpDeskCard {...item} />}
                numColumns={2}
                ItemSeparatorComponent={() => <Seperator />}
                columnWrapperStyle={{ gap: "3%" }}
                showsVerticalScrollIndicator={false}
            />

            {/* Confirmation Modal */}
            <AlertModal
                visible={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                type="error"
                title="Delete Account"
                message="Are you sure you want to delete your account? This action cannot be undone."
                onOk={handleDeleteAccount}
            />

            {/* Success Modal */}
            <AlertModal
                visible={showSuccessModal}
                onClose={handleSuccessOk}
                type="success"
                title="Account Deleted"
                message="Your account has been successfully deleted. You will now be logged out."
                onOk={handleSuccessOk}
            />

            {/* Rate App Modal */}
            <AlertModal
                visible={showRateModal}
                onClose={() => setShowRateModal(false)}
                type="error"
                title="Rate App"
                message="Rating will be available once the app is live on Google Play Store / App Store."
                onOk={() => setShowRateModal(false)}
            />
        </Wrapper>
    )
}

export default HelpDesk