import { FlatList } from "react-native"
import HelpDeskCard from "../../components/Cards/HelpDeskCard"
import Wrapper from "../../components/Wrapper"
import Seperator from "../../components/Seperator"
import colors from "../../utils/colors"
import images from "../../assets/images"

const HELPDESK = [
    { icon: images.helpdesk.faq, title: "FAQ's" },
    { icon: images.helpdesk.complaint, title: "Complain Chat Bot" },
    { icon: images.helpdesk.wallet, title: "Wallet" },
    { icon: images.helpdesk.basic_details, title: "Basic Details" },
    { icon: images.helpdesk.languages, title: "Choose Language" },
    { icon: images.helpdesk.rate, title: "Rate App" },
    { icon: images.helpdesk.myposts, title: "My Posts" },
    { icon: images.helpdesk.blocked_user, title: "Blocked User" },
    { icon: images.helpdesk.subscription, title: "Subscription" },
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
            />

        </Wrapper>
    )
}

export default HelpDesk