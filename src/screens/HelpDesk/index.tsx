import { FlatList } from "react-native"
import images from "../../assets/images"
import HelpDeskCard from "../../components/Cards/HelpDeskCard"
import Seperator from "../../components/Seperator"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"

const HELPDESK = [
    { icon: images.helpdesk.faq, title: "FAQ's" },
    { icon: images.helpdesk.complaint, title: "Yalla Chatbot", onPress: () => navigate(ROUTES.CHATBOT) },
    { icon: images.helpdesk.wallet, title: "Wallet" },
    { icon: images.helpdesk.basic_details, title: "Basic Details" },
    { icon: images.helpdesk.languages, title: "Choose Language" },
    { icon: images.helpdesk.rate, title: "Rate App" },
    { icon: images.helpdesk.myposts, title: "My Posts" },
    { icon: images.helpdesk.blocked_user, title: "Blocked User" },
    { icon: images.helpdesk.subscription, title: "Subscription", onPress: () => navigate(ROUTES.SUBSCRIPTION) },
    { icon: images.helpdesk.aboutus, title: "About Us" },
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