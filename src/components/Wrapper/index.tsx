import { useHeaderHeight } from "@react-navigation/elements"
import { FC, memo } from "react"
import { ScrollView, StatusBar, View } from "react-native"
import { IWrapper } from "../../interfaces"
import { BOTTOMBAR_HEIGHT, heightPixel, widthPixel } from "../../utils/helper"
import styles from "./styles"

const Wrapper: FC<IWrapper> = ({ children, scrollable = false, bottom_bar = false, no_padding = false }) => {

    const headerHeight = useHeaderHeight();

    let default_style = {
        paddingTop: no_padding ? 0 : headerHeight > 0 ? headerHeight + heightPixel(10) : StatusBar.currentHeight,
    }

    let Component = scrollable ? ScrollView : View

    return (
        <View style={[styles.container, default_style, { paddingHorizontal: no_padding ? 0 : widthPixel(20) }]}>
            <Component style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: heightPixel(bottom_bar ? 90 : 0) + BOTTOMBAR_HEIGHT }} showsVerticalScrollIndicator={false}>
                {children}
            </Component>
        </View>
    )
}

export default memo(Wrapper)