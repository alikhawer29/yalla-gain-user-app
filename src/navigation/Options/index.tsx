import React from "react"
import { StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import images from "../../assets/images"
import Icon from "../../components/Icon"
import Image from "../../components/Image"
import Text from "../../components/Text"
import Touchable from "../../components/Touchable"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"
import { goBack } from "../../utils/navigation"
import { ROUTES_OPTIONS } from "../../utils/routes"

const Options = (props) => {

  const route = ROUTES_OPTIONS.find(item => item.route_name === props?.route?.name)

  const handleLeftPress = () => {
    if (route?.left === "back") {
      goBack()
    } else if (route?.left === "drawer") {
      props?.navigation.openDrawer()
    }
  }

  const renderLeft = () => {
    const icon_source = route?.left ? images[route?.left] : null
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
    const icon_source = route?.right ? images[route?.right] : null
    if (!icon_source) return <View style={styles.sideSpace} />

    return (
      <View style={styles.sideSpace}>
        <Icon
          source={images.notifications}
          border={colors.white}
          size={40}
          rounded
          less_rounded
          less_padding
        />
      </View>
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
        {route?.title || props?.route?.params?.title}
      </Text>
    )
  }

  return {
    headerShown: true,
    headerTransparent: route?.transparent || false,
    header: () => (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
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