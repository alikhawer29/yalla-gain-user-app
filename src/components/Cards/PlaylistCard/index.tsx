import { FC, memo } from "react"
import { IPlaylistCard } from "../../../interfaces"
import colors from "../../../utils/colors"
import CardWrapper from "../../CardWrapper"
import Image from "../../Image"
import Row from "../../Row"
import Text from "../../Text"
import styles from "./styles"

const PlaylistCard: FC<IPlaylistCard> = ({ icon, title, onPress }) => {
    return (
        <CardWrapper height={90} padding={8} color={colors.blackish_gray} onPress={onPress}>
            <Row align="center" gap={10} style={styles.row_container}>
                <Image source={icon} style={styles.image} />
                <Text weight="semibold" size={18}>
                    {title}
                </Text>
            </Row>
        </CardWrapper>
    )
}

export default memo(PlaylistCard)