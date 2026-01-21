import { FC, memo } from "react"
import { View } from "react-native"
import images from "../../../assets/images"
import { IVideoCard } from "../../../interfaces"
import colors from "../../../utils/colors"
import { heightPixel } from "../../../utils/helper"
import globalStyles from "../../../utils/styles"

import CardWrapper from "../../CardWrapper"
import Icon from "../../Icon"
import Image from "../../Image"
import Row from "../../Row"
import Text from "../../Text"
import Touchable from "../../Touchable"
import styles from "./styles"

const VideoCard: FC<IVideoCard> = ({
    image,
    title,
    description,
    created_at,
    language,
    is_saved = false,
    type = "primary",
    onSave,
    onPress,
    is_video = true,
}) => {
    const is_secondary = type === "secondary"

    return (
        <CardWrapper
            height={is_secondary ? 230 : 362}
            width={is_secondary ? 224 : "100%"}
            border
            color={colors.grayish_black}
            onPress={onPress}
            border_radius={is_secondary ? 10 : 16}
        >
            <View style={styles.image_container}>
                <Image source={image} style={styles.image} resize="cover" />

                {is_video && (
                    <View style={globalStyles.overlay}>
                        <Icon
                            source={images.play}
                            size={is_secondary ? 30 : 60}
                            rounded
                            color={colors.transparent_primary}
                            tint_color={colors.white}
                        />
                    </View>
                )}

                {onSave && (
                    <Touchable
                        style={[
                            styles.save_icon,
                            is_secondary && styles.secondary_save_icon,
                        ]}
                        onPress={onSave}
                    >
                        <Icon
                            source={images.save}
                            tint_color={is_saved ? colors.white : colors.primary}
                            color={is_saved ? colors.primary : colors.white}
                            rounded
                        />
                    </Touchable>
                )}
            </View>

            <View
                style={[
                    styles.content_container,
                    { padding: heightPixel(is_secondary ? 8 : 16) },
                ]}
            >
                <Text
                    weight="semibold"
                    lines={1}
                    size={is_secondary ? 14 : 20}
                >
                    {title}
                </Text>

                <Row align="center" justify="space-between">
                    <Row align="center" gap={is_secondary ? 6 : 8}>
                        <Icon source={images.calendar} size={is_secondary ? 12 : 19} />
                        <Text size={is_secondary ? 12 : 19}>{created_at}</Text>
                    </Row>

                    {language && (
                        <Row align="center" gap={is_secondary ? 6 : 8}>
                            <Icon source={images.globe} size={is_secondary ? 12 : 19} />
                            <Text size={is_secondary ? 12 : 19} capitalize>
                                {language}
                            </Text>
                        </Row>
                    )}
                </Row>

                <Text
                    weight={is_secondary ? "semibold" : "regular"}
                    size={is_secondary ? 11 : 16}
                    line_height={17}
                    lines={2}
                >
                    {description}
                </Text>
            </View>
        </CardWrapper>
    )
}

export default memo(VideoCard)
