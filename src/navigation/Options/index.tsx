import React from "react"
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
import { goBack, navigate } from "../../utils/navigation"
import { ROUTES, ROUTES_OPTIONS } from "../../utils/routes"

interface OptionsProps {
  route?: RouteProp<any, any> | {
    name?: string
    params?: {
      title?: string
    }
  }
  navigation?: StackNavigationProp<any, any> | {
    openDrawer?: () => void
  }
}

const Options = (props: OptionsProps): StackNavigationOptions => {

  const routeName = (props?.route as any)?.name
  const route = ROUTES_OPTIONS.find(item => item.route_name === routeName)

  const handleLeftPress = () => {
    if (route?.left === "back") {
      goBack()
    } else if (route?.left === "drawer") {
      const nav = props?.navigation as any
      nav?.openDrawer?.()
    }
  }

  const handleRightPress = () => {
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

    return (
      <Touchable onPress={handleRightPress} style={styles.sideSpace}>
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

  const renderTitle = () => {
    return route?.logo ? (
      <Image style={styles.logo} source={images.logo} />
    ) : (
      <Text
        lines={2}
        line_height={28}
        style={styles.title}
        color={colors.white}
        weight="semibold"
        size={22}
        position="center"
      >
        {(route && 'title' in route ? route.title : undefined) || props?.route?.params?.title || ''}
      </Text>
    )
  }

  const isTransparent = (route && 'transparent' in route ? route.transparent : false) || false

  return {
    headerShown: true,
    headerTransparent: isTransparent,
    header: () => (
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
    ),
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
    zIndex: 99,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    zIndex: 99,
    textAlign: "center",
    maxWidth: "80%",
  },
  logo: {
    width: heightPixel(62),
    height: heightPixel(62),
    resizeMode: "contain",
    zIndex: 99,
  },
})

export default Options