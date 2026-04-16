import { FC, memo } from "react"
import { View } from "react-native"
import images from "../../../assets/images"
import { IVideoCard } from "../../../interfaces"
import colors from "../../../utils/colors"
import { capitalize, heightPixel } from "../../../utils/helper"
import globalStyles from "../../../utils/styles"

import CardWrapper from "../../CardWrapper"
import Icon from "../../Icon"
import Image from "../../Image"
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
    muscle_title = 'Muscle Title',
    exercise_title = 'Exercise Title',
    is_similar = false,
    video_count = 0,
    show_video_count = false,
    use_muscle_title = false,
}) => {
    const is_secondary = type === "secondary"
    const titleLine = is_similar
        ? exercise_title
        : use_muscle_title || (is_secondary && !is_similar)
          ? muscle_title
          : exercise_title
    const count = Number(video_count) || 0
    const showCountBadge = show_video_count && count > 0
    const countLabel =
        count === 1 ? `${count} Video` : `${count} Videos`

    return (
        <CardWrapper
            height={is_secondary || is_similar ? 230 : 362}
            width={is_secondary || is_similar ? 224 : "100%"}
            border
            color={colors.grayish_black}
            onPress={onPress}
            border_radius={is_secondary || is_similar ? 10 : 16}
        >
            <View style={styles.image_container}>
                <Image source={image} style={styles.image} resize="cover" />

                {is_video && (
                    <View style={globalStyles.overlay}>
                        <Icon
                            source={images.play}
                            size={is_secondary || is_similar ? 30 : 60}
                            rounded
                            color={colors.transparent_primary}
                            tint_color={colors.white}
                        />
                    </View>
                )}

                {showCountBadge && (
                    <View
                        style={[
                            styles.video_count_badge,
                            onSave &&
                                ((is_secondary || is_similar)
                                    ? styles.video_count_badge_offset_secondary
                                    : styles.video_count_badge_offset_save),
                        ]}
                        pointerEvents="none"
                    >
                        <Text size={12} weight="semibold" color={colors.white}>
                            {countLabel}
                        </Text>
                    </View>
                )}

                {onSave && (
                    <Touchable
                        style={[
                            styles.save_icon,
                            (is_secondary || is_similar) && styles.secondary_save_icon,
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
                    {
                        padding: heightPixel(is_secondary || is_similar ? 8 : 16)
                    },
                ]}
            >
                <Text
                    weight="semibold"
                    lines={1}
                    size={is_secondary || is_similar ? 14 : 20}
                >
                    {capitalize(titleLine)}
                </Text>

                <Text
                    weight={is_secondary || is_similar ? "semibold" : "regular"}
                    size={is_secondary || is_similar ? 11 : 16}
                    line_height={17}
                    lines={is_secondary || is_similar ? 3 : 4}
                >
                    {description}
                </Text>


            </View>
        </CardWrapper>
    )
}

export default memo(VideoCard)
