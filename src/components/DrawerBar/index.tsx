import { CommonActions } from "@react-navigation/native"
import React from "react"
import { DrawerContentScrollView, DrawerContentComponentProps } from "@react-navigation/drawer"
import { View } from "react-native"
import images from "../../assets/images"
import { useModal } from "../../contexts/ModalContext"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { logout, selectUser } from "../../redux/Slices/AuthSlice"
import { useGetWalletCoinsQuery } from "../../redux/Apis/User"
import { deleteUnityGameUserData } from "../../utils/unityGameData"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"
import { navigationRef } from "../../utils/navigation"
import { NAVIGATORS, ROUTES } from "../../utils/routes"
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
                route: NAVIGATORS.BOTTOM,
                child: NAVIGATORS.HOME_STACK,
            },
            {
                title: "Movement Correction with Live Camera",
                icon: images.drawer_icons.movement,
                route: NAVIGATORS.WORKOUT_STACK,
                child: ROUTES.MOVEMENT_CORRECTION
            },
            {
                title: "Workout Video Content",
                icon: images.drawer_icons.workout,
                route: NAVIGATORS.WORKOUT_STACK,
                child: ROUTES.WORKOUT
            },
            {
                title: "Saved Content",
                icon: images.drawer_icons.saved_content,
                route: NAVIGATORS.WORKOUT_STACK,
                child: ROUTES.SAVED_WORKOUT_CONTENT
            },
            {
                title: "Challenges",
                icon: images.drawer_icons.challenges,
                route: NAVIGATORS.BOTTOM,
                child: NAVIGATORS.HOME_STACK,
                params: { screen: ROUTES.CHALLENGES },
            },
            {
                title: "Help Center",
                icon: images.drawer_icons.help_center,
                route: NAVIGATORS.HELP_DESK_STACK,
                child: ROUTES.HELP_DESK,
                reset: true
            }
        ]
    },
    {
        title: "Consultation & Booking",
        children: [
            {
                title: "Consult a Doctor",
                icon: images.drawer_icons.consult_doctor,
                route: NAVIGATORS.CONSULTATION_STACK,
                child: ROUTES.CONSULTANTS_LIST,
                params: { type: "doctor", title: "Consult a Doctor" }
            },
            {
                title: "Consult a Trainer",
                icon: images.drawer_icons.consult_trainer,
                route: NAVIGATORS.CONSULTATION_STACK,
                child: ROUTES.CONSULTANTS_LIST,
                params: { type: "trainer", title: "Consult a Trainer" }
            },
            {
                title: "My Bookings",
                icon: images.drawer_icons.my_bookings,
                route: NAVIGATORS.CONSULTATION_STACK,
                child: ROUTES.MY_BOOKINGS
            },
        ]
    },
    {
        title: "Connections",
        children: [
            {
                title: "Smart Watch Connect",
                icon: images.drawer_icons.watch,
                route: NAVIGATORS.BOTTOM,
                child: NAVIGATORS.HOME_STACK,
            },
            {
                title: "VR Connect",
                icon: images.drawer_icons.vr,
                route: NAVIGATORS.BOTTOM,
                child: NAVIGATORS.HOME_STACK,
            },
            {
                title: "Music Panel",
                icon: images.drawer_icons.music_panel,
                route: NAVIGATORS.MUSIC_PANEL_STACK
            },
        ]
    },
]

const DrawerBar = (props: DrawerContentComponentProps) => {

    const user = useAppSelector(selectUser)
    const dispatch = useAppDispatch()
    const { showYesNoModal } = useModal()
    const { data: walletData } = useGetWalletCoinsQuery({}, { refetchOnMountOrArgChange: true })

    const onPressLogout = () => {
        showYesNoModal({
            type: "warning",
            title: "Logout",
            message: "Are you sure you want to logout?"
        }, async () => {
            // Delete Unity game user data before logout
            try {
                await deleteUnityGameUserData();
            } catch (err) {
                console.error('Error deleting Unity game data on logout:', err);
            }
            // Dispatch logout action
            dispatch(logout());
        })
    }

    const handleNavigation = (childItem: any) => {
        if (navigationRef.isReady()) {
            // For screens that need fresh params (like ConsultantsList with different types)
            // we use navigate with a unique key to force re-mount
            if (childItem?.reset) {
                navigationRef.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [
                            {
                                name: childItem.route,
                                state: {
                                    routes: [
                                        {
                                            name: childItem.child,
                                        },
                                    ],
                                },
                            },
                        ],
                    })
                );
            } else if (childItem?.child && childItem?.params) {
                navigationRef.dispatch(
                    CommonActions.navigate({
                        name: childItem.route,
                        params: {
                            screen: childItem.child,
                            params: childItem.params,
                            initial: false,
                        },
                        key: `${childItem.route}-${childItem.child}-${JSON.stringify(childItem.params)}`,
                    })
                );
            } else if (childItem?.child) {
                navigationRef.dispatch(
                    CommonActions.navigate({
                        name: childItem.route,
                        params: { screen: childItem.child },
                    })
                );
            } else {
                navigationRef.dispatch(
                    CommonActions.navigate({ name: childItem.route })
                );
            }
        }
    }

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }} showsVerticalScrollIndicator={false}>
            <Row gap={10} align="center" style={{ marginVertical: heightPixel(24) }}>
                <View>
                    <Icon source={{ uri: user?.photo }} size={50} rounded no_padding border={colors.white} resize="cover" />
                </View>
                <View>
                    <Text size={18} weight="bold">{user?.first_name} {user?.last_name}</Text>
                    <Row align="center" gap={3}>
                        <Text size={14}>{walletData?.my_coins || 0} Yalla Coins</Text>
                        <Icon source={images.coin} size={14} />
                    </Row>
                </View>
            </Row>
            {
                DRAWER_ROUTES.map((item, index) => (
                    item?.children ?
                        <React.Fragment key={`group-${index}`}>
                            {item?.title && <Text size={16} color={colors.white} style={styles.drawer_item_header}>{item.title}</Text>}
                            {
                                item?.children?.map((childItem, childIndex) => (
                                    <Row key={`child-${index}-${childIndex}`} gap={8} align="center" style={[styles.drawer_item, { backgroundColor: childItem?.title === "Home" ? colors.primary : colors.transparent }]} onPress={() => handleNavigation(childItem)}>
                                        <Icon source={childItem?.icon} size={24} tint_color={colors.white} />
                                        <Text size={15} weight="semibold" color={colors.white}>{childItem.title}</Text>
                                    </Row>
                                ))
                            }
                        </React.Fragment> : null
                ))
            }
            <Button text="Logout" type="custom" icon={images.drawer_icons.logout} style={styles.logout_button} onPress={onPressLogout} />
        </DrawerContentScrollView>
    )
}

export default DrawerBar