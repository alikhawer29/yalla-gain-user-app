import React, { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StackNavigationOptions, StackNavigationProp } from "@react-navigation/stack"
import { RouteProp } from "@react-navigation/native"
import images from "../../assets/images"
import Icon from "../../components/Icon"
import Image from "../../components/Image"
import Text from "../../components/Text"
import Touchable from "../../components/Touchable"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"
import { goBack, navigate, navigateToBookingDetails } from "../../utils/navigation"
import { ROUTES, ROUTES_OPTIONS } from "../../utils/routes"
import { useGetNotificationsQuery } from "../../redux/Apis/User"

/** Header bell outline when there are unread notifications */
const NOTIFICATION_UNREAD_OUTLINE = "#118076"

interface OptionsProps {
  route?: RouteProp<any, any> | {
    name?: string
    params?: {
      title?: string
      returnToBookingId?: number
    }
  }
  navigation?: StackNavigationProp<any, any> | {
    openDrawer?: () => void
  }
}

function OptionsHeader(props: OptionsProps) {
  const routeName = (props?.route as any)?.name
  const route = ROUTES_OPTIONS.find(item => item.route_name === routeName)
  const showNotificationsBell = route?.right === "notifications"

  const { data: unreadListPayload } = useGetNotificationsQuery(
    { status: "unread", page: 1, per_page: 1 },
    { skip: !showNotificationsBell },
  )


  const hasUnreadNotifications = useMemo(() => {
    if (!showNotificationsBell || !unreadListPayload) return false
    const payload = unreadListPayload as {
      meta?: { total?: number }
      data?: unknown[]
      unread_count?: number
    }
    if (typeof payload.unread_count === "number") return payload.unread_count > 0
    if (typeof payload.meta?.total === "number") return payload.meta.total > 0
    const rows = payload.data
    return Array.isArray(rows) && rows.length > 0
  }, [showNotificationsBell, unreadListPayload])

  const handleLeftPress = () => {
    if (route?.left === "back") {
      const returnToBookingId = props?.route?.params?.returnToBookingId
      if (
        (props?.route as { name?: string })?.name === ROUTES.CHAT_DETAILS &&
        returnToBookingId
      ) {
        navigateToBookingDetails(Number(returnToBookingId))
        return
      }
      goBack()
    } else if (route?.left === "drawer") {
      const nav = props?.navigation as any
      nav?.openDrawer?.()
    }
  }

  const handleRightPress = () => {
    if (routeName === ROUTES.CHATBOT) {
      navigate(ROUTES.CHATBOT_HISTORY)
      return
    }
    if (route?.right === "notifications") {
      navigate(ROUTES.NOTIFICATIONS)
    }
  }

  const renderLeft = () => {
    const leftKey = route?.left
    const icon_source = leftKey && leftKey !== null ? images[leftKey as keyof typeof images] : null
    if (!icon_source) return <View style={styles.sideSpace} />

    return (
      <Touchable onPress={handleLeftPress} style={styles.sideSpace}>
        <Icon
          source={icon_source}
          border={colors.white}
          size={40}
          rounded
          less_rounded
          less_padding
        />
      </Touchable>
    )
  }

  const renderRight = () => {
    const rightKey = route?.right
    const icon_source = rightKey && rightKey !== null ? images[rightKey as keyof typeof images] : null
    if (!icon_source) return <View style={styles.sideSpace} />

    const bellUnread =
      rightKey === "notifications" && hasUnreadNotifications
    const bellBorder = bellUnread ? NOTIFICATION_UNREAD_OUTLINE : colors.white
    const bellTint = bellUnread ? NOTIFICATION_UNREAD_OUTLINE : undefined

    return (
      <Touchable onPress={handleRightPress} style={styles.sideSpace}>
        <View style={styles.bellWrap}>
          <Icon
            source={icon_source}
            border={bellBorder}
            tint_color={bellTint}
            size={40}
            rounded
            less_rounded
            less_padding
          />
          {bellUnread ? (
            <View style={styles.unreadDot} accessibilityLabel="Unread notifications" />
          ) : null}
        </View>
      </Touchable>
    )
  }

  const renderTitle = () => {
    const headerTitle =
      props?.route?.params?.title ||
      (route && 'title' in route ? route.title : undefined) ||
      '';

    return route?.logo ? (
      <Image style={styles.logo} source={images.logo} />
    ) : (
      <View style={styles.titleWrap}>
        <Text
          lines={2}
          line_height={28}
          style={styles.title}
          color={colors.white}
          weight="semibold"
          size={22}
          position="center"
        >
          {headerTitle}
        </Text>
      </View>
    )
  }

  const isTransparent = (route && 'transparent' in route ? route.transparent : false) || false

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safeArea,
        { backgroundColor: isTransparent ? colors.transparent : colors.black }
      ]}
    >
      <View style={styles.container}>
        {renderLeft()}
        <View style={styles.center}>{renderTitle()}</View>
        {renderRight()}
      </View>
    </SafeAreaView>
  )
}

const Options = (props: OptionsProps): StackNavigationOptions => {
  const routeName = (props?.route as any)?.name
  const route = ROUTES_OPTIONS.find(item => item.route_name === routeName)
  const isTransparent = (route && 'transparent' in route ? route.transparent : false) || false

  return {
    headerShown: true,
    headerTransparent: isTransparent,
    header: () => <OptionsHeader {...props} />,
  }
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.transparent,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.transparent,
    paddingHorizontal: widthPixel(20),
    paddingVertical: 8,
  },
  sideSpace: {
    // width: widthPixel(40),
    width: widthPixel(40),
    justifyContent: "center",
    alignItems: "center",
    /** Above centered title so long titles never paint over drawer/back (same row, draw order). */
    zIndex: 101,
  },
  bellWrap: {
    position: "relative",
    width: widthPixel(40),
    height: widthPixel(40),
    justifyContent: "center",
    alignItems: "center",
  },
  /** High-contrast unread indicator on the bell (works on dark / transparent headers). */
  unreadDot: {
    position: "absolute",
    top: heightPixel(4),
    right: widthPixel(4),
    width: heightPixel(10),
    height: heightPixel(10),
    borderRadius: heightPixel(5),
    backgroundColor: NOTIFICATION_UNREAD_OUTLINE,
    borderWidth: heightPixel(2),
    borderColor: colors.white,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    zIndex: 0,
    maxWidth: "80%",
    height: heightPixel(62),
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    width: "100%",
    textAlign: "center",
    textAlignVertical: "center",
  },
  logo: {
    width: heightPixel(62),
    height: heightPixel(62),
    resizeMode: "contain",
    zIndex: 99,
  },
})

export default Options
