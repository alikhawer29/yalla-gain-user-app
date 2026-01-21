import { FlatList } from "react-native"
import images from "../../assets/images"
import HelpDeskCard from "../../components/Cards/HelpDeskCard"
import Seperator from "../../components/Seperator"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { navigate } from "../../utils/navigation"
import { ROUTES, NAVIGATORS } from "../../utils/routes"

const HELPDESK = [
    { icon: images.helpdesk.faq, title: "FAQ's", onPress: () => navigate(ROUTES.FAQS) },
    { icon: images.helpdesk.complaint, title: "Yalla Chatbot", onPress: () => navigate(ROUTES.CHATBOT) },
    { icon: images.helpdesk.wallet, title: "Wallet", onPress: () => navigate(NAVIGATORS.WALLET_STACK) },
    { icon: images.helpdesk.basic_details, title: "Basic Details", onPress: () => navigate(ROUTES.BASIC_DETAILS) },
    { icon: images.helpdesk.languages, title: "Choose Language", onPress: () => navigate(ROUTES.CHOOSE_LANGUAGE) },
    { icon: images.helpdesk.rate, title: "Rate App" },
    { icon: images.helpdesk.myposts, title: "My Posts", onPress: () => navigate(ROUTES.MY_POSTS) },
    { icon: images.helpdesk.blocked_user, title: "Blocked User", onPress: () => navigate(ROUTES.BLOCKED_USERS) },
    { icon: images.helpdesk.subscription, title: "Subscription", onPress: () => navigate(ROUTES.SUBSCRIPTION) },
    { icon: images.helpdesk.aboutus, title: "About Us", onPress: () => navigate(ROUTES.ABOUT_US) },
    { icon: images.helpdesk.contact, title: "Contact Us" },
    { icon: images.helpdesk.trash, title: "Delete Account", color: colors.danger }
]

const HelpDesk = () => {
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
        </Wrapper>
    )
}

export default HelpDesk