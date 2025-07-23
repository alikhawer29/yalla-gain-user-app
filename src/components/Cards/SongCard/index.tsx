import { FC, memo } from "react"
import { View } from "react-native"
import { ISongCard } from "../../../interfaces"
import colors from "../../../utils/colors"
import Image from "../../Image"
import Row from "../../Row"
import Text from "../../Text"
import styles from "./styles"

const SongCard: FC<ISongCard> = ({ icon, title, artist, onPress }) => {
    return (
        <Row align="center" gap={10} onPress={onPress}>
            <Image source={icon} style={styles.image} />
            <View>
                <Text weight="semibold" size={14}>
                    {title}
                </Text>
                <Text weight="semibold" size={12} color={colors.gray}>
                    {artist}
                </Text>
            </View>
        </Row>
    )
}

export default memo(SongCard)