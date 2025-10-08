import { useHeaderHeight } from "@react-navigation/elements"
import { FC, memo } from "react"
import { ActivityIndicator, ScrollView, View } from "react-native"
import { IWrapper } from "../../interfaces"
import colors from "../../utils/colors"
import { BOTTOMBAR_HEIGHT, heightPixel, widthPixel } from "../../utils/helper"
import FloatingButton from "../FloatingButton"
import styles from "./styles"

const Wrapper: FC<IWrapper> = ({
    children,
    scrollable = false,
    bottom_bar = false,
    no_padding = false,
    loading = false,
    floating = false,
}) => {

    const headerHeight = useHeaderHeight()

    const container_style = [
        styles.container,
        {
            paddingTop: heightPixel(10),
            // no_padding
            // ? 0
            //     : headerHeight > 0
            //         ? headerHeight + heightPixel(10)
            //         : StatusBar.currentHeight,
            paddingBottom: (!scrollable ? heightPixel(bottom_bar ? 90 : 0) : 0) + BOTTOMBAR_HEIGHT,
            paddingHorizontal: no_padding ? 0 : widthPixel(20),
        },
    ]

    const content_container_style = {
        paddingBottom: heightPixel(bottom_bar ? 90 : 0) + BOTTOMBAR_HEIGHT,
    }

    const renderBody = () =>
        loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
        ) : (
            children
        )

    return (
        <View style={container_style}>
            {
                floating &&
                <FloatingButton style={{ right: widthPixel(30), bottom: (heightPixel(bottom_bar ? 90 : 0) + BOTTOMBAR_HEIGHT) + 10 }} />
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
