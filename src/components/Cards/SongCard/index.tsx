import { FC, memo } from "react"
import { View } from "react-native"
import { ISongCard } from "../../../interfaces"
import colors from "../../../utils/colors"
import Image from "../../Image"
import Loader from "../../Loader"
import Row from "../../Row"
import Text from "../../Text"
import styles from "./styles"

const SongCard: FC<ISongCard> = ({ icon, title, artist, onPress, active = false }) => {
    return (
        <Row align="center" gap={5} onPress={onPress}>
            <View style={{ flex: 0.2 }}>
                <Image source={icon} style={styles.image} />
            </View>
            <View style={{ flex: active ? 0.7 : 0.8 }}>
                <Text weight="semibold" size={16} lines={1} color={active ? colors.light_green : colors.white}>
                    {title}
                </Text>
                <Text weight="semibold" size={12} color={active ? colors.light_green : colors.gray} lines={1}>
                    {artist}
                </Text>
            </View>
            {
                active &&
                <View style={{ flex: 0.1 }}>
                    <Loader type="LineScalePulseOutRapid" color={colors.light_green} />
                </View>
            }
        </Row>
    )
}

export default memo(SongCard)