import { useHeaderHeight } from "@react-navigation/elements"
import { FC, memo } from "react"
import { ActivityIndicator, ScrollView, View } from "react-native"
import images from "../../assets/images"
import { IWrapper } from "../../interfaces"
import colors from "../../utils/colors"
import { BOTTOMBAR_HEIGHT, heightPixel, widthPixel } from "../../utils/helper"
import FloatingButton from "../FloatingButton"
import Image from "../Image"
import styles from "./styles"

const Wrapper: FC<IWrapper> = ({
    children,
    scrollable = false,
    bottom_bar = false,
    no_padding = false,
    loading = false,
    floating = false,
    hide_bottom_bar = false,
}) => {

    const headerHeight = useHeaderHeight()
    const bottomBarPadding = hide_bottom_bar ? 0 : BOTTOMBAR_HEIGHT;

    const container_style = [
        styles.container,
        {
            paddingTop: heightPixel(10),
            // no_padding
            // ? 0
            //     : headerHeight > 0
            //         ? headerHeight + heightPixel(10)
            //         : StatusBar.currentHeight,
            paddingBottom: (!scrollable ? heightPixel(bottom_bar ? 90 : 0) : 0) + bottomBarPadding,
            paddingHorizontal: no_padding ? 0 : widthPixel(20),
        },
    ]

    const content_container_style = {
        paddingBottom: heightPixel(bottom_bar ? 90 : 0) + bottomBarPadding,
    }

    const renderBody = () =>
        loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
        ) : (
            children
        )

    return (
        <View style={container_style}>
            <View style={styles.left_image} >
                <Image source={images.left_light} />
            </View>
            <View style={styles.bg_image} >
                <Image source={images.center_light} />
            </View>
            <View style={styles.right_image} >
                <Image source={images.right_light} />
            </View>
            {
                floating &&
                <FloatingButton style={{ right: widthPixel(30), bottom: (heightPixel(bottom_bar ? 90 : 0) + bottomBarPadding) + 10 }} />
            }
            {scrollable ? (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={[styles.scroll_content, content_container_style]}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    {renderBody()}
                </ScrollView>
            ) : (
                <View style={styles.body}>{renderBody()}</View>
            )}
        </View>
    )
}

export default memo(Wrapper)
