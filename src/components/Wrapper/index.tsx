import { useHeaderHeight } from "@react-navigation/elements"
import { FC, memo } from "react"
import { ActivityIndicator, ScrollView, StatusBar, View } from "react-native"
import { IWrapper } from "../../interfaces"
import colors from "../../utils/colors"
import { BOTTOMBAR_HEIGHT, heightPixel, widthPixel } from "../../utils/helper"
import styles from "./styles"

const Wrapper: FC<IWrapper> = ({
    children,
    scrollable = false,
    bottom_bar = false,
    no_padding = false,
    loading = false,
}) => {
    
    const headerHeight = useHeaderHeight()    

    const container_style = [
        styles.container,
        {
            paddingTop: no_padding
                ? 0
                : headerHeight > 0
                    ? headerHeight + heightPixel(10)
                    : StatusBar.currentHeight,
            paddingBottom: heightPixel(bottom_bar ? 90 : 0) + BOTTOMBAR_HEIGHT,
            paddingHorizontal: no_padding ? 0 : widthPixel(20),
        },
    ]

    const renderBody = () =>
        loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
        ) : (
            children
        )

    return (
        <View style={container_style}>
            {scrollable ? (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scroll_content}
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
