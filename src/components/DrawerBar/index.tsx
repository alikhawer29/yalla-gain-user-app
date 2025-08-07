import { DrawerContentScrollView } from "@react-navigation/drawer"
import { View } from "react-native"
import images from "../../assets/images"
import { useModal } from "../../contexts/ModalContext"
import { useAppDispatch } from "../../hooks"
import { logout } from "../../redux/Slices/AuthSlice"
import colors from "../../utils/colors"
import { USER } from "../../utils/data"
import { heightPixel } from "../../utils/helper"
import { navigate } from "../../utils/navigation"
import { NAVIGATORS } from "../../utils/routes"
import Button from "../Button"
import Icon from "../Icon"
import Row from "../Row"
import Text from "../Text"
import styles from "./styles"

const DRAWER_ROUTES = [
    {
        title: null,
        children: [
            {
                title: "Home",
                icon: images.drawer_icons.home,
                route: NAVIGATORS.BOTTOM
            },
            {
                title: "Movement Correction with Live Camera",
                icon: images.drawer_icons.movement,
                route: NAVIGATORS.BOTTOM
            },
            {
                title: "Workout Video Content",
                icon: images.drawer_icons.workout,
                route: NAVIGATORS.BOTTOM
            },
            {
                title: "Saved Content",
                icon: images.drawer_icons.saved_content,
                route: NAVIGATORS.BOTTOM
            },
            {
                title: "Challenges",
                icon: images.drawer_icons.challenges,
                route: NAVIGATORS.BOTTOM
            },
            {
                title: "Help Center",
                icon: images.drawer_icons.help_center,
                route: NAVIGATORS.HELP_DESK_STACK
            }
        ]
    },
    {
        title: "Consultation & Booking",
        children: [
            {
                title: "Consult a Doctor",
                icon: images.drawer_icons.consult_doctor,
                route: NAVIGATORS.BOTTOM
            },
            {
                title: "Consult a Trainer",
                icon: images.drawer_icons.consult_trainer,
                route: NAVIGATORS.BOTTOM
            },
            {
                title: "My Bookings",
                icon: images.drawer_icons.my_bookings,
                route: NAVIGATORS.BOTTOM
            },
        ]
    },
    {
        title: "Connections",
        children: [
            {
                title: "Smart Watch Connect",
                icon: images.drawer_icons.watch,
                route: NAVIGATORS.BOTTOM
            },
            {
                title: "VR Connect",
                icon: images.drawer_icons.vr,
                route: NAVIGATORS.BOTTOM
            },
            {
                title: "Music Panel",
                icon: images.drawer_icons.music_panel,
                route: NAVIGATORS.MUSIC_PANEL_STACK
            },
        ]
    },
]

const DrawerBar = (props) => {

    const dispatch = useAppDispatch()
    const { showYesNoModal } = useModal()

    const onPressLogout = () => {
        showYesNoModal({
            type: "warning",
            title: "Logout",
            message: "Are you sure you want to logout?"
        }, () => dispatch(logout()))
    }

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
            <Row gap={10} align="center" style={{ marginVertical: heightPixel(24) }}>
                <View>
                    <Icon source={images.dummy} size={50} rounded no_padding />
                </View>
                <View>
                    <Text size={18} weight="bold">{USER.first_name} {USER.last_name}</Text>
                    <Row align="center" gap={3}>
                        <Text size={14}>10 Yalla Coins</Text>
                        <Icon source={images.coin} size={14} />
                    </Row>
                </View>
            </Row>
            {
                DRAWER_ROUTES.map((item) => (
                    item?.children ?
                        <>
                            {item?.title && <Text size={16} color={colors.white} style={styles.drawer_item_header}>{item.title}</Text>}
                            {
                                item?.children?.map((item) => (
                                    <Row gap={8} align="center" style={[styles.drawer_item, { backgroundColor: item?.title === "Home" ? colors.primary : colors.transparent }]} onPress={() => navigate(item.route)}>
                                        <Icon source={item?.icon} size={24} tint_color={colors.white} />
                                        <Text size={15} weight="semibold" color={colors.white}>{item.title}</Text>
                                    </Row>
                                ))
                            }
                        </> : null
                ))
            }
            <Button text="Logout" type="custom" icon={images.drawer_icons.logout} style={styles.logout_button} onPress={onPressLogout} />
        </DrawerContentScrollView>
    )
}

export default DrawerBar