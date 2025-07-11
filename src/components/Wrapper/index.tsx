import { useHeaderHeight } from "@react-navigation/elements"
import { FC, memo } from "react"
import { ScrollView, StatusBar, View } from "react-native"
import images from "../../assets/images"
import { IWrapper } from "../../interfaces"
import { BOTTOMBAR_HEIGHT, heightPixel } from "../../utils/helper"
import Image from "../Image"
import styles from "./styles"

const Wrapper: FC<IWrapper> = ({ children, scrollable = false, bottom_bar = false }) => {

    const headerHeight = useHeaderHeight();

    let default_style = {
        paddingTop: headerHeight > 0 ? headerHeight + heightPixel(10) : StatusBar.currentHeight,
    }

    let Component = scrollable ? ScrollView : View

    return (
        <View style={[styles.container, default_style]}>
            <View style={styles.left_image} >
                <Image source={images.left_light} />
            </View>
            <View style={styles.bg_image} >
                <Image source={images.center_light} />
            </View>
            <View style={styles.right_image} >
                <Image source={images.right_light} />
            </View>
            <Component style={{ flex: 1, zIndex: 99 }} contentContainerStyle={{ paddingBottom: heightPixel(bottom_bar ? 90 : 0) + BOTTOMBAR_HEIGHT }}>
                {children}
            </Component>
        </View>
    )
}

export default memo(Wrapper)