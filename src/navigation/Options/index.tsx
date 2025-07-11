import { View } from "react-native";
import images from "../../assets/images";
import Icon from "../../components/Icon";
import Image from "../../components/Image";
import Text from "../../components/Text";
import Touchable from "../../components/Touchable";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";
import { goBack } from "../../utils/navigation";
import { ROUTES_OPTIONS } from "../../utils/routes";

const Options = (props) => {

  const renderLeft = () => {

    const route = ROUTES_OPTIONS.find(item => item.route_name === props?.route?.name)
    const icon_source = route?.left ? images[route?.left] : null

    const onPress = () => {
      console.log('DSAdasdsa');

      if (route?.left === "back") {
        goBack()
      }
    }

    if (icon_source) {
      return (
        <Touchable onPress={onPress} style={{ zIndex: 99, borderWidth: 0.5, borderColor: colors.white, height: heightPixel(40), width: heightPixel(40), borderRadius: heightPixel(12), justifyContent: "center", alignItems: "center", marginLeft: widthPixel(10), padding: heightPixel(10) }}>
          <Icon source={icon_source} size={"100%"} />
        </Touchable>
      )
    }

    return null

  };

  const renderRight = () => {

    const route = ROUTES_OPTIONS.find(item => item.route_name === props?.route?.name)
    const icon_source = route?.right ? images[route?.right] : null

    if (icon_source) {
      return (
        <View style={{ borderWidth: 0.5, borderColor: colors.white, height: heightPixel(40), width: heightPixel(40), borderRadius: heightPixel(12), justifyContent: "center", alignItems: "center", marginRight: widthPixel(10), padding: heightPixel(10) }}>
          <Icon source={images.notifications} size={"100%"} />
        </View>
      )
    }

    return null

  };

  const renderTitle = () => {

    const route = ROUTES_OPTIONS.find(item => item.route_name === props?.route?.name)

    return (
      route?.logo ?
        <Image style={{ width: widthPixel(85), zIndex: 99 }} source={images.logo} /> :
        <Text line_height={40} style={{ zIndex: 99 }} color={colors.white} weight="semibold" size={24}>
          {route?.title}
        </Text>
    )
  }

  return {
    headerShown: true,
    headerTransparent: true,
    headerStyle: {
      backgroundColor: colors.transparent,
      zIndex: 99
    },
    headerTitleAlign: 'center',
    headerTitle: renderTitle,
    headerLeft: renderLeft,
    headerRight: renderRight,
  };
}

export default Options